import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';

export const getUserRoute = (id) => `/wheels/${id}`;
export const getAdminRoute = (id) => `${getUserRoute(id)}/admin`


const App = () => {
    return (
        <div className='App'>
            <Router>
                <Switch>
                    <Route path={'/'} exact component={HomePage} />
                    <Route path={'/wheels/:id/admin'} exact component={AdminPage} />
                    <Route path={'/wheels/:id'} exact component={UserPage} />
                </Switch>
            </Router>
        </div>
    )
}

export default App;
