import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import API, { getErrorMessage } from '../api';
import WheelForm from '../components/WheelForm';
import { Button } from 'react-bootstrap';
import { getAdminRoute, getUserRoute } from '../App';
import WheelLoadForm from '../components/WheelLoadForm';

const HomePage = () => {
    const [redirect, setRedirect] = useState(null);
    const [error, setError] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showLoad, setShowLoad] = useState(false);
    const [titles, setTitles] = useState([]);

    useEffect(() => {
        API.getTitles()
            .then(resp => resp.data)
            .then(data => setTitles(data.titles))
            .catch(err => setError(getErrorMessage(err)));
    }, []);

    const submitWheel = (wheel) => {
        console.log(wheel);
        API.createWheel(wheel)
            .then((resp) => resp.data)
            .then(data => setRedirect(getAdminRoute(data.id)))
            .catch(err => setError(getErrorMessage(err)));
        setShowCreate(false);
    }

    const loadWheel = (title, isAdmin) => {
        API.findWheel({title})
            .then((resp) => resp.data)
            .then(data => setRedirect(isAdmin ? getAdminRoute(data._id) : getUserRoute(data._id)))
            .catch(err => setError(getErrorMessage(err)));
    }

    if (redirect) {
        return <Redirect to={redirect} push={true} />
    }

    return (
        <>
            {error && <p>{error}</p>}
            <p>Hello.</p>
            <div style={{flexDirection: 'row'}}>
                <Button variant={'primary'}
                        onClick={() => setShowCreate(true)}>
                    Create New Wheel
                </Button>
                <Button variant={'success'}
                        onClick={() => setShowLoad(true)}>
                    Load Existing Wheel
                </Button>
            </div>
            <WheelForm show={showCreate}
                       modalTitle={'Create Wheel'}
                       includePassword={true}
                       handleClose={() => setShowCreate(false)}
                       handleSubmit={submitWheel} />
            <WheelLoadForm show={showLoad}
                           options={titles}
                           handleClose={() => setShowLoad(false)}
                           handleSubmit={loadWheel} />
        </>
    );
}

export default HomePage;