import React, { useEffect, useState } from 'react';
import API, { getErrorMessage } from '../api';
import { Wheel } from '../components/Wheel';
import { Button, Form } from 'react-bootstrap';
import randomSpin from '../util/randomSpin';
import WheelForm from '../components/WheelForm';

const AdminPage = ({match}) => {
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [spin, setSpin] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [error, setError] = useState(null);
    const [wedges, setWedges] = useState(null);
    const [winner, setWinner] = useState(null);
    const [showEdit, setShowEdit] = useState(false);

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

    useEffect(() => {
        if (wedges) {
            return;
        }

        API.getWheel(match.params.id)
            .then(resp => resp.data)
            .then(data => setWedges(data.wedges))
            .catch((err) => setError(getErrorMessage(err)));
    }, [match]);

    if (!isAuthenticated) {
        return (
            <>
                <Form onSubmit={(evt) => {
                    evt.preventDefault();
                    checkAuth();
                }}>
                    {!!error && <p>Incorrect password. Try again.</p>}
                    <Form.Label>Enter the Password for this wheel:</Form.Label>
                    <Form.Control type='password' value={password} onChange={(evt) => setPassword(evt.target.value)} />
                    <Button variant='primary' onClick={() => checkAuth()}>Submit</Button>
                </Form>
            </>
        );
    }

    if (error) {
        return (
            <p>{error}</p>
        );
    }

    if (!wedges) {
        return (
            <p>Loading</p>
        );
    }

    return (
        <div className="App">
            <p>{winner && winner.label}</p>
            <Wheel size={500} wedges={wedges} onSpinEnd={handleSpinEnd} spin={spin} initialRotation={rotation} />
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