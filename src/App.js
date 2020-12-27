import logo from './logo.svg';
import './App.css';
import { Wheel } from './Wheel';

function App() {
  return (
    <div className="App">
      <header className="App-header">

      Wheel:
      <br/>
      <Wheel size={500} wedges={[{weight: 10, label: 'Option 1'}, {weight:20, label: 'Option 2'}]}/>
      </header>
    </div>
  );
}

export default App;
