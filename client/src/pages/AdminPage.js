import React, { useEffect, useState } from 'react';
import API, { getErrorMessage } from '../api';
import { Wheel } from '../components/Wheel';
import { Button, Form, Toast } from 'react-bootstrap';
import io from 'socket.io-client';
import randomSpin from '../util/randomSpin';
import WheelForm from '../components/WheelForm';
import { getUserRoute } from '../App';
import {
    ADMIN_ROOM,
    ANNOUNCE_SPINNABLE,
    ANNOUNCE_WINNER,
    DO_SPIN,
    REQUEST_ROTATION_SYNC,
    REQUEST_SPIN,
    REQUEST_SPINNABLE,
    SYNC_WHEEL,
    SYNC_WHEEL_ROTATION
} from '../util/socketEvents';
import SpinsControls from '../components/SpinsControls';
import WinModal from '../components/WinModal';

const socket = io();
const AdminPage = ({match}) => {
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [spin, setSpin] = useState(null);
    const [allowedSpins, setAllowedSpins] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [error, setError] = useState(null);
    const [wheel, setWheel] = useState(null);
    const [winner, setWinner] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [showCopyToast, setShowCopyToast] = useState(false);
    const [showWinner, setShowWinner] = useState(false);


    // If url changes, reload the wedges
    useEffect(() => {
        API.getWheel(match.params.id)
            .then(resp => resp.data)
            .then(data => setWheel(data))
            .catch((err) => setError(getErrorMessage(err)));
    }, [match]);

    // On page load, start socket, set up initial handlers; on unload, disconnect it
    useEffect(() => {
        // Join admin room for this wheel
        socket.emit(ADMIN_ROOM, {room: match.params.id});

        // Send out wheel rotation to anyone already in the user room
        socket.emit(SYNC_WHEEL_ROTATION, {room: match.params.id, rotation});

        // Disconnect when component is unloaded
        return () => socket.disconnect();
    }, []);

    // On rotation update, update the rotation sync request event listeners
    useEffect(() => {
        socket.off(REQUEST_ROTATION_SYNC);
        socket.on(REQUEST_ROTATION_SYNC, ({userId}) => socket.emit(SYNC_WHEEL_ROTATION, {
            room: match.params.id,
            rotation,
            userId
        }));
    }, [rotation]);

    // On allowedSpins update, refresh the allowed/request event listeners
    useEffect(() => {
        socket.off(REQUEST_SPINNABLE);
        socket.on(REQUEST_SPINNABLE, ({userId}) => {
            socket.emit(ANNOUNCE_SPINNABLE, {room: match.params.id, spinnable: allowedSpins !== 0, userId});
        });

        socket.off(REQUEST_SPIN);
        socket.on(REQUEST_SPIN, () => {
            startSpin();
        });
    }, [allowedSpins]);

    // Update allowedSpins and sync through event
    const changeAllowedSpins = (newAllowedSpins) => {
        setAllowedSpins(newAllowedSpins);
        socket.emit(ANNOUNCE_SPINNABLE, {room: match.params.id, spinnable: newAllowedSpins !== 0});
    }

    // Generate random spin and send to users
    const startSpin = () => {
        const spin = randomSpin(wheel);

        // Maintain spins remaining (if negative, leave as is)
        const spinsRemaining = (allowedSpins > 0) ? allowedSpins - 1 : allowedSpins;
        changeAllowedSpins(spinsRemaining);
        // Send out spin and update internal state as well
        socket.emit(DO_SPIN, {room: match.params.id, spin});
        setSpin(spin);
    }

    // Update users and db with wheel changes
    const updateWheel = (newWheel) => {
        console.log(newWheel);
        socket.emit(SYNC_WHEEL, {room: match.params.id, wheel: newWheel});
        API.updateWheel(match.params.id, password, newWheel)
            .then(resp => resp.data)
            .then(data => setWheel(data))
            .catch((err) => setError(getErrorMessage(err)));
    }

    // Ask server to verify password
    const checkAuth = () => {
        setError(null);
        API.checkAdmin(match.params.id, password)
            .then(() => setAuthenticated(true))
            .catch((err) => setError(getErrorMessage(err)));
    };

    // On spin end, unhide the winner and update state/back end
    const handleSpinEnd = (winnerIndex, rotation) => {
        setSpin(null);
        setRotation(rotation);
        setWinner(wheel.wedges[winnerIndex]);
        setShowWinner(true);
        const newWedges = [...wheel.wedges];
        newWedges[winnerIndex] = {...newWedges[winnerIndex], hidden: false};
        const newWheel = {...wheel, wedges: newWedges};
        setWheel(newWheel)
        updateWheel(newWheel);
        socket.emit(SYNC_WHEEL_ROTATION, {room: match.params.id, rotation});
        socket.emit(ANNOUNCE_WINNER, {room: match.params.id, winner: newWedges[winnerIndex]});
    };

    const hideAllWedges = () => {
        const newWedges = [...wheel.wedges].map(wedge => ({...wedge, hidden: true}));
        updateWheel({...wheel, wedges: newWedges});
    };

    const handleEdit = (newWheel) => {
        updateWheel(newWheel);
        setShowEdit(false);
    };

    const copyUserRoute = () => {
        navigator.clipboard.writeText(`https://${window.location.host}${getUserRoute(match.params.id)}`);
        setShowCopyToast(true);
    }

    // First view - not authenticated, so show password prompt
    if (!isAuthenticated) {
        return (
            <>
                <Form onSubmit={(evt) => {
                    evt.preventDefault();
                    checkAuth();
                }}>
                    {!!error && <p>Incorrect password. Try again.</p>}
                    <Form.Label>Enter the password for this wheel:</Form.Label>
                    <Form.Control type='password' value={password} onChange={(evt) => setPassword(evt.target.value)} />
                    <Button variant='primary' onClick={() => checkAuth()}>Submit</Button>
                </Form>
            </>
        );
    }

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
                        disabled={!!spin}
                        onClick={startSpin}>
                    Spin
                </Button>
                <Button variant={'warning'}
                        disabled={!!spin}
                        onClick={hideAllWedges}>
                    Hide All
                </Button>
                <Button variant={'secondary'}
                        onClick={() => setShowEdit(true)}>
                    Edit
                </Button>
            </div>

            <Button variant={'link'} onClick={copyUserRoute}>Copy User Link</Button>

            <Toast style={{flexBasis: '0'}} onClose={() => setShowCopyToast(false)} show={showCopyToast} delay={1000}
                   autohide>
                <Toast.Body>Copied!</Toast.Body>
            </Toast>

            <SpinsControls allowedSpins={allowedSpins} setAllowedSpins={changeAllowedSpins} />

            <WheelForm show={showEdit}
                       modalTitle={'Edit Wheel'}
                       includePassword={false}
                       initialState={wheel}
                       handleClose={() => setShowEdit(false)}
                       handleSubmit={(wheel) => handleEdit(wheel)} />

            <WinModal show={showWinner}
                      handleClose={() => setShowWinner(false)}
                      title={winner && winner.label}
                      description={winner && winner.description}
                      winSound={wheel.winSound} />
        </div>
    );
}

export default AdminPage;