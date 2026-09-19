import type { UpgradeDefinition } from './upgrade-types.ts';

export const upgrades: readonly UpgradeDefinition[] = [
    {
        id: 0x0000,
        name: 'Faster fingers',
        description: 'Increases click rate by 1 sat/click',
        cost: 100,
        satsPerClick: 1,
    },
    {
        id: 0x0100,
        name: 'Rapid fingers',
        description: 'Increases click rate by 10 sats/click',
        cost: 1000,
        satsPerClick: 10,
    },
];
