import type { CardAction, VisualState } from './types';

export const CARD_TYPE = 'roborock-vacuum-card';

export const ENTITY_STATE_MAP: Partial<Record<string, VisualState>> = {
    cleaning: 'cleaning',
    docked: 'docked',
    returning: 'returning',
    paused: 'paused',
    error: 'error',
};

export const RAW_STATE_MAP: Partial<Record<string, VisualState>> = {
    cleaning: 'cleaning',
    returning: 'returning',
    docked: 'docked',
    paused: 'paused',
    error: 'error',
};

export const ACTION_ICONS_MAP: Record<CardAction, string> = {
    start: 'mdi:play',
    pause: 'mdi:pause',
    return_to_base: 'mdi:home-import-outline',
};

export const visualStateColors: Record<VisualState, string> = {
    cleaning: 'var(--state-vacuum-cleaning-color, var(--success-color, #43a047))',
    returning: 'var(--state-vacuum-returning-color, var(--info-color, #039be5))',
    paused: 'var(--state-vacuum-paused-color, var(--warning-color, #f9a825))',
    error: 'var(--error-color, #db4437)',
    docked: 'var(--state-inactive-color, #6f7287)',
    idle: 'var(--state-inactive-color, #6f7287)',
};

export const enum VacuumFeature {
    Pause = 4,
    ReturnToBase = 16,
    Start = 8192,
}
