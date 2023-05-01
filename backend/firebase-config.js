// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbPJ5P_I0GtYgiH0WWfuhVB9QLX10EfP8",
  authDomain: "lordofthecord-a0dec.firebaseapp.com",
  projectId: "lordofthecord-a0dec",
  storageBucket: "lordofthecord-a0dec.appspot.com",
  messagingSenderId: "525026051409",
  appId: "1:525026051409:web:d2e8202a2c2bebe6baff70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

module.exports = { db };