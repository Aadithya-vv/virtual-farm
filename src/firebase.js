// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";           // ✅ this must be here
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIW3wu9om6sivf7nHSFiTaKDNo6bgSSQQ",
  authDomain: "virtual-farm-69461.firebaseapp.com",
  projectId: "virtual-farm-69461",
  storageBucket: "virtual-farm-69461.firebasestorage.app",
  messagingSenderId: "118749470480",
  appId: "1:118749470480:web:bd54e4b6de3e4891310f95",
  measurementId: "G-RSHQXV36RJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);