import React, { useEffect, useState } from 'react';
import API, { getErrorMessage } from '../api';
import { Wheel } from '../components/Wheel';
import { Button } from 'react-bootstrap';
import io from 'socket.io-client';
import {
    ANNOUNCE_SPINNABLE,
    ANNOUNCE_WINNER,
    DO_SPIN,
    REQUEST_ROTATION_SYNC,
    REQUEST_SPIN,
    REQUEST_SPINNABLE,
    SYNC_WHEEL,
    SYNC_WHEEL_ROTATION,
    USER_ROOM
} from '../util/socketEvents';
import WinModal from '../components/WinModal';

const socket = io();

const UserPage = ({match}) => {

    const [spin, setSpin] = useState(null);
    const [isSpinnable, setSpinnable] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [error, setError] = useState(null);
    const [wheel, setWheel] = useState(null);
    const [winner, setWinner] = useState(null);
    const [showWinner, setShowWinner] = useState(false);

    // On page load, start socket; on deload, disconnect it
    useEffect(() => {
        socket.emit(USER_ROOM, {room: match.params.id});

        socket.emit(REQUEST_ROTATION_SYNC, {room: match.params.id});

        socket.emit(REQUEST_SPINNABLE, {room: match.params.id});

        // Listen for admin provided events
        socket.on(DO_SPIN, (spin) => setSpin(spin));

        socket.on(SYNC_WHEEL_ROTATION, (rotation) => setRotation(rotation));

        socket.on(SYNC_WHEEL, (wheel) => setWheel(wheel));

        socket.on(ANNOUNCE_WINNER, (winner) => {
            setWinner(winner);
            setShowWinner(true);
        });

        socket.on(ANNOUNCE_SPINNABLE, (spinnable) => setSpinnable(spinnable));

        return () => socket.disconnect();
    }, []);

    // Request spin from admin
    const requestSpin = () => {
        setSpinnable(false);
        socket.emit(REQUEST_SPIN, {room: match.params.id});
    }

    // On spin end, just clear out stale spin (expect admin to return winner and unhide wedge)
    const handleSpinEnd = () => {
        setSpin(null);
    };

    // If url changes, reload the wedges
    useEffect(() => {
        API.getWheel(match.params.id)
            .then(resp => resp.data)
            .then(data => setWheel(data))
            .catch((err) => setError(getErrorMessage(err)));
    }, [match]);

    // Error view - show error text
    if (error) {
        return (
            <p>{error}</p>
        );
    }

    // Loading view - show loading text
    if (!wheel) {
        return (
            <p>Loading</p>
        );
    }

    // Loaded view - show wheel and controls
    return (
        <div className="App">
            <p>{wheel.title}</p>
            <Wheel size={700}
                   wedges={wheel.wedges}
                   onSpinEnd={handleSpinEnd}
                   spin={spin}
                   spinSound={wheel.spinSound}
                   initialRotation={rotation} />
            <div style={{flexDirection: 'row'}}>
                <Button variant={'primary'}
                        disabled={!!spin || !isSpinnable}
                        onClick={() => requestSpin()}>
                    Spin
                </Button>
            </div>
            <WinModal show={showWinner}
                      handleClose={() => setShowWinner(false)}
                      title={winner && winner.label}
                      description={winner && winner.description}
                      winSound={wheel.winSound} />
        </div>
    );
}

export default UserPage;