import './App.css';
import { Wheel } from './Wheel';
import { useState } from 'react';

function App() {
    const [winner, setWinner] = useState(null);

    const handleWinner = (winner) => {
        setWinner(winner)
    };

    return (
        <div className="App">
            <p>{winner && winner.label}</p>
            Wheel:
            <br />
            <Wheel size={500} wedges={[...Array(10).keys()].map((i) => ({weight: i + 1, label: `Option ${i + 1}`}))} onWinner={handleWinner} />
        </div>
    );
}

export default App;
