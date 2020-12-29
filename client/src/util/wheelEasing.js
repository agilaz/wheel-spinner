/**
 * Switch point can be changed to adjust when it switches from ease in to ease out.
 * Should be on a scale from (0,2).
 * Smaller means quicker ease in and slower ease out.
 * @type {number}
 */
const SWITCH_POINT = 1 / 2;
/**
 * Abruptness of ease in. Higher means slower start but quicker pickup
 * @type {number}
 */
const EASE_IN_POW = 2;
/**
 * Abruptness of ease out. Higher means slower at the end with sharper deceleration in the middle.
 * @type {number}
 */
const EASE_OUT_POW = 7;

// Adapted from Konva's in/out easings
const wheelEasing = (t, b, c, d) => {
    if ((t /= d / 2) < SWITCH_POINT) {
        return (c / 2) * Math.pow(t / SWITCH_POINT, EASE_IN_POW) + b;
    }
    return (c / 2) * (Math.pow((t - 2) / (2 - SWITCH_POINT), EASE_OUT_POW) + 2) + b;
}

export default wheelEasing;