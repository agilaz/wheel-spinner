import React, { createRef, useEffect, useRef } from 'react';
import { Group, Image, Layer, Stage, Text, Wedge } from 'react-konva';
import Konva from 'konva';
import { rainbowColor, scaleImage, wheelEasing } from '../util';
import { CIRCLE_DEGREES } from '../util/randomSpin';
import useAudio from '../util/useAudio';
import useImage from 'use-image';

// Laziness
const FONT_SIZE = 20;
const TEXT_LEFT_PADDING = 20;
const TEXT_HIDDEN_LABEL = '???';

const CANVAS_PADDING = 0.05;


const getWedgeAngles = (wedges) => {
    if (!wedges || wedges.length === 0) {
        return [];
    }

    // Total weight to figure out relative sizes of each wedge
    const totalWeight = wedges.map(wedge => wedge.weight).reduce((a, b) => a + b);

    // Net offset angle so all wedges form a circle
    let offsetAngle = 0;

    return wedges.map((wedge) => {
        // How wide the wedge should be, based on % of total weight
        const angle = (wedge.weight * CIRCLE_DEGREES) / totalWeight;
        // Wedge is the background shape, assign angle/radius from params and then give it random color
        const thisOffset = offsetAngle;
        // Update next wedge's starting angle based on the size of this one
        offsetAngle += angle;
        return {angle, offsetAngle: thisOffset};
    });
}

/**
 * Build each wedge object with the appropriate size, orientation, and label
 * @param wedges
 * @param radius
 * @param wedgeSizeRefs
 * @param wedgeOffsetRefs
 * @param textRotationRefs
 * @returns {null|*}
 */
const buildWedges = (wedges, radius, wedgeSizeRefs, wedgeOffsetRefs, textRotationRefs) => {
    if (!wedges || wedges.length === 0) {
        return [];
    }

    const wedgeAngles = getWedgeAngles(wedges);

    return wedges.map((wedge, idx) => {
        // How wide the wedge should be, based on % of total weight
        const angle = wedgeAngles[idx].angle;
        const offsetAngle = wedgeAngles[idx].offsetAngle;
        // Wedge is the background shape, assign angle/radius from params and then give it random color
        const [wedgeColor, textColor] = rainbowColor(idx, wedges.length);
        const wedgeComponent = <Wedge
            ref={wedgeSizeRefs[idx]}
            angle={angle}
            radius={radius}
            fill={wedgeColor}
            stroke={'#000000'}
            strokeWidth={1.5}
        />;
        // Text within the wedge from the label.
        // Text angle has to be offset so that it is pointing from the outside of the wedge in.
        const textComponent = <Text
            ref={textRotationRefs[idx]}
            text={wedge.hidden ? TEXT_HIDDEN_LABEL : wedge.label}
            rotation={(angle + CIRCLE_DEGREES) / 2}
            offsetX={radius - TEXT_LEFT_PADDING}
            offsetY={FONT_SIZE / 2}
            fontSize={FONT_SIZE}
            fill={textColor}
            opacity={1}
        />;
        // Group handles overall position and rotation
        const component = <Group
            ref={wedgeOffsetRefs[idx]}
            key={idx}
            x={radius}
            y={radius}
            rotation={offsetAngle}>
            {wedgeComponent}
            {textComponent}
        </Group>;
        // Record the min angle for this wedge to use in determining winning result
        const winAngle = {angle: offsetAngle, wedge};
        return {component, winAngle};
    });
}

/**
 * Build the indicator of the winning position
 * TODO remove magic numbers
 * @param pageSize
 * @returns {JSX.Element}
 */
const buildIndicator = (pageSize) => {
    // Center it vertically on the left side
    const h = pageSize / 2;
    const wedgeRadius = h / 5;
    const wedgeAngle = 30;
    // Position it slightly overhanging the left of the wheel. Rotate it so it is horizontal.
    return <Wedge rotation={180 - wedgeAngle / 2}
                  angle={wedgeAngle}
                  radius={wedgeRadius}
                  y={h}
                  x={wedgeRadius * .8}
                  fill={'#000000'} />
}

