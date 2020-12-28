import React, { useEffect, useRef } from 'react';
import { Group, Layer, Stage, Text, Wedge } from 'react-konva';
import Konva from 'konva';
import { randomColor, useIsMount } from '../util';
import { CIRCLE_DEGREES } from '../util/randomSpin';

// Laziness
const FONT_SIZE = 20;
const TEXT_LEFT_PADDING = 20;
const TEXT_HIDDEN_LABEL = '???';

const CANVAS_PADDING = 20;


const buildWedges = (wedges, radius) => {
    if (!wedges || wedges.length === 0) {
        return null;
    }

    const totalWeight = wedges.map(wedge => wedge.weight).reduce((a, b) => a + b);

    let offsetAngle = 0;

    return wedges.map((wedge, idx) => {
        const angle = (wedge.weight * CIRCLE_DEGREES) / totalWeight;
        const component = <Group
            key={idx}
            x={radius}
            y={radius}
            rotation={offsetAngle}>
            <Wedge
                angle={angle}
                radius={radius}
                fill={randomColor(idx, wedges.length)}
            />
            <Text
                text={wedge.hidden ? TEXT_HIDDEN_LABEL : wedge.label}
                rotation={(angle + CIRCLE_DEGREES) / 2}
                offsetX={radius - TEXT_LEFT_PADDING}
                offsetY={FONT_SIZE / 2}
                fontSize={FONT_SIZE}
            />
        </Group>;
        const winAngle = {angle: offsetAngle, wedge};
        offsetAngle += angle;
        return {component, winAngle};
    });
}

const buildIndicator = (pageSize) => {
    // TODO magic numbers
    const h = pageSize / 2;
    const wedgeRadius = h / 5;
    const wedgeAngle = 30;
    return <Wedge rotation={180 - wedgeAngle / 2}
                  angle={wedgeAngle}
                  radius={wedgeRadius}
                  y={h}
                  x={wedgeRadius * .8}
                  fill={'#000000'} />
}

export const Wheel = ({size = 500, wedges = [], spin, onSpinEnd, initialRotation}) => {
    const isMount = useIsMount();
    // const [rotation, setRotation] = useState(0);

    const wheelRef = useRef(null);

    const radius = size / 2 - CANVAS_PADDING;

    const wedgeInfo = buildWedges(wedges, radius);

    const wedgeDisplays = wedgeInfo.map(w => w.component);
    const winAngles = wedgeInfo.map(w => w.winAngle);
    winAngles.sort((a, b) => a.angle - b.angle);

    useEffect(() => {
        if (!spin) return;

        const finalRotation = initialRotation + spin.rotation;
        const tween = new Konva.Tween({
            node: wheelRef.current,
            duration: spin.duration / 1000,
            easing: Konva.Easings.EaseInOut,
            rotation: finalRotation
        });
        tween.play();

        setTimeout(() => {
            tween.finish();
            tween.destroy();
            // setRotation((rotation + spin.rotation) % CIRCLE_DEGREES);
            const winningAngle = CIRCLE_DEGREES - (finalRotation + CIRCLE_DEGREES / 2) % CIRCLE_DEGREES;
            for (let i = winAngles.length - 1; i >= 0; i--) {
                const potentialWinner = winAngles[i];
                if (potentialWinner.angle <= winningAngle) {
                    onSpinEnd && onSpinEnd(i, finalRotation);
                    return;
                }
            }
        }, spin.duration + 1);
    }, [spin]);

    // useEffect(() => {
    //     if (isMount) {
    //         return;
    //     }
    //     const winningAngle = CIRCLE_DEGREES - (rotation + CIRCLE_DEGREES / 2) % CIRCLE_DEGREES;
    //     for (let i = winAngles.length - 1; i >= 0; i--) {
    //         const potentialWinner = winAngles[i];
    //         if (potentialWinner.angle <= winningAngle) {
    //             onSpinEnd && onSpinEnd(i);
    //             return;
    //         }
    //     }
    // }, [rotation]);

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