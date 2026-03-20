import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6Hjs10J85Ifh5Lms3v9TpinqMAtU2BBQ",
  authDomain: "gp-nuapada.firebaseapp.com",
  projectId: "gp-nuapada",
  storageBucket: "gp-nuapada.firebasestorage.app",
  messagingSenderId: "59298013255",
  appId: "1:59298013255:web:9887fb04c4fb360f425162"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);