export const Wheel = ({
                          size = 500, wedges = [], spin, spinSound, onSpinEnd = () => {
    }, initialRotation, toRemove, onRemoveEnd = () => {
    }, backgroundImage = ''
                      }) => {
    const [, , playAudio, stopAudio] = useAudio(spinSound);

    const [wedgeSizeRefs, setWedgeSizeRefs] = React.useState([]);
    const [wedgeOffsetRefs, setWedgeOffsetRefs] = React.useState([]);
    const [textRotationRefs, setTextRotationRefs] = React.useState([]);
    const [image] = useImage(backgroundImage);

    // Need ref for wheel to make animation work
    const wheelRef = useRef(null);

    // Compute radius of wheel. Give room for padding on both sides.
    const radius = size / 2 - (CANVAS_PADDING * size);

    useEffect(() => {
        setWedgeSizeRefs(wedgeRefs =>
            Array(wedges.length).fill().map((_, i) => wedgeRefs[i] || createRef())
        );
        setWedgeOffsetRefs(wedgeRefs =>
            Array(wedges.length).fill().map((_, i) => wedgeRefs[i] || createRef())
        );
        setTextRotationRefs(wedgeRefs =>
            Array(wedges.length).fill().map((_, i) => wedgeRefs[i] || createRef())
        );
    }, [wedges]);

    // Figure out all info needed to build wedges
    const wedgeInfo = buildWedges(wedges, radius, wedgeSizeRefs, wedgeOffsetRefs, textRotationRefs);

    // Split out the components and data from above calls
    const wedgeDisplays = wedgeInfo.map(w => w.component);
    const winAngles = wedgeInfo.map(w => w.winAngle);

    // Animation on removing a wedge
    useEffect(() => {
        if (!toRemove) return;

        const {index, duration} = toRemove;

        const endWedges = [...wedges];
        endWedges.splice(index, 1);
        const endAngles = getWedgeAngles(endWedges);

        const tweens = [];

        for (let i = 0; i < wedges.length; i++) {
            if (i !== index) {
                // For all the wedges that remain, build tweens for their growth
                const endAngleIndex = (i < index) ? i : i - 1;
                const wedgeTween = new Konva.Tween({
                    node: wedgeSizeRefs[i].current,
                    duration: duration / 1000,
                    angle: endAngles[endAngleIndex].angle,
                });
                const offsetTween = new Konva.Tween({
                    node: wedgeOffsetRefs[i].current,
                    duration: duration / 1000,
                    rotation: endAngles[endAngleIndex].offsetAngle
                });
                const textTween = new Konva.Tween({
                    node: textRotationRefs[i].current,
                    duration: duration / 1000,
                    rotation: (endAngles[endAngleIndex].angle + CIRCLE_DEGREES) / 2
                });
                tweens.push(
                    wedgeTween,
                    offsetTween,
                    textTween
                );
            } else {
                // For wedge being removed, shrink it
                let offsetEnd;
                if (i === 0) {
                    // Special case for first wedge; make it shrink towards zero
                    offsetEnd = 0;
                } else {
                    // For other wedges, make it shrink between its two surrounding wedges
                    offsetEnd = (endAngles[i - 1].offsetAngle + endAngles[i - 1].angle);
                }
                const wedgeTween = new Konva.Tween({
                    node: wedgeSizeRefs[i].current,
                    duration: duration / 1000,
                    angle: 0
                });
                const offsetTween = new Konva.Tween({
                    node: wedgeOffsetRefs[i].current,
                    duration: duration / 1000,
                    rotation: offsetEnd
                });
                const textTween = new Konva.Tween({
                    node: textRotationRefs[i].current,
                    duration: duration / 1000,
                    rotation: 180,
                    opacity: 0
                });
                tweens.push(
                    wedgeTween,
                    offsetTween,
                    textTween
                )
            }
        }
        tweens.forEach(tween => tween.play());

        setTimeout(() => {
            tweens.forEach(tween => {
                tween.reset();
                tween.destroy();
            });

            onRemoveEnd();
        }, duration + 1);

    }, [toRemove])

    useEffect(() => {
        // Only animate if spin is provided
        if (!spin) return;

        // Spin for the given duration to the given rotation
        const finalRotation = initialRotation + spin.rotation;
        const tween = new Konva.Tween({
            node: wheelRef.current,
            duration: spin.duration / 1000,
            easing: wheelEasing,
            rotation: finalRotation
        });
        tween.play();

        // Also start the sound (if provided)
        if (!!spinSound) {
            playAudio();
        }

        // After spinning, finish and clean up animation and call callbacks
        setTimeout(() => {
            tween.finish();
            tween.destroy();

            // Stop sound
            stopAudio();

            // Figure out what the ticker is pointing towards
            // (slightly weird math since it's 180 degrees out of sync of the wheel's 0)
            const winningAngle = CIRCLE_DEGREES - (finalRotation + CIRCLE_DEGREES / 2) % CIRCLE_DEGREES;
            // Find the wedge associated with this angle, call onSpinEnd with it
            for (let i = winAngles.length - 1; i >= 0; i--) {
                const potentialWinner = winAngles[i];
                if (potentialWinner.angle <= winningAngle) {
                    onSpinEnd && onSpinEnd(i, finalRotation);
                    return;
                }
            }
        }, spin.duration + 1); // Set to happen just after animation finishes
    }, [spin]);

    let imageComponent = null;

    if (image) {
        const padding = size * CANVAS_PADDING * 2;
        const maxSize = size - (padding * 2);
        const [imgWidth, imgHeight] = scaleImage(image.naturalWidth, image.naturalHeight, maxSize);
        imageComponent = <Image image={image}
                                width={imgWidth}
                                height={imgHeight}
                                x={(maxSize - imgWidth) / 2 + padding}
                                y={(maxSize - imgHeight) / 2 + padding}
        />
    }
    return (
        <>
            <div>
                <Stage width={size} height={size}>
                    <Layer>
                        {imageComponent}
                        <Group ref={wheelRef}
                               rotation={initialRotation}
                               x={size / 2}
                               y={size / 2}
                               offsetX={radius}
                               offsetY={radius}>
                            {wedgeDisplays}
                        </Group>
                        {buildIndicator(size)}
                    </Layer>
                </Stage>
            </div>
        </>
    );
}