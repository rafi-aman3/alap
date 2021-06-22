import firebase from 'firebase/app'
import "firebase/auth"
import "firebase/database"
import "firebase/storage"
import "firebase/analytics"

var firebaseConfig = {
    apiKey: "AIzaSyDQwBrUE269OyXNZai_cLr2j-jkmSvgdME",
    authDomain: "alap-24357.firebaseapp.com",
    databaseURL: "https://alap-24357.firebaseio.com",
    projectId: "alap-24357",
    storageBucket: "alap-24357.appspot.com",
    messagingSenderId: "28505104061",
    appId: "1:28505104061:web:e131fb5a3673efbd59a1d4",
    measurementId: "G-XMYBVHBTXQ"
  };
  
firebase.initializeApp(firebaseConfig);
firebase.analytics()
  


export default firebase