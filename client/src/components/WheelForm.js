import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal } from 'react-bootstrap';

const EMPTY_WEDGE = {label: '', weight: 0, description: '', hidden: true};

const WheelForm = ({initialState, includePassword, modalTitle, show, handleClose, handleSubmit}) => {
    // Password only used on create
    const [password, setPassword] = useState((initialState && initialState.password) || '');

    const [title, setTitle] = useState((initialState && initialState.title || ''));
    const [spinSound, setSpinSound] = useState((initialState && initialState.spinSound || ''));
    const [winSound, setWinSound] = useState((initialState && initialState.winSound || ''));
    const [wedges, setWedges] = useState((initialState && initialState.wedges) || []);
    const [minSpins, setMinSpins] = useState((initialState && initialState.minSpins) || '');
    const [maxSpins, setMaxSpins] = useState((initialState && initialState.maxSpins) || '');
    const [minSpinDurationMillis, setMinSpinDurationMillis] = useState((initialState && initialState.minSpinDurationMillis) || '');
    const [maxSpinDurationMillis, setMaxSpinDurationMillis] = useState((initialState && initialState.maxSpinDurationMillis) || '');

    // Refresh state if the initialState/includePassword props update
    useEffect(() => {
        if (includePassword && initialState) {
            setPassword(initialState.password || '');
        }

        if (initialState) {
            setWedges(initialState.wedges || []);
            setTitle(initialState.title || '');
            setSpinSound(initialState.spinSound || '');
            setWinSound(initialState.winSound || '');
        }
    }, [includePassword, initialState]);

    const updateWedge = (idx, changes) => {
        const newWedges = [...wedges];
        newWedges[idx] = {...newWedges[idx], ...changes};
        setWedges(newWedges);
    }

    const removeWedge = (idx) => {
        const newWedges = [...wedges];
        newWedges.splice(idx, 1);
        setWedges(newWedges);
    }

    const submitChanges = () => {
        const newWheel = {
            wedges,
            title,
            spinSound,
            winSound,
            minSpins,
            maxSpins,
            minSpinDurationMillis,
            maxSpinDurationMillis
        };

        if (includePassword) {
            newWheel.password = password;
        }

        handleSubmit(newWheel);
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>Title</Form.Label>
                    <Form.Control value={title} onChange={(evt) => setTitle(evt.target.value)} />
                    {includePassword &&
                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control value={password} onChange={(evt) => setPassword(evt.target.value)} />
                    </Form.Group>
                    }
                    <Form.Label>Sound on spin</Form.Label>
                    <Form.Control value={spinSound} onChange={(evt) => setSpinSound(evt.target.value)} />
                    <Form.Label>Sound on win</Form.Label>
                    <Form.Control value={winSound} onChange={(evt) => setWinSound(evt.target.value)} />
                    <Form.Label>Min Spins</Form.Label>
                    <Form.Control value={minSpins} type={'number'}
                                  onChange={(evt) => setMinSpins(evt.target.value === '' ? '' : Number(evt.target.value))} />
                    <Form.Label>Max Spins</Form.Label>
                    <Form.Control value={maxSpins} type={'number'}
                                  onChange={(evt) => setMaxSpins(evt.target.value === '' ? '' : Number(evt.target.value))} />
                    <Form.Label>Min Spin Duration Millis</Form.Label>
                    <Form.Control value={minSpinDurationMillis} type={'number'}
                                  onChange={(evt) => setMinSpinDurationMillis(evt.target.value === '' ? '' : Number(evt.target.value))} />
                    <Form.Label>Max Spin Duration Millis</Form.Label>
                    <Form.Control value={maxSpinDurationMillis} type={'number'}
                                  onChange={(evt) => setMaxSpinDurationMillis(evt.target.value === '' ? '' : Number(evt.target.value))} />
                    <b>Options</b>
                    <hr />
                    {wedges.map((wedge, i) =>
                        (
                            <React.Fragment key={i}>
                                <Form.Label>Label</Form.Label>
                                <Form.Control value={wedge.label}
                                              onChange={(evt) => updateWedge(i, {label: evt.target.value})} />
                                <Form.Label>Description</Form.Label>
                                <Form.Control as='textarea' value={wedge.description}
                                              onChange={(evt) => updateWedge(i, {description: evt.target.value})} />
                                <Form.Row>
                                    <Col xs={7}>
                                        <Form.Label>Weight</Form.Label>
                                        <Form.Control value={wedge.weight}
                                                      type='number'
                                                      onChange={(evt) => updateWedge(i, {weight: (evt.target.value === '' ? '' : Number(evt.target.value))})} />
                                    </Col>
                                    <Col xs={3}>
                                        <Form.Label>Hidden</Form.Label>
                                        <Form.Check defaultChecked={wedge.hidden}
                                                    onChange={(evt) => updateWedge(i, {hidden: evt.target.checked})} />
                                    </Col>
                                    <Col xs={2}>
                                        <Form.Label>Delete</Form.Label>
                                        <Button variant='outline-danger' onClick={() => removeWedge(i)}>
                                            X
                                        </Button>
                                    </Col>
                                </Form.Row>

                                <hr />
                            </React.Fragment>
                        )
                    )}
                    <Button variant={'outline-dark'}
                            onClick={() => setWedges([...wedges, {...EMPTY_WEDGE}])}>
                        Add new option
                    </Button>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={submitChanges}>
                        Save
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default WheelForm;