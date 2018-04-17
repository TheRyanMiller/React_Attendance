import React from 'react';
import './styles/Attendee.css';

const attendee = (props) =>{
    let validateButton = null;
    if(props.hasContributed){
        validateButton = (
            <div>
            <button>Validate</button> 
            </div>
        )
    }
    return (
        <div className="Attendee">
            {props.attendee.name}
            {validateButton}
        </div>
    )

}

export default attendee;