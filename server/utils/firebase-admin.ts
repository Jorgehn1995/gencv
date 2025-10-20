import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let firebaseAdminApp: App | null = null;
let firebaseAuth: Auth | null = null;
let firebaseStorage: Storage | null = null;
let firebaseFirestore: Firestore | null = null;

export const initFirebaseAdmin = (): Auth => {
  if (firebaseAuth) {
    return firebaseAuth;
  }
  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseAdminApp = existingApps[0];
    firebaseAuth = getAuth(firebaseAdminApp);
    return firebaseAuth;
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials are missing. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
    );
  }
  try {
    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\n/g, "\n"),
      }),
      storageBucket: storageBucket,
    });
    firebaseAuth = getAuth(firebaseAdminApp);
    firebaseStorage = getStorage(firebaseAdminApp);
    firebaseFirestore = getFirestore(firebaseAdminApp);
    return firebaseAuth;
  } catch (error: any) {
    throw error;
  }
};

export const getFirebaseAuth = (): Auth => {
  if (!firebaseAuth) {
    return initFirebaseAdmin();
  }
  return firebaseAuth;
};

export const getFirebaseStorage = (): Storage => {
  if (!firebaseStorage) {
    initFirebaseAdmin();
  }
  if (!firebaseStorage) {
    throw new Error("Firebase Storage is not initialized");
  }
  return firebaseStorage;
};

export const getFirebaseApp = (): App => {
  if (!firebaseAdminApp) {
    initFirebaseAdmin();
  }
  if (!firebaseAdminApp) {
    throw new Error("Firebase Admin App is not initialized");
  }
  return firebaseAdminApp;
};

export const getFirebaseFirestore = (): Firestore => {
  if (!firebaseFirestore) {
    initFirebaseAdmin();
  }
  if (!firebaseFirestore) {
    throw new Error("Firebase Firestore is not initialized");
  }
  return firebaseFirestore;
};
