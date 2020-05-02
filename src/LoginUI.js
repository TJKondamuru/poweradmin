import React, {useState, useEffect} from 'react';
import {ui, firebase} from './AuthConfig';


function LoginUI(props){
    const [login, setLogin] = useState(false);
    const logout = ()=>{
        firebase.auth().signOut().then(_=>{
            setLogin(false);
        });
    }
    useEffect(()=>{
        if(!login)
        {
            const ele = document.getElementById('firebaseui-auth-container');
            ui.start(ele, {
                signInOptions:[{
                    provider:firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                    recaptchaParameters: {
                        type: 'image', // 'audio'
                        size: 'compact', // 'invisible' or 'compact'
                        badge: 'bottomleft' //' bottomright' or 'inline' applies to invisible.
                    }
                }],
                callbacks:{signInSuccessWithAuthResult:(result, url)=>{
                    debugger;
                    window.authuserid = result.user.uid;
                    setLogin(true);
                    return false;
                }},
            });
        }
    }, [login]);
    return (
        <>
        {!login && <div id="firebaseui-auth-container"></div>}
        {login && <div><button className="btn-sm btn-info" onClick={e=>logout()}>Logout</button></div>}
        </>
    )
}
export default LoginUI;