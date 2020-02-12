import React from 'react';
function SpinnerBar(){
    return (
        <>
            <div style={{width:"16px", height:"16px"}} className="spinner-grow text-primary" role="status"></div>
            <div style={{width:"16px", height:"16px"}} className="spinner-grow text-secondary" role="status"></div>
            <div style={{width:"16px", height:"16px"}} className="spinner-grow text-success" role="status"></div>
            <div style={{width:"16px", height:"16px"}} className="spinner-grow text-danger" role="status"></div>
            <div style={{width:"16px", height:"16px"}} className="spinner-grow text-warning" role="status"></div>
            <div style={{width:"16px", height:"16px"}} className="spinner-grow text-info" role="status"></div>
            <div style={{width:"16px", height:"16px"}} className="spinner-grow text-light" role="status"></div>
            <div style={{width:"16px", height:"16px"}} className="spinner-grow text-dark" role="status"></div>
        </>
    )
}

export default SpinnerBar;