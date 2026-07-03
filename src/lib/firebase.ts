import { initializeApp, getApps, getApp } from "firebase/app";
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
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyAYtFDIILGV0ox-OuI_tki76KRcGnkai2M",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "dstech-154d5.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "dstech-154d5",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "dstech-154d5.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "214833293571",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:214833293571:web:d3c9f2e42e9c655a65e136",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-GZZGG6E7Y0"
};

// Initialize Firebase safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

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
