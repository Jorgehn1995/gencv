import type { FirebaseApp } from "firebase/app";
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  type AI,
} from "firebase/ai";
import type { Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

export const useFirebase = () => {
  const nuxtApp = useNuxtApp();

  if (!nuxtApp.$firebase) {
    throw new Error(
      "Firebase plugin not initialized. Make sure firebase.client.ts is loaded first."
    );
  }

  const app = nuxtApp.$firebase.app as FirebaseApp;
  const analytics = nuxtApp.$firebase.analytics as Analytics | null;
  const auth: Auth = getAuth(app);
  const firestore: Firestore = getFirestore(app);
  const storage: FirebaseStorage = getStorage(app);
  const setAI: AI = getAI(app, { backend: new GoogleAIBackend() });
  const ai = getGenerativeModel(setAI, { model: "gemini-2.5-flash" });

  return {
    app,
    analytics,
    auth,
    firestore,
    storage,
    ai,
  };
};
