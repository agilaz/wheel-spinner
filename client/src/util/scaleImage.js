const scaleImage = (width, height, max) => {
    const scaleFactor = parseFloat(max) / Math.max(width, height);

    return [width * scaleFactor, height * scaleFactor];
}

export default scaleImage;