import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA0K-OUm90GKHrWPBwFfpIdS2y1YGYZbbs",
    authDomain: "digital-lab-entry.firebaseapp.com",
    projectId: "digital-lab-entry",
    storageBucket: "digital-lab-entry.firebasestorage.app",
    messagingSenderId: "75277444065",
    appId: "1:75277444065:web:8e87195bd016432cce68a0"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { app, db };