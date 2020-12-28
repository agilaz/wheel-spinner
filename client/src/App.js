import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';

const App = () => {
    return (
        <div className='App'>
            <Router>
                <Switch>
                    <Route path={'/'} exact component={HomePage} />
                    <Route path={'/wheels/admin/:id/:hash'} component={AdminPage} />
                </Switch>
            </Router>
        </div>
    )
}

export default App;
