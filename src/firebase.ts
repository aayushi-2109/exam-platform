import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAxJgQnq0YBjN8GDgFvmcUeYqXtH1_bXOA",
  authDomain: "exam-platform-f3af8.firebaseapp.com",
  projectId: "exam-platform-f3af8",
  storageBucket: "exam-platform-f3af8.firebasestorage.app",
  messagingSenderId: "887884153086",
  appId: "1:887884153086:web:260de033790257681825af"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Use the custom database ID from the config as second parameter of getFirestore
export const db = getFirestore(app);

export { signInWithPopup, signOut };
