import React, { useEffect, useState } from 'react';
import API, { getErrorMessage } from '../api';
import { Wheel } from '../components/Wheel';
import { Button } from 'react-bootstrap';
import randomSpin from '../util/randomSpin';

const AdminPage = ({match}) => {
    const [spin, setSpin] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [error, setError] = useState(null);
    const [wedges, setWedges] = useState(null);
    const [winner, setWinner] = useState(null);

    function updateWheel(newWedges) {
        API.updateWheel(match.params.id, match.params.hash, {wedges: newWedges})
            .then(resp => resp.data)
            .then(data => setWedges(data.wedges))
            .catch((err) => setError(getErrorMessage(err)));
    }

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

    useEffect(() => {
        if (wedges) {
            return;
        }

        // First make sure we have admin access to the wheel
        API.checkAdmin(match.params.id, match.params.hash)
            .then(() => {
                // Get wheel if we have access
                API.getWheel(match.params.id)
                    .then(resp => resp.data)
                    .then(data => setWedges(data.wedges))
                    .catch((err) => setError(getErrorMessage(err)));
            })
            .catch((err) => setError(getErrorMessage(err)));

    }, [match]);

    if (error) {
        return (
            <p>{error}</p>
        )
    }

    if (!wedges) {
        return (
            <p>Loading</p>
        )

    }

    return (
        <div className="App">
            <p>{winner && winner.label}</p>
            Wheel:
            <br />
            <Wheel size={500} wedges={wedges} onSpinEnd={handleSpinEnd} spin={spin} initialRotation={rotation}/>
            <Button
                variant={'primary'}
                disabled={!!spin}
                onClick={() => setSpin(randomSpin)}>
                Spin
            </Button>
            <Button
                variant={'warning'}
                disabled={!!spin}
                onClick={hideAllWedges}>
                Hide All
            </Button>
        </div>
    );
}

export default AdminPage;