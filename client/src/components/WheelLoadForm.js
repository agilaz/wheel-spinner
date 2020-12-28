import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';


const WheelLoadForm = ({show, handleClose, handleSubmit}) => {
    const [id, setId] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const submitWheel = () => {
        handleSubmit(id, isAdmin);
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>Load Wheel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>ID</Form.Label>
                    <Form.Control value={id} onChange={(evt) => setId(evt.target.value)} />
                    <br/>
                    <Form.Check label={'Admin'} defaultChecked={isAdmin} onChange={(evt) => setIsAdmin(evt.target.checked)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={submitWheel}>
                        Load
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default WheelLoadForm;