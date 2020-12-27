import './App.css';
import { Wheel } from './Wheel';
import { useState } from 'react';

const INITIAL_WEDGES = [...Array(10).keys()].map((i) => ({weight: i + 1, label: `Option ${i + 1}`, hidden: true}));
console.log(JSON.stringify(INITIAL_WEDGES));
function App() {
    const [wedges, setWedges] = useState(INITIAL_WEDGES);
    const [winner, setWinner] = useState(null);

    const handleWinner = (winnerIndex) => {
        setWinner(wedges[winnerIndex]);
        const newWedges = [...wedges];
        newWedges[winnerIndex] = {...newWedges[winnerIndex], hidden: false};
        setWedges(newWedges);
    };

    return (
        <div className="App">
            <p>{winner && winner.label}</p>
            Wheel:
            <br />
            <Wheel size={500} wedges={wedges} onWinner={handleWinner} />
        </div>
    );
}

export default App;
