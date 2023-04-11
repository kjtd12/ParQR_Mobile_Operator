import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyAplz1Dmsw_orCLxdsrdfLbzOzzyaIuwWo",
    authDomain: "fir-auth-81e51.firebaseapp.com",
    projectId: "fir-auth-81e51",
    storageBucket: "fir-auth-81e51.appspot.com",
    messagingSenderId: "58287221678",
    appId: "1:58287221678:web:62de2102412d161985363f"
};

if (!firebase.apps.lenth){
    firebase.initializeApp(firebaseConfig);
}

export {firebase}