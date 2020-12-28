import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import API, { getErrorMessage } from '../api';
import WheelForm from '../components/WheelForm';
import { Button } from 'react-bootstrap';

const HomePage = () => {
    const [redirect, setRedirect] = useState(null);
    const [error, setError] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const submitWheel = (wheel) => {
        API.createWheel(wheel)
            .then((resp) => resp.data)
            .then(data => {
                setRedirect(`/wheels/${data.id}/admin`);
            })
            .catch(err => setError(getErrorMessage(err)));
        setShowCreate(false);
    }

    if (redirect) {
        return <Redirect to={redirect} push={true}/>
    }

    return (
        <>
            {error && <p>{error}</p>}
            <p>Hello.</p>
            <Button variant={'primary'}
                    onClick={() => setShowCreate(true)}>
                Create New Wheel
            </Button>
            <WheelForm show={showCreate}
                       title={'Create Wheel'}
                       includePassword={true}
                       handleClose={() => setShowCreate(false)}
                       handleSubmit={(wheel) => submitWheel(wheel)} />
        </>
    );
}

export default HomePage;