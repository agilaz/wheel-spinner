import React, { useState } from 'react';
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

    const submitWheel = (wheel) => {
        API.createWheel(wheel)
            .then((resp) => resp.data)
            .then(data => setRedirect(getAdminRoute(data.id)))
            .catch(err => setError(getErrorMessage(err)));
        setShowCreate(false);
    }

    const loadWheel = (id, isAdmin) => {
        setRedirect(isAdmin ? getAdminRoute(id) : getUserRoute(id));
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
                       title={'Create Wheel'}
                       includePassword={true}
                       handleClose={() => setShowCreate(false)}
                       handleSubmit={submitWheel} />
            <WheelLoadForm show={showLoad}
                           handleClose={() => setShowLoad(false)}
                           handleSubmit={loadWheel} />
        </>
    );
}

export default HomePage;