const MIN_SPINS = 1;
const MAX_SPINS = 7;
const MAX_SPIN_DURATION_MILLIS = 4000;
const MIN_SPIN_DURATION_MILLIS = 1500;
export const CIRCLE_DEGREES = 360;


const generateSpin = () => {
    const numSpins = Math.round(Math.random() * (MAX_SPINS - MIN_SPINS)) + MIN_SPINS;
    const netOffset = Math.random() * CIRCLE_DEGREES;
    const netRotation = numSpins * CIRCLE_DEGREES + netOffset;
    // Randomly decide how long to spin
    const spinDurationMillis = Math.round(Math.random() * (MAX_SPIN_DURATION_MILLIS - MIN_SPIN_DURATION_MILLIS)) + MIN_SPIN_DURATION_MILLIS;
    return {rotation: netRotation, duration: spinDurationMillis};
}

export default generateSpin;