import React, {useEffect} from 'react';
import {Modal} from 'react-bootstrap';
import useAudio from '../util/useAudio';

const WinModal = ({show, handleClose, title, description, winSound}) => {
    const [, , playAudio, stopAudio] = useAudio(winSound);

    useEffect(() => {
        if (!!winSound) {
            if (show) {
                playAudio();
            } else {
                stopAudio();
            }
        }
    }, [show]);

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {title}
                </Modal.Title>
            </Modal.Header>
            {!!description &&
            <Modal.Body>
                <p>
                    {description}
                </p>
            </Modal.Body>
            }
        </Modal>
    );
};

export default WinModal;