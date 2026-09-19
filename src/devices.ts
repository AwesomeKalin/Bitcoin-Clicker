import type { DeviceDefinition } from './device-types.ts';

export const devices: readonly DeviceDefinition[] = [
    {
        id: 0x00,
        name: 'Basic Miner',
        productionPerSecondUnits: 1,
        baseCost: 100,
    },
    {
        id: 0x01,
        name: 'Pro Miner',
        productionPerSecondUnits: 10,
        baseCost: 500,
    },
    {
        id: 0x02,
        name: 'Advanced Miner',
        productionPerSecondUnits: 50,
        baseCost: 3000,
    },
];

const PRICE_GROWTH_FACTOR = 1.5;

export function deviceUnitCost(device: DeviceDefinition, owned: number): number {
    return Math.ceil(device.baseCost * PRICE_GROWTH_FACTOR ** owned);
}

export function deviceBulkCost(device: DeviceDefinition, owned: number, quantity: number): number {
    let total = 0;
    for (let index = 0; index < quantity; index += 1) {
        total += deviceUnitCost(device, owned + index);
    }
    return total;
}
