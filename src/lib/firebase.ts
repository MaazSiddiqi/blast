import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC9Qc1P2ZJ55OlmptWtXRTvqq7EhBvF62Q",
  authDomain: "blast-6972f.firebaseapp.com",
  projectId: "blast-6972f",
  storageBucket: "blast-6972f.appspot.com",
  messagingSenderId: "713020958017",
  appId: "1:713020958017:web:232957caabdd7098cb6dc0",
  measurementId: "G-HKLE242VJX",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

export const NEW_ROOM_SCHEMA = {
  members: [],
  code: "",
  accessToken: ""
};
