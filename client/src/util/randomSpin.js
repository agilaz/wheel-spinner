const MIN_SPINS = 1;
const MAX_SPINS = 7;
const MIN_SPIN_DURATION_MILLIS = 1500;
const MAX_SPIN_DURATION_MILLIS = 4000;
export const CIRCLE_DEGREES = 360;

/**
 * Generate a random spin duration and rotation
 * @returns {{duration: number, rotation: number}}
 */
const generateSpin = (config) => {
    const minSpins = (config && config.minSpins) || MIN_SPINS;
    const maxSpins = Math.max(minSpins, (config && config.maxSpins) || MAX_SPINS);
    const minSpinDurationMillis = (config && config.minSpinDurationMillis) || MIN_SPIN_DURATION_MILLIS;
    const maxSpinDurationMillis = Math.max(minSpinDurationMillis, (config && config.maxSpinDurationMillis) || MAX_SPIN_DURATION_MILLIS);
    const numSpins = Math.round(Math.random() * (maxSpins - minSpins)) + minSpins;
    const netOffset = Math.random() * CIRCLE_DEGREES;
    const netRotation = numSpins * CIRCLE_DEGREES + netOffset;
    // Randomly decide how long to spin
    const spinDurationMillis = Math.round(Math.random() * (maxSpinDurationMillis - minSpinDurationMillis)) + minSpinDurationMillis;
    return {rotation: netRotation, duration: spinDurationMillis};
}

export default generateSpin;