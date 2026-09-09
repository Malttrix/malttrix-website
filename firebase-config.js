import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyB5b_kH92kGJiU68etj8xsOqRUGx8vM9xI",
  authDomain: "malttrix-website.firebaseapp.com",
  projectId: "malttrix-website",
  storageBucket: "malttrix-website.firebasestorage.app",
  messagingSenderId: "467260327411",
  appId: "1:467260327411:web:668b3323ba95a09383be86"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

window.MalttrixFirebase = Object.freeze({ app, auth, db });
document.documentElement.dataset.firebase = "ready";
