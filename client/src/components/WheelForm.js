import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal } from 'react-bootstrap';

const EMPTY_WEDGE = {label: '', weight: 0, description: '', hidden: true};

const WheelForm = ({initialState, includePassword, title, show, handleClose, handleSubmit}) => {
    const [password, setPassword] = useState((initialState && initialState.password) || '');
    const [wedges, setWedges] = useState((initialState && initialState.wedges) || []);

    useEffect(() => {
        if (includePassword && initialState) {
            setPassword(initialState.password || '');
        }

        if (initialState) {
            setWedges(initialState.wedges || []);
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
        const newWheel = {wedges};

        if (includePassword) {
            newWheel.password = password;
        }

        handleSubmit(newWheel);
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {includePassword &&
                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control value={password} onChange={(evt) => setPassword(evt.target.value)} />
                    </Form.Group>
                    }
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
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default WheelForm;