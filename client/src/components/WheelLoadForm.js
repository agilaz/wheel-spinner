import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';


const WheelLoadForm = ({show, options, handleClose, handleSubmit}) => {
    const [title, setTitle] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const submitWheel = () => {
        handleSubmit(title, isAdmin);
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>Load Wheel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>Title</Form.Label>
                    <Typeahead id='title' onChange={(txt) => setTitle(txt)} options={options} />
                    <br />
                    <Form.Check label={'Admin'} defaultChecked={isAdmin}
                                onChange={(evt) => setIsAdmin(evt.target.checked)} />
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