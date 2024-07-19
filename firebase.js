import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDJ4pHiYxMpLPT5CG5JFcZZt6AQQs98kLk",
  authDomain: "my-sample-project-70caf.firebaseapp.com",
  projectId: "my-sample-project-70caf",
  storageBucket: "my-sample-project-70caf.appspot.com",
  messagingSenderId: "128304890722",
  appId: "1:128304890722:web:7b558963d9b801c4a2623b",
  measurementId: "G-1658PHNEYZ"
};

const app = initializeApp(firebaseConfig);
let analytics;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };