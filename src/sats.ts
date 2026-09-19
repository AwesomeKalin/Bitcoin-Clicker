export const SAT_UNITS = 10;

const COMPACT_SUFFIXES = ['', 'k', 'm', 't', 'q'];

function compactSuffix(index: number): string {
    if (index < COMPACT_SUFFIXES.length) return COMPACT_SUFFIXES[index];

    let value = index - COMPACT_SUFFIXES.length;
    let suffix = '';
    do {
        suffix = String.fromCharCode(65 + (value % 26)) + suffix;
        value = Math.floor(value / 26) - 1;
    } while (value >= 0);
    return suffix;
}

export function satsToUnits(sats: number): bigint {
    if (!Number.isInteger(sats) || sats < 0)
        throw new Error('Sat amounts must be non-negative integers');
    return BigInt(sats) * BigInt(SAT_UNITS);
}

export function formatSats(units: bigint | number): string {
    const integerUnits = typeof units === 'bigint' ? units : BigInt(units);
    if (integerUnits < 0n) throw new Error('Sat units must be non-negative');

    let divisor = BigInt(SAT_UNITS);
    let suffixIndex = 0;
    while (integerUnits >= divisor * 1000n) {
        divisor *= 1000n;
        suffixIndex += 1;
    }

    const whole = integerUnits / divisor;
    const fractional = ((integerUnits % divisor) * 10n) / divisor;
    const value = fractional === 0n ? String(whole) : `${whole}.${fractional}`;
    return `${value}${compactSuffix(suffixIndex)} sats`;
}
