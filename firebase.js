// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBNfMK7gnIJMp_85YmsXnAmeS4VJ5TkRg",
  authDomain: "freshly-39f17.firebaseapp.com",
  projectId: "freshly-39f17",
  storageBucket: "freshly-39f17.appspot.com",
  messagingSenderId: "700003928380",
  appId: "1:700003928380:web:7d4845371d831f2f153639",
  measurementId: "G-ZP9QE82MZ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export{firestore}