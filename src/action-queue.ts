export const BITCLICK_HEADER_HEX = '626974636c69636b';
export const BITSIGCLICK_HEADER_HEX = '626974736967636c69636b';
export const CLICK_VERSION_HEX = '00';
export const CLICK_OPCODE_HEX = '00';
export const UPGRADE_OPCODE_HEX = '01';
export const DEVICE_OPCODE_HEX = '02';

export interface GameAction {
    id: number;
    type: string;
    outputScriptHex: string;
    createdAt: number;
    timestamp: number;
    upgradeId?: number;
    deviceId?: number;
    quantity?: number;
}

export function decodeGameAction(outputScriptHex: string): GameAction | null {
    outputScriptHex = outputScriptHex.replace(/^0x/i, '').replace(/\s+/g, '').toLowerCase();
    const prefix = `006a07${BITCLICK_HEADER_HEX}${CLICK_VERSION_HEX}`;
    if (!outputScriptHex.startsWith(prefix)) return null;

    const timestampLengthOffset = prefix.length;
    const timestampLength = Number.parseInt(
        outputScriptHex.slice(timestampLengthOffset, timestampLengthOffset + 2),
        16,
    );
    if (!Number.isInteger(timestampLength)) return null;
    const timestampStart = timestampLengthOffset + 2;
    const timestampEnd = timestampStart + timestampLength * 2;
    const timestampHexValue = outputScriptHex.slice(timestampStart, timestampEnd);
    const opcode = outputScriptHex.slice(timestampEnd, timestampEnd + 2);
    const params = outputScriptHex.slice(timestampEnd + 2);
    if (!timestampHexValue || timestampHexValue.length !== timestampLength * 2) return null;

    const action: GameAction = {
        id: 0,
        type: 'unknown',
        outputScriptHex,
        createdAt: 0,
        timestamp: Number.parseInt(timestampHexValue, 16),
    };

    if (opcode === CLICK_OPCODE_HEX && params === '') return { ...action, type: 'click' };
    if (opcode === UPGRADE_OPCODE_HEX && params.length === 4) {
        return { ...action, type: 'upgrade', upgradeId: Number.parseInt(params, 16) };
    }
    if (opcode === DEVICE_OPCODE_HEX && params.length === 4) {
        return {
            ...action,
            type: 'device',
            deviceId: Number.parseInt(params.slice(0, 2), 16),
            quantity: Number.parseInt(params.slice(2), 16),
        };
    }
    return null;
}

function timestampHex(timestamp: number): string {
    if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
        throw new Error('Timestamps must be non-negative safe integers');
    }

    const hex = timestamp.toString(16);
    const paddedHex = hex.length % 2 === 0 ? hex : `0${hex}`;
    if (paddedHex.length / 2 > 0xff) throw new Error('Timestamp is too large');
    return paddedHex;
}

function createActionOutputScript(
    opcodeHex: string,
    paramsHex = '',
    timestamp = Math.floor(Date.now() / 1000),
): string {
    const timestampBytes = timestampHex(timestamp);
    const timestampLength = timestampBytes.length / 2;
    return `006a07${BITCLICK_HEADER_HEX}${CLICK_VERSION_HEX}${timestampLength.toString(16).padStart(2, '0')}${timestampBytes}${opcodeHex}${paramsHex}`;
}

export function createClickOutputScript(timestamp = Math.floor(Date.now() / 1000)): string {
    return createActionOutputScript(CLICK_OPCODE_HEX, '', timestamp);
}

export function createUpgradeOutputScript(
    upgradeId: number,
    timestamp = Math.floor(Date.now() / 1000),
): string {
    if (!Number.isInteger(upgradeId) || upgradeId < 0 || upgradeId > 0xffff) {
        throw new Error('Upgrade IDs must fit in two bytes');
    }

    return createActionOutputScript(
        UPGRADE_OPCODE_HEX,
        upgradeId.toString(16).padStart(4, '0'),
        timestamp,
    );
}

export function createDeviceOutputScript(
    deviceId: number,
    quantity: number,
    timestamp = Math.floor(Date.now() / 1000),
): string {
    if (!Number.isInteger(deviceId) || deviceId < 0 || deviceId > 0xff) {
        throw new Error('Device IDs must fit in one byte');
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 0xff) {
        throw new Error('Device quantity must be between 1 and 255');
    }

    return createActionOutputScript(
        DEVICE_OPCODE_HEX,
        `${deviceId.toString(16).padStart(2, '0')}${quantity.toString(16).padStart(2, '0')}`,
        timestamp,
    );
}

function pushDataHex(dataHex: string): string {
    if (dataHex.length % 2 !== 0) throw new Error('Protocol data must contain whole bytes');
    const byteLength = dataHex.length / 2;
    if (byteLength > 75) throw new Error('Protocol data is too large for a direct push');
    return `${byteLength.toString(16).padStart(2, '0')}${dataHex}`;
}

export function createBitsigclickOutputScript(publicKeyHex: string, signatureHex: string): string {
    return `006a${pushDataHex(BITSIGCLICK_HEADER_HEX)}${pushDataHex(publicKeyHex)}${pushDataHex(signatureHex)}`;
}

export class ActionQueue {
    private readonly actions: GameAction[] = [];
    private nextId = 1;

    add(
        type: string,
        outputScriptHex: string,
        timestamp = Math.floor(Date.now() / 1000),
    ): GameAction {
        const action: GameAction = {
            id: this.nextId++,
            type,
            outputScriptHex,
            createdAt: Date.now(),
            timestamp,
        };
        this.actions.push(action);
        return action;
    }

    addClick(): GameAction {
        const timestamp = Math.floor(Date.now() / 1000);
        return this.add('click', createClickOutputScript(timestamp), timestamp);
    }

    addUpgrade(upgradeId: number): GameAction {
        const timestamp = Math.floor(Date.now() / 1000);
        return this.add('upgrade', createUpgradeOutputScript(upgradeId, timestamp), timestamp);
    }

    addDevice(deviceId: number, quantity: number): GameAction {
        const timestamp = Math.floor(Date.now() / 1000);
        return this.add(
            'device',
            createDeviceOutputScript(deviceId, quantity, timestamp),
            timestamp,
        );
    }

    snapshot(): GameAction[] {
        return [...this.actions];
    }

    remove(actionIds: number[]): void {
        const ids = new Set(actionIds);
        for (let index = this.actions.length - 1; index >= 0; index -= 1) {
            if (ids.has(this.actions[index].id)) this.actions.splice(index, 1);
        }
    }

    get size(): number {
        return this.actions.length;
    }
}
