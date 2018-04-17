import React from 'react';
import LoadingSpinner from './LoadingSpinner';
const mainFrame = (props) => {
    if(props.isVisible && !props.isLoading){
        return (
            <div>
                {props.children}
            </div>
        )
    }
    if(props.isVisible && props.isLoading){
        return (
            <div>
                <LoadingSpinner />
                <p>Please complete or cancel transaction with MetaMask.</p>
            </div>
        )
    }
    else{
        return (
            <div>
                <p>Please login with MetaMask.</p>
            </div>);
        }
}

export default mainFrame;