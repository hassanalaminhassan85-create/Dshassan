import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  onAuthStateChanged
} from "firebase/auth";

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyCAMd4TDpQKAh2yCU0j-Z2f107QKoSVWDA",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "aesthetic-reference-fw1xt.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "aesthetic-reference-fw1xt",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "aesthetic-reference-fw1xt.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "1008870369485",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:1008870369485:web:99325dfe52ae1f0da56184"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  onAuthStateChanged
};
