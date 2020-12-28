import React, { useEffect, useState } from 'react';
import API, { getErrorMessage } from '../api';
import { Wheel } from '../components/Wheel';

const AdminPage = ({match}) => {
    const [error, setError] = useState(null);
    const [wedges, setWedges] = useState(null);
    const [winner, setWinner] = useState(null);

    const handleWinner = (winnerIndex) => {
        setWinner(wedges[winnerIndex]);
        const newWedges = [...wedges];
        newWedges[winnerIndex] = {...newWedges[winnerIndex], hidden: false};
        setWedges(newWedges);
        API.updateWheel(match.params.id, match.params.hash, {wedges: newWedges})
            .then(resp => resp.data)
            .then(data => setWedges(data.wedges))
            .catch((err) => setError(getErrorMessage(err)));
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
            <Wheel size={500} wedges={wedges} onWinner={handleWinner} />
        </div>
    );
}

export default AdminPage;