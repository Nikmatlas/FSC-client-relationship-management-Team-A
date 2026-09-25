import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "",
  authDomain: "fsc-crm-team-a.firebaseapp.com",
  projectId: "fsc-crm-team-a",
  storageBucket: "fsc-crm-team-a.firebasestorage.app",
  messagingSenderId: "1074666109912",
  appId: "1:1074666109912:web:ec8fd7ae55078b158750ad",
  measurementId: "G-22HK1WM5QZ"
};

export const app = initializeApp(firebaseConfig);
