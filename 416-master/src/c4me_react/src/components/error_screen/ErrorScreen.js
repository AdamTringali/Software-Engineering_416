import React, { /* useState , useEffect */ } from 'react';

export default function ErrorScreen(props){
    console.log(props);
    console.log(props.location.state)
    var error_msg = props.location.state.error;

    return(
        <div>

            <h1>Error Screen </h1>

            <h3>{error_msg}</h3>
            
        </div>
    );
}