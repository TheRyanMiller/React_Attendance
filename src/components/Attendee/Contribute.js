import React from 'react';
import { Button, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

const contribute = (props) =>{
    let addAttendee = null;
    let contributeMsg = "";

    /*
    Determine what to display based on whether user has already
    contributed to this contract
    */
    if(props.hasContributed === true){
        contributeMsg = "You have already contributed.";
    }
    else{
        addAttendee = (
            <div>
                <Form horizontal>
                    <FormGroup
                        controlId="Name"
                    >
                        <ControlLabel><strong>Enter Your Name:</strong></ControlLabel>
                        <FormControl
                            type="text"
                            placeholder="Enter Name"
                            onChange={ props.setName } 
                            value={ props.name }
                        />
                        
                    </FormGroup>
                   
                    <FormGroup
                        controlId="Value"
                    >
                     <ControlLabel><strong>Contribution Value:</strong></ControlLabel>
                        <FormControl
                            type="number"
                            placeholder="Enter Value"
                            min="0"
                            onChange={ props.setAmount } 
                            value={ props.amountToContribute }
                        />
                    </FormGroup>
                    <FormControl.Feedback />
                    <Button bsStyle="success" onClick={ props.clicked }>Add Funds</Button>
                </Form> 
            
            </div>
        )
    }
    return(
        <div>
            <p>{contributeMsg}</p>
            
            {addAttendee}
        </div>
    )
    /* Code if we decide to allow additional contributions by existing attendees
        Contribution Amount: <input type="number" size="4" maxLength="4"/>
        <button>Contribute More</button>
    */
}

export default contribute;
