// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDhSz3qCD1XL6tqb1httM0p4lnEQ9aEbyk",
  authDomain: "bakery-toshankanwar-website.firebaseapp.com",
  projectId: "bakery-toshankanwar-website",
  storageBucket: "bakery-toshankanwar-website.firebasestorage.app",
  messagingSenderId: "492744979011",
  appId: "1:492744979011:web:daaea7b4b746f5ce84daf6"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
