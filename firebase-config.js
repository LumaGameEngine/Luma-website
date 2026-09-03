// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD31mFViinyAFMK--zcR0KzOb_dvYbAmHY",
  authDomain: "luma-dev-site.firebaseapp.com",
  projectId: "luma-dev-site",
  storageBucket: "luma-dev-site.firebasestorage.app",
  messagingSenderId: "1010190139815",
  appId: "1:1010190139815:web:e8e68317bcffb2eb243682",
  measurementId: "G-NL1J06F2RF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { app, analytics, storage, db };