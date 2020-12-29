const shadeFactor = 0.2;
const tintFactor = 0.8;

const darken = (component) => component * shadeFactor;
const lighten = (component) => component + (1 - component) * tintFactor;

/**
 * Pick the ith color out of a rainbow with n steps
 * @param i
 * @param n
 * @returns {string[]}
 */
const rainbowColor = (i, n) => {
    let h = i / n;
    let f = (n, k = (n + h * 12) % 12) =>
        0.5 - 0.5 * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    let rgb2hex = (r, g, b) =>
        '#' +
        [r, g, b]
            .map(x =>
                Math.round(x * 255)
                    .toString(16)
                    .padStart(2, 0)
            )
            .join('');
    const r = f(0);
    const g = f(8);
    const b = f(4);
    const originalColor = rgb2hex(r, g, b);

    // Figure out text color
    const c = [r, g, b].map(col => {
        if (col < 0.03928) {
            return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
    });

    const luminance = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);

    let textColor;
    if (luminance < 0.179) {
        // If the background color is dark, brighten it for text
        textColor = rgb2hex(lighten(r), lighten(g), lighten(b));
    } else {
        // If the background color is light, dim it for text
        textColor = rgb2hex(darken(r), darken(g), darken(b));
    }
    return [originalColor, textColor];
}

export default rainbowColor;