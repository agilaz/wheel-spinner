import React, { useEffect, useRef, useState } from 'react';
import { Group, Layer, Stage, Text, Wedge } from 'react-konva';
import { Button } from 'react-bootstrap';
import Konva from 'konva';
import { useIsMount } from './util';
import { randomColor } from './util';

// Laziness
const FONT_SIZE = 20;
const TEXT_LEFT_PADDING = 20;
const TEXT_HIDDEN_LABEL = '???';

const CANVAS_PADDING = 20;

const CIRCLE_DEGREES = 360;
const MIN_SPINS = 1;
const MAX_SPINS = 7;
const MAX_SPIN_DURATION_MILLIS = 4000;

const MIN_SPIN_DURATION_MILLIS = 1500;
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

export const Wheel = ({size = 500, wedges = [], onWinner}) => {
    const isMount = useIsMount();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);

    const wheelRef = useRef(null);

    const radius = size / 2 - CANVAS_PADDING;

    const wedgeInfo = buildWedges(wedges, radius);

    const wedgeDisplays = wedgeInfo.map(w => w.component);
    const winAngles = wedgeInfo.map(w => w.winAngle);
    winAngles.sort((a, b) => a.angle - b.angle);

    useEffect(() => {
        if (!isSpinning) return;

        // Randomly decide how far to spin (number of spins plus portion of one last spin)
        const numSpins = Math.round(Math.random() * (MAX_SPINS - MIN_SPINS)) + MIN_SPINS;
        const netOffset = Math.random() * CIRCLE_DEGREES;
        const netRotation = numSpins * CIRCLE_DEGREES + netOffset;
        // Randomly decide how long to spin
        const spinDurationMillis = Math.round(Math.random() * (MAX_SPIN_DURATION_MILLIS - MIN_SPIN_DURATION_MILLIS)) + MIN_SPIN_DURATION_MILLIS;
        const tween = new Konva.Tween({
            node: wheelRef.current,
            duration: spinDurationMillis / 1000,
            easing: Konva.Easings.EaseInOut,
            rotation: rotation + netRotation
        });
        tween.play();
        // setRotation(r => r + numSpins * CIRCLE_DEGREES + netOffset);
        setTimeout(() => {
            tween.finish();
            tween.destroy();
            setIsSpinning(false);
            setRotation((rotation + netRotation) % CIRCLE_DEGREES);
        }, spinDurationMillis + 1);
    }, [isSpinning, rotation]);

    useEffect(() => {
        if (isMount) {
            return;
        }
        const winningAngle = CIRCLE_DEGREES - (rotation + CIRCLE_DEGREES / 2) % CIRCLE_DEGREES;
        for (let i = winAngles.length - 1; i >= 0; i--) {
            const potentialWinner = winAngles[i];
            if (potentialWinner.angle <= winningAngle) {
                onWinner && onWinner(i);
                return;
            }
        }
    }, [rotation]);

    return (
        <>
            <div>
                <Stage width={size} height={size}>
                    <Layer>
                        <Group ref={wheelRef}
                               rotation={rotation}
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
            <Button
                variant={'primary'}
                disabled={isSpinning}
                onClick={() => setIsSpinning(true)}>
                Spin
            </Button>
        </>
    );
}