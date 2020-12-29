import React, { useEffect, useRef } from 'react';
import { Group, Layer, Stage, Text, Wedge } from 'react-konva';
import Konva from 'konva';
import { rainbowColor } from '../util';
import { CIRCLE_DEGREES } from '../util/randomSpin';
import useAudio from '../util/useAudio';

// Laziness
const FONT_SIZE = 20;
const TEXT_LEFT_PADDING = 20;
const TEXT_HIDDEN_LABEL = '???';

const CANVAS_PADDING = 0.05;


/**
 * Build each wedge object with the appropriate size, orientation, and label
 * @param wedges
 * @param radius
 * @returns {null|*}
 */
const buildWedges = (wedges, radius) => {
    if (!wedges || wedges.length === 0) {
        return null;
    }

    // Total weight to figure out relative sizes of each wedge
    const totalWeight = wedges.map(wedge => wedge.weight).reduce((a, b) => a + b);

    // Net offset angle so all wedges form a circle
    let offsetAngle = 0;

    return wedges.map((wedge, idx) => {
        // How wide the wedge should be, based on % of total weight
        const angle = (wedge.weight * CIRCLE_DEGREES) / totalWeight;
        // Wedge is the background shape, assign angle/radius from params and then give it random color
        const wedgeComponent = <Wedge
            angle={angle}
            radius={radius}
            fill={rainbowColor(idx, wedges.length)}
        />;
        // Text within the wedge from the label.
        // Text angle has to be offset so that it is pointing from the outside of the wedge in.
        const textComponent = <Text
            text={wedge.hidden ? TEXT_HIDDEN_LABEL : wedge.label}
            rotation={(angle + CIRCLE_DEGREES) / 2}
            offsetX={radius - TEXT_LEFT_PADDING}
            offsetY={FONT_SIZE / 2}
            fontSize={FONT_SIZE}
        />;
        // Group handles overall position and rotation
        const component = <Group
            key={idx}
            x={radius}
            y={radius}
            rotation={offsetAngle}>
            {wedgeComponent}
            {textComponent}
        </Group>;
        // Record the min angle for this wedge to use in determining winning result
        const winAngle = {angle: offsetAngle, wedge};
        // Update next wedge's starting angle based on the size of this one
        offsetAngle += angle;
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

export const Wheel = ({size = 500, wedges = [], spin, spinSound, onSpinEnd, initialRotation}) => {
    const [, , playAudio, stopAudio] = useAudio(spinSound);

    // Need ref for wheel to make animation work
    const wheelRef = useRef(null);

    // Compute radius of wheel. Give room for padding on both sides.
    const radius = size / 2 - (CANVAS_PADDING * size);

    // Figure out all info needed to build wedges
    const wedgeInfo = buildWedges(wedges, radius);

    // Split out the components and data from above calls
    const wedgeDisplays = wedgeInfo.map(w => w.component);
    const winAngles = wedgeInfo.map(w => w.winAngle);

    useEffect(() => {
        // Only animate if spin is provided
        if (!spin) return;

        // Spin for the given duration to the given rotation
        const finalRotation = initialRotation + spin.rotation;
        const tween = new Konva.Tween({
            node: wheelRef.current,
            duration: spin.duration / 1000,
            easing: Konva.Easings.EaseInOut,
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


    return (
        <>
            <div>
                <Stage width={size} height={size}>
                    <Layer>
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