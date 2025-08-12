// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlyp1zUbb7voXqZLHQ-6CUuV1K5eoi7js",
  authDomain: "names-finder.firebaseapp.com",
  projectId: "names-finder",
  storageBucket: "names-finder.firebasestorage.app",
  messagingSenderId: "540186757098",
  appId: "1:540186757098:web:b1caf649e652307eeb1493",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Инициализация Firestore
export const db = getFirestore(app);
