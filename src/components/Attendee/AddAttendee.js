import React from 'react';

const addAttendee = (props) =>{
    return(
        <div>
            Name:   <input type="text" onChange={ props.setName } value={ props.name }/><br />
            <button onClick={ props.clicked }>Add Funds</button>
        </div>
    )

}

export default addAttendee;
