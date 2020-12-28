import React, { useEffect, useState } from 'react';
import API, { getErrorMessage } from '../api';
import { Wheel } from '../components/Wheel';
import { Button } from 'react-bootstrap';
import randomSpin from '../util/randomSpin';

const UserPage = ({match}) => {
    const [spin, setSpin] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [error, setError] = useState(null);
    const [wedges, setWedges] = useState(null);
    const [winner, setWinner] = useState(null);


    // On spin end, unhide the winner and update state (but not api)
    const handleSpinEnd = (winnerIndex, rotation) => {
        setSpin(null);
        setRotation(rotation);
        setWinner(wedges[winnerIndex]);
        const newWedges = [...wedges];
        newWedges[winnerIndex] = {...newWedges[winnerIndex], hidden: false};
        setWedges(newWedges);
    };

    // If url changes, reload the wedges
    useEffect(() => {
        API.getWheel(match.params.id)
            .then(resp => resp.data)
            .then(data => setWedges(data.wedges))
            .catch((err) => setError(getErrorMessage(err)));
    }, [match]);

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
            </div>
        </div>
    );
}

export default UserPage;