// Firebase Plugin for Nuxt 4 (Client-side only)
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAnalytics, type Analytics } from 'firebase/analytics'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public
  const firebaseConfig = {
    apiKey: config.firebaseApiKey,
    authDomain: config.firebaseAuthDomain,
    projectId: config.firebaseProjectId,
    storageBucket: config.firebaseStorageBucket,
    messagingSenderId: config.firebaseMessagingSenderId,
    appId: config.firebaseAppId,
    measurementId: config.firebaseMeasurementId
  }

  const app: FirebaseApp = initializeApp(firebaseConfig)

  let analytics: Analytics | null = null
  if (process.client) {
    analytics = getAnalytics(app)
  }

  return {
    provide: {
      firebase: {
        app,
        analytics
      }
    }
  }
})
