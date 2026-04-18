import { initializeApp, getApps, getApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'
import { env, hasFirebaseConfig } from '@/shared/config/env'

const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
}

// Initialize lazily — Firebase is optional for local dev, required for push notifications in prod.
const app = hasFirebaseConfig ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null

// getMessaging can only be called in the browser
export const getFirebaseMessaging = () => {
  if (typeof window === 'undefined' || !app) return null
  return getMessaging(app)
}
