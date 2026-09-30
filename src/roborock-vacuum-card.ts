import {
    html,
    LitElement,
    nothing,
    type CSSResultGroup,
    type PropertyValues,
    type TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { getCurrentDocumentLanguage, localize } from './translations/localize';
import vacuumImage from './assets/roborock-vacuum.png';
import { animationStyles, cardStyles } from './styles';
import {
    ACTION_ICONS_MAP,
    ACTION_FEATURES,
    CARD_TYPE,
    DISABLED_BY_ACTION,
    ROBOROCK_ATTENTION,
    ROBOROCK_DETAILS,
    ROBOROCK_STATUS_MAP,
    STATE_MAP,
    VacuumFeature,
} from './constants';
import type {
    CardAction,
    HassEntity,
    RoborockVacuumCardConfig,
    VisualState,
} from './types';

const computeVisualState = (stateObj: HassEntity | undefined): VisualState => {
    if (!stateObj) return 'idle';

    const rawState = stateObj.attributes.metrics?.raw_state;

    return (
        STATE_MAP[stateObj.state] ??
        (typeof rawState === 'string' ? STATE_MAP[rawState] : undefined) ??
        'idle'
    );
};

const relatedEntityId = (entityId: string, domain: string, suffix: string): string =>
    `${domain}.${entityId.slice('vacuum.'.length)}_${suffix}`;

const entityState = (stateObj: HassEntity | undefined): string | undefined => {
    if (!stateObj || ['unknown', 'unavailable'].includes(stateObj.state))
        return undefined;

    return stateObj.state;
};

const supportedFeatures = (stateObj: HassEntity | undefined): number => {
    const value = stateObj?.attributes.supported_features;

    return typeof value === 'number' ? value : 0;
};

const hasFeature = (stateObj: HassEntity | undefined, feature: VacuumFeature): boolean =>
    (supportedFeatures(stateObj) & feature) !== 0;

const batteryIcon = (battery: number, isCharging: boolean): string => {
    if (battery <= 5) {
        return isCharging ? 'mdi:battery-charging-outline' : 'mdi:battery-outline';
    }

    const level = Math.round(battery / 10) * 10;

    return `mdi:battery${isCharging ? '-charging' : ''}-${String(level)}`;
};

const numericValue = (value: unknown): number | undefined => {
    if (typeof value !== 'number' && typeof value !== 'string') return undefined;

    const number = Number(value);

    return Number.isFinite(number) ? number : undefined;
};

const batteryLevel = (
    stateObj: HassEntity | undefined,
    batterySensor: HassEntity | undefined,
): number | undefined => {
    const battery = [
        stateObj?.attributes.battery,
        stateObj?.attributes.battery_level,
        entityState(batterySensor),
    ]
        .map(numericValue)
        .find((value) => value !== undefined);

    if (battery === undefined) return undefined;

    return Math.max(0, Math.min(100, Math.round(battery)));
};

const formatRelativeTime = (dateIso: string | undefined, language?: string): string => {
    if (!dateIso) return '';

    const date = new Date(dateIso);
    const diffMs = Date.now() - date.getTime();

    if (Number.isNaN(diffMs)) return '';

    const minutes = Math.max(0, Math.round(diffMs / 60_000));

    if (minutes < 1) {
        return localize('card.just_now', language);
    }

    if (minutes < 60) {
        return localize('card.minutes_ago', language, {
            count: minutes,
        });
    }

    const hours = Math.round(minutes / 60);

    if (hours < 24) {
        return localize('card.hours_ago', language, {
            count: hours,
        });
    }

    const days = Math.round(hours / 24);

    return localize('card.days_ago', language, {
        count: days,
    });
};

const iconForAction = (action: CardAction): string => ACTION_ICONS_MAP[action];

const actionLabel = (action: CardAction, language?: string): string =>
    localize(`actions.${action}`, language);

const actionDisabled = (action: CardAction, visualState: VisualState): boolean => {
    if (visualState === 'idle') return true;

    return DISABLED_BY_ACTION[action](visualState);
};

const openMoreInfo = (element: HTMLElement, entityId: string): void => {
    element.dispatchEvent(
        new CustomEvent('hass-more-info', {
            bubbles: true,
            composed: true,
            detail: { entityId },
        }),
    );
};

@customElement(CARD_TYPE)
export class RoborockVacuumCard extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private config?: RoborockVacuumCardConfig;

    @state() private isCallingService = false;

    private pendingEntityState: string | undefined;

    private static readonly DEFAULT_CONFIG = {
        show_battery: true,
        show_controls: true,
        show_last_changed: true,
        show_name: true,
    } satisfies Partial<RoborockVacuumCardConfig>;

    public setConfig(config: RoborockVacuumCardConfig): void {
        const language = getCurrentDocumentLanguage();

        if (!config.entity) {
            throw new Error(localize('errors.entity_required', language));
        }

        if (!config.entity.startsWith('vacuum.')) {
            throw new Error(localize('errors.invalid_entity', language));
        }

        this.config = {
            ...RoborockVacuumCard.DEFAULT_CONFIG,
            ...config,
        };
    }

    public getCardSize(): number {
        return 3;
    }

    public static getStubConfig(
        hass: HomeAssistant,
        entities: string[] = [],
        entitiesFallback: string[] = [],
    ): Partial<RoborockVacuumCardConfig> {
        const vacuumEntity =
            entities.find((entityId) => entityId.startsWith('vacuum.')) ??
            entitiesFallback.find((entityId) => entityId.startsWith('vacuum.')) ??
            Object.keys(hass.states).find((entityId) => entityId.startsWith('vacuum.')) ??
            '';

        return {
            entity: vacuumEntity,
            ...RoborockVacuumCard.DEFAULT_CONFIG,
        };
    }

    public static getConfigForm(): object {
        const language = getCurrentDocumentLanguage();

        return {
            schema: [
                {
                    name: 'entity',
                    required: true,
                    selector: { entity: { domain: 'vacuum' } },
                },
                { name: 'name', selector: { text: {} } },
                { name: 'show_battery', selector: { boolean: {} } },
                { name: 'show_last_changed', selector: { boolean: {} } },
                { name: 'show_controls', selector: { boolean: {} } },
                { name: 'show_name', selector: { boolean: {} } },
            ],
            computeLabel: (schema: { name: string }): string => {
                const translationKeys: Record<string, string> = {
                    entity: 'common.entity',
                    name: 'common.name',
                    show_battery: 'config.show_battery',
                    show_last_changed: 'config.show_last_changed',
                    show_controls: 'config.show_controls',
                    show_name: 'config.show_name',
                };

                const translationKey = translationKeys[schema.name];

                return translationKey ? localize(translationKey, language) : schema.name;
            },
        };
    }

    protected override render(): TemplateResult {
        const entityId = this.config?.entity;
        const stateObj = entityId ? this.hass?.states[entityId] : undefined;
        const batterySensor = entityId
            ? this.hass?.states[relatedEntityId(entityId, 'sensor', 'battery')]
            : undefined;
        const statusSensor = entityId
            ? this.hass?.states[relatedEntityId(entityId, 'sensor', 'status')]
            : undefined;
        const status = entityState(statusSensor);
        const visualState = status
            ? (ROBOROCK_STATUS_MAP[status] ?? 'idle')
            : computeVisualState(stateObj);
        const isCharging = status === 'charging' || stateObj?.state === 'charging';
        const battery = batteryLevel(stateObj, batterySensor);
        const details = entityId ? this.getRoborockDetails(entityId) : [];
        const attention = entityId ? this.getRoborockAttention(entityId) : undefined;
        const name = this.config?.name ?? stateObj?.attributes.friendly_name ?? entityId;
        const stateText =
            this.hass && stateObj
                ? (
                      this.hass as HomeAssistant & {
                          formatEntityState(stateObj: HassEntity, state?: string): string;
                      }
                  ).formatEntityState(stateObj)
                : localize('card.entity_not_found', this.hass?.language);
        const lastChanged = formatRelativeTime(
            stateObj?.last_changed,
            this.hass?.language,
        );

        return html`
            <ha-card>
                <button
                    class="content"
                    type="button"
                    aria-label=${localize('card.open_more_info', this.hass?.language, {
                        name: name ?? '',
                    })}
                    @click=${() => entityId && openMoreInfo(this, entityId)}
                >
                    <div class="top-row">
                        ${
                            this.config?.show_battery !== false && battery !== undefined
                                ? html`<div
                                      class="battery"
                                      title=${localize('card.battery', this.hass?.language)}
                                  >
                                      <ha-icon
                                          icon=${batteryIcon(battery, isCharging)}
                                      ></ha-icon>
                                      <span>${battery}%</span>
                                  </div>`
                                : html`<span></span>`
                        }
                    </div>
                    <div
                        class="state-text ${visualState === 'error' ? 'state-text--error' : ''}"
                    >
                        ${stateText}
                    </div>
                    ${
                        attention
                            ? html`<div
                                  class="attention attention--${attention.severity}"
                              >
                                  <ha-icon icon=${attention.icon}></ha-icon>
                                  <span>${attention.message}</span>
                              </div>`
                            : nothing
                    }
                    ${
                        !attention &&
                        this.config?.show_last_changed !== false &&
                        lastChanged
                            ? html`<div class="updated">${lastChanged}</div>`
                            : nothing
                    }
                    ${this.renderVacuumImage(visualState)}
                    ${this.config?.show_name !== false ? html`<div class="name">${name}</div>` : nothing}
                    ${
                        details.length
                            ? html`<div class="details">
                                  ${details.map(
                                      (detail) =>
                                          html`<div class="detail">
                                              <ha-icon icon=${detail.icon}></ha-icon>
                                              <span class="detail-label"
                                                  >${detail.label}</span
                                              >
                                              <span class="detail-value"
                                                  >${detail.value}</span
                                              >
                                          </div>`,
                                  )}
                              </div>`
                            : nothing
                    }
                </button>
                ${
                    this.config?.show_controls !== false && entityId
                        ? html`<div class="actions">
                              ${this.renderActions(stateObj, visualState, entityId)}
                          </div>`
                        : nothing
                }
            </ha-card>
        `;
    }

    private getRoborockDetails(
        entityId: string,
    ): { icon: string; label: string; value: string }[] {
        if (!this.hass) return [];

        return ROBOROCK_DETAILS.flatMap((detail) => {
            const entity =
                this.hass?.states[
                    relatedEntityId(entityId, detail.domain, detail.suffix)
                ];

            return entityState(entity) === undefined
                ? []
                : [
                      {
                          icon: detail.icon,
                          label: localize(
                              `details.${detail.labelKey}`,
                              this.hass?.language,
                          ),
                          value: this.formatEntityState(entity),
                      },
                  ];
        });
    }

    private getRoborockAttention(
        entityId: string,
    ): { icon: string; message: string; severity: 'warning' | 'error' } | undefined {
        if (!this.hass) return undefined;

        for (const attention of ROBOROCK_ATTENTION) {
            const entity =
                this.hass.states[
                    relatedEntityId(entityId, attention.domain, attention.suffix)
                ];
            const state = entityState(entity);
            const active = attention.activeState
                ? state === attention.activeState
                : state !== undefined && !attention.inactiveStates?.includes(state);

            if (active) {
                return {
                    icon: attention.icon,
                    severity: attention.severity,
                    message: localize(
                        `attention.${attention.labelKey}`,
                        this.hass.language,
                        {
                            value: this.formatEntityState(entity),
                        },
                    ),
                };
            }
        }

        return undefined;
    }

    private formatEntityState(entity: HassEntity | undefined): string {
        if (!this.hass || !entity) return '';

        return (
            this.hass as HomeAssistant & {
                formatEntityState(entity: HassEntity, state?: string): string;
            }
        ).formatEntityState(entity);
    }

    private renderActions(
        stateObj: HassEntity | undefined,
        visualState: VisualState,
        entityId: string,
    ): TemplateResult[] {
        const allActions: { action: CardAction; feature: VacuumFeature }[] = [
            { action: 'start', feature: VacuumFeature.Start },
            { action: 'pause', feature: VacuumFeature.Pause },
            { action: 'return_to_base', feature: VacuumFeature.ReturnToBase },
            { action: 'locate', feature: VacuumFeature.Locate },
        ];

        return allActions
            .filter(({ feature }) => hasFeature(stateObj, feature))
            .map(({ action }) => {
                const label = actionLabel(action, this.hass?.language);

                return html`
                    <button
                        class="action-button"
                        type="button"
                        title=${label}
                        aria-label=${label}
                        ?disabled=${
                            (action !== 'locate' && this.isCallingService) ||
                            actionDisabled(action, visualState)
                        }
                        @click=${(event: Event) => {
                            void this.callVacuumService(event, action, entityId);
                        }}
                    >
                        <ha-icon icon=${iconForAction(action)}></ha-icon>
                    </button>
                `;
            });
    }

    private async callVacuumService(
        event: Event,
        action: CardAction,
        entityId: string,
    ): Promise<void> {
        event.stopPropagation();

        const hass = this.hass;

        if (!hass || !this.canCallVacuumService(action, entityId)) return;

        if (action !== 'locate') {
            this.pendingEntityState = hass.states[entityId]?.state;
            this.isCallingService = true;
        }

        try {
            await hass.callService('vacuum', action, { entity_id: entityId });
        } catch (error) {
            if (action !== 'locate') {
                this.isCallingService = false;
                this.pendingEntityState = undefined;
            }
            throw error;
        }
    }

    private canCallVacuumService(action: CardAction, entityId: string): boolean {
        if (!this.hass || (action !== 'locate' && this.isCallingService)) return false;

        const stateObj = this.hass.states[entityId];

        return (
            hasFeature(stateObj, ACTION_FEATURES[action]) &&
            !actionDisabled(action, computeVisualState(stateObj))
        );
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        if (!changedProperties.has('hass') || !this.isCallingService) return;

        const currentState = this.hass?.states[this.config?.entity ?? '']?.state;

        if (currentState !== this.pendingEntityState) {
            this.isCallingService = false;
            this.pendingEntityState = undefined;
        }
    }

    private renderVacuumImage(visualState: VisualState): TemplateResult {
        return html`
            <div class="vacuum-image-wrap ${visualState}">
                <img
                    class="vacuum-image"
                    src=${vacuumImage}
                    alt=${localize('card.vacuum_image', this.hass?.language)}
                />
                ${
                    visualState === 'paused' || visualState === 'error'
                        ? html`<div
                              class="state-indicator ${
                                  visualState === 'error' ? 'state-indicator--error' : ''
                              }"
                              aria-hidden="true"
                          >
                              <ha-icon
                                  icon=${visualState === 'error' ? 'mdi:alert' : 'mdi:pause'}
                              ></ha-icon>
                          </div>`
                        : nothing
                }
            </div>
        `;
    }

    public static override styles: CSSResultGroup = [cardStyles, animationStyles];
}

window.customCards = window.customCards ?? [];
window.customCards.push({
    type: CARD_TYPE,
    name: 'Roborock Vacuum Card',
    preview: true,
    description:
        'Roborock vacuum card with battery, translated state, static product image and controls.',
    documentationURL: 'https://github.com/augustas2/roborock-vacuum-card',
    getEntitySuggestion: (_hass: HomeAssistant, entityId: string) => {
        if (!entityId.startsWith('vacuum.')) return null;

        return {
            config: {
                type: `custom:${CARD_TYPE}`,
                entity: entityId,
            },
        };
    },
});

declare global {
    interface HTMLElementTagNameMap {
        [CARD_TYPE]: RoborockVacuumCard;
    }
}
