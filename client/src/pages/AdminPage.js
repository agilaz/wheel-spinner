import React, { useEffect, useState } from 'react';
import API, { getErrorMessage } from '../api';
import { Wheel } from '../components/Wheel';
import { Button, Form, Toast } from 'react-bootstrap';
import randomSpin from '../util/randomSpin';
import WheelForm from '../components/WheelForm';
import { getUserRoute } from '../App';

const AdminPage = ({match}) => {
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [spin, setSpin] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [error, setError] = useState(null);
    const [wedges, setWedges] = useState(null);
    const [winner, setWinner] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [showCopyToast, setShowCopyToast] = useState(false);

    const updateWheel = (newWedges) => {
        API.updateWheel(match.params.id, password, {wedges: newWedges})
            .then(resp => resp.data)
            .then(data => setWedges(data.wedges))
            .catch((err) => setError(getErrorMessage(err)));
    }

    const checkAuth = () => {
        setError(null);
        API.checkAdmin(match.params.id, password)
            .then(() => {
                setAuthenticated(true);
                console.log('we authed now');
            })
            .catch((err) => setError(getErrorMessage(err)));
    };

    // On spin end, unhide the winner and update state/back end
    const handleSpinEnd = (winnerIndex, rotation) => {
        setSpin(null);
        setRotation(rotation);
        setWinner(wedges[winnerIndex]);
        const newWedges = [...wedges];
        newWedges[winnerIndex] = {...newWedges[winnerIndex], hidden: false};
        setWedges(newWedges);
        updateWheel(newWedges);
    };

    const hideAllWedges = () => {
        const newWedges = [...wedges].map(wedge => ({...wedge, hidden: true}));
        updateWheel(newWedges);
    };

    const handleEdit = ({wedges}) => {
        updateWheel(wedges);
        setShowEdit(false);
    };

    const copyUserRoute = () => {
        navigator.clipboard.writeText(`${window.location.host}${getUserRoute(match.params.id)}`);
        setShowCopyToast(true);
    }

    // If url changes, reload the wedges
    useEffect(() => {
        API.getWheel(match.params.id)
            .then(resp => resp.data)
            .then(data => setWedges(data.wedges))
            .catch((err) => setError(getErrorMessage(err)));
    }, [match]);

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
    if (!wedges) {
        return (
            <p>Loading</p>
        );
    }

    // Loaded view - show wheel and controls
    return (
        <div className="App">
            <p>{winner && winner.label}</p>
            <p>{winner && winner.description}</p>
            <Wheel size={700} wedges={wedges} onSpinEnd={handleSpinEnd} spin={spin} initialRotation={rotation} />
            <div style={{flexDirection: 'row'}}>
                <Button variant={'primary'}
                        disabled={!!spin}
                        onClick={() => setSpin(randomSpin)}>
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

            <WheelForm show={showEdit}
                       title={'Edit Wheel'}
                       includePassword={false}
                       initialState={{wedges: wedges}}
                       handleClose={() => setShowEdit(false)}
                       handleSubmit={(wheel) => handleEdit(wheel)} />
        </div>
    );
}

export default AdminPage;