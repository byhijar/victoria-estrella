import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA94PgBABOSjQFubBMKJTM16LdTBANJwnk",
  authDomain: "joyeriavictoriaestrella.firebaseapp.com",
  projectId: "joyeriavictoriaestrella",
  storageBucket: "joyeriavictoriaestrella.firebasestorage.app",
  messagingSenderId: "569348824752",
  appId: "1:569348824752:web:2a081fad3318da0f934e75",
  measurementId: "G-XB35XRDM7V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
