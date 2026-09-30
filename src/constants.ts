import type { CardAction, VisualState } from './types';

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
};

export const enum VacuumFeature {
    Pause = 4,
    ReturnToBase = 16,
    Start = 8192,
}

export const ACTION_FEATURES: Record<CardAction, VacuumFeature> = {
    start: VacuumFeature.Start,
    pause: VacuumFeature.Pause,
    return_to_base: VacuumFeature.ReturnToBase,
};

export const DISABLED_BY_ACTION: Record<
    CardAction,
    (visualState: VisualState) => boolean
> = {
    start: (visualState) => visualState === 'cleaning' || visualState === 'returning',
    pause: (visualState) => visualState !== 'cleaning' && visualState !== 'returning',
    return_to_base: (visualState) =>
        visualState === 'docked' || visualState === 'returning',
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
