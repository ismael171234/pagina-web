import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBwQs6RtdXW0AemZcwV_c6l_AhlRIXTfs0",
  authDomain: "restaurantelaesquina-ca816.firebaseapp.com",
  projectId: "restaurantelaesquina-ca816",
  storageBucket: "restaurantelaesquina-ca816.firebasestorage.app",
  messagingSenderId: "52690860804",
  appId: "1:52690860804:web:f4e3f673f9d4855550ae51"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)