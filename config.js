import firebase from 'firebase/compat/app'
import 'firebase/storage';
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBLqTYCYZm0XTxWG0uabY0oolAwb-8XK08",
    authDomain: "parqr-8d2fd.firebaseapp.com",
    databaseURL: "https://parqr-8d2fd-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "parqr-8d2fd",
    storageBucket: "parqr-8d2fd.appspot.com",
    messagingSenderId: "267085407338",
    appId: "1:267085407338:web:4c70ca4740d6a1d8919613"
};

if (!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
}

export {firebase}