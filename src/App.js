import React from 'react';
import './App.css';
import Layout from './Layout';
import {Link} from 'react-router-dom';
import {BrowserRouter as Router} from 'react-router-dom';

function App(props) {
    

    return (
    <Router>
        <div className="navbar" style={{marginBottom:"0px", padding:"0px"}}>
            <div className="navbar-inner" style={{width:"100%", padding:"10px"}}>
                <div style={{float:"left"}}>
                    <Link to="/"><img alt="burgh indian admin" src="../assets/img/header_logo.png" /></Link>
                </div>
            </div>
        </div>
        <Layout />
        <div className="footer">
            <div className="container">
                <div className="footer-wrapper">
                    <div className="row">
                        <div className="span12 footer-block">
                            <div className="footer-content" style={{textAlign:"center"}}>
                                <b>PGW Auto Glass, LLC| 51 Dutilh Road, Suite 310, Cranberry Twp, PA 16066, USA. | ©2019 All Rights Reserved.</b>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Router>
  );
}

export default App;
