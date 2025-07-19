import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: "AIzaSyDm3ucnKTl9o0irhW56vHLwbuB5Y115x14",
    authDomain: "thetawise-clone.firebaseapp.com",
    projectId: "thetawise-clone",
    storageBucket: "thetawise-clone.firebasestorage.app",
    messagingSenderId: "895603818470",
    appId: "1:895603818470:web:61dfc1e5881139b975a027",
    measurementId: "G-16EXX5N5DK"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 