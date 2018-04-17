import React from 'react';
import Attendee from './Attendee.js';

const attendeeList = (props) =>{
    if(props.attendees.length===0){
        return null;
    }
    let attendees = (
        <div>
        {props.attendees.map(
            (attendee,index) => {
                return <Attendee
                    className='Attendee'
                    attendee={attendee}
                    hasContributed={props.hasContributed}
                    key={attendee.address}
                    />      
            }
        )}
        </div>
    )
    return attendees;

}

export default attendeeList;