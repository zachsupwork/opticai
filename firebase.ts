// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVEXHsl8XX9UKDEf61xM8LaukaIgnsAYM",
  authDomain: "optic-ai-4ae67.firebaseapp.com",
  projectId: "optic-ai-4ae67",
  storageBucket: "optic-ai-4ae67.firebasestorage.app",
  messagingSenderId: "238031259394",
  appId: "1:238031259394:web:4d8fdd313078f1a66ea41b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth()