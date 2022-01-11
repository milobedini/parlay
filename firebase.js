import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { initializeFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyB0aHn3gY2rg12RjtysZQ5Xqe0DF7W6S8U',
  authDomain: 'parlay-10393.firebaseapp.com',
  projectId: 'parlay-10393',
  storageBucket: 'parlay-10393.appspot.com',
  messagingSenderId: '775359686408',
  appId: '1:775359686408:web:4fa726d76c5ba01244eebd',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

export const storage = getStorage(app)

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
})

// Methods
export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}
