import type {
    CardAction,
    RoborockAttentionDefinition,
    RoborockDetailDefinition,
    VisualState,
} from './types';

export const CARD_TYPE = 'roborock-vacuum-card';

export const STATE_MAP: Partial<Record<string, VisualState>> = {
    cleaning: 'cleaning',
    docked: 'docked',
    returning: 'returning',
    paused: 'paused',
    error: 'error',
};

export const ACTION_ICONS_MAP: Record<CardAction, string> = {
    start: 'mdi:play',
    pause: 'mdi:pause',
    return_to_base: 'mdi:home-import-outline',
    locate: 'mdi:map-marker',
};

export const enum VacuumFeature {
    Pause = 4,
    ReturnToBase = 16,
    Locate = 512,
    Start = 8192,
}

export const ACTION_FEATURES: Record<CardAction, VacuumFeature> = {
    start: VacuumFeature.Start,
    pause: VacuumFeature.Pause,
    return_to_base: VacuumFeature.ReturnToBase,
    locate: VacuumFeature.Locate,
};

export const DISABLED_BY_ACTION: Record<
    CardAction,
    (visualState: VisualState) => boolean
> = {
    start: (visualState) => visualState === 'cleaning' || visualState === 'returning',
    pause: (visualState) => visualState !== 'cleaning' && visualState !== 'returning',
    return_to_base: (visualState) =>
        visualState === 'docked' || visualState === 'returning',
    locate: () => false,
};

export const ROBOROCK_STATUS_MAP: Partial<Record<string, VisualState>> = {
    cleaning: 'cleaning',
    spot_cleaning: 'cleaning',
    zoned_cleaning: 'cleaning',
    segment_cleaning: 'cleaning',
    mapping: 'cleaning',
    robot_status_mopping: 'cleaning',
    clean_mop_cleaning: 'cleaning',
    clean_mop_mopping: 'cleaning',
    segment_mopping: 'cleaning',
    zoned_mopping: 'cleaning',
    returning_home: 'returning',
    docking: 'returning',
    going_to_target: 'returning',
    going_to_wash_the_mop: 'returning',
    back_to_dock_washing_duster: 'returning',
    paused: 'paused',
    error: 'error',
    charging_problem: 'error',
    docked: 'docked',
    charging: 'docked',
    charging_complete: 'docked',
    idle: 'idle',
};

export const ROBOROCK_DETAILS: RoborockDetailDefinition[] = [
    { domain: 'sensor', suffix: 'current_room', icon: 'mdi:door', labelKey: 'room' },
    {
        domain: 'sensor',
        suffix: 'cleaning_area',
        icon: 'mdi:texture-box',
        labelKey: 'area',
    },
    {
        domain: 'sensor',
        suffix: 'cleaning_progress',
        icon: 'mdi:progress-clock',
        labelKey: 'progress',
    },
    {
        domain: 'sensor',
        suffix: 'cleaning_time',
        icon: 'mdi:timer-outline',
        labelKey: 'time',
    },
];

export const ROBOROCK_ATTENTION: RoborockAttentionDefinition[] = [
    {
        domain: 'sensor',
        suffix: 'vacuum_error',
        icon: 'mdi:robot-vacuum-alert',
        labelKey: 'vacuum_error',
        severity: 'error',
        inactiveStates: ['none'],
    },
    {
        domain: 'sensor',
        suffix: 'dock_dock_error',
        icon: 'mdi:alert-octagon-outline',
        labelKey: 'dock_error',
        severity: 'error',
        inactiveStates: ['ok'],
    },
    {
        domain: 'binary_sensor',
        suffix: 'water_shortage',
        icon: 'mdi:water-alert',
        labelKey: 'water_shortage',
        severity: 'warning',
        activeState: 'on',
    },
    {
        domain: 'binary_sensor',
        suffix: 'dock_dirty_water_box',
        icon: 'mdi:water-remove-outline',
        labelKey: 'empty_dirty_water',
        severity: 'warning',
        activeState: 'on',
    },
    {
        domain: 'binary_sensor',
        suffix: 'dock_clean_water_box',
        icon: 'mdi:water-plus-outline',
        labelKey: 'fill_clean_water',
        severity: 'warning',
        activeState: 'on',
    },
];

export const DOCK_ACTIONS = [
    {
        suffix: 'dock_mop_washing',
        icon: 'mdi:washing-machine',
        labelKey: 'mop_washing',
    },
    {
        suffix: 'dock_mop_drying',
        icon: 'mdi:weather-sunny',
        labelKey: 'mop_drying',
    },
    {
        suffix: 'dock_dust_emptying',
        icon: 'mdi:delete-sweep-outline',
        labelKey: 'dust_emptying',
    },
] as const;
