const shadeFactor = 0.2; // Lower = closer to black
const tintFactor = 0.8; // Higher = closer to white

const darkenComponent = (component) => component * shadeFactor;
const lightenComponent = (component) => component + (1 - component) * tintFactor;

const darkenColor = ({r, g, b}) => ({
    r: darkenComponent(r),
    g: darkenComponent(g),
    b: darkenComponent(b)
});

const lightenColor = ({r, g, b}) => ({
    r: lightenComponent(r),
    g: lightenComponent(g),
    b: lightenComponent(b)
});

const calcLuminance = ({r, g, b}) => {
    const c = [r, g, b].map(col => {
        if (col < 0.03928) {
            return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
    });

    return (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
};

const calcContrast = (c1, c2) => {
    const l1 = calcLuminance(c1);
    const l2 = calcLuminance(c2);

    const brightLuminance = Math.max(l1, l2);
    const darkLuminance = Math.min(l1, l2);

    return (brightLuminance + 0.05) / (darkLuminance + 0.05);
};

const rgb2hex = ({r, g, b}) =>
    '#' +
    [r, g, b]
        .map(x =>
            Math.round(x * 255)
                .toString(16)
                .padStart(2, 0)
        )
        .join('');

/**
 * Pick the ith color out of a rainbow with n steps
 * @param i
 * @param n
 * @returns {string[]}
 */
const rainbowColor = (i, n) => {
    const h = i / n;
    const f = (n, k = (n + h * 12) % 12) =>
        0.5 - 0.5 * Math.max(Math.min(k - 3, 9 - k, 1), -1);

    const origColor = {
        r: f(0),
        g: f(8),
        b: f(4)
    };

    // Figure out text color based on higher contrast
    const lightColor = lightenColor(origColor);
    const darkColor = darkenColor(origColor);

    const lightContrast = calcContrast(origColor, lightColor);
    const darkContrast = calcContrast(origColor, darkColor);

    const origHex = rgb2hex(origColor);
    const textHex = rgb2hex((lightContrast > darkContrast) ? lightColor : darkColor);

    return [origHex, textHex];
}

export default rainbowColor;