import React from 'react';
import { Form } from 'react-bootstrap';

const SpinsControls = ({allowedSpins, setAllowedSpins}) => {
    return (
        <>
            <Form inline>
                <Form.Label style={{marginRight: '.5em'}}>Spins:</Form.Label>
                <Form.Control value={allowedSpins >= 0 ? allowedSpins : ''}
                              disabled={allowedSpins < 0}
                              type={'number'}
                              style={{marginRight: '.5em'}}
                              onChange={(evt) => setAllowedSpins(Number(evt.target.value))} />
                <Form.Check label={'Infinite'}
                            checked={allowedSpins < 0}
                            onChange={(evt) => evt.target.checked ? setAllowedSpins(-1) : setAllowedSpins(0)} />
            </Form>
        </>
    )
}

export default SpinsControls;