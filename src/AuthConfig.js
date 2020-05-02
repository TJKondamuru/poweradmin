
export const firebase = require('firebase');
const firebaseui= require('firebaseui')
const firebaseConfig = {
    apiKey: "AIzaSyCXj2F1t-hYp4FQtQoCOL0C5a3XVPmDlgc",
    authDomain: "burghindian.firebaseapp.com",
    databaseURL: "https://burghindian.firebaseio.com",
    projectId: "burghindian",
    storageBucket: "burghindian.appspot.com",
    messagingSenderId: "1096043058572",
    appId: "1:1096043058572:web:2a22512a379841d4"
  };
  if(firebase.apps.length === 0)
  firebase.initializeApp(firebaseConfig);

export const ui = new firebaseui.auth.AuthUI(firebase.auth())

