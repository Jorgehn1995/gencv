import {
  initializeApp,
  cert,
  getApps,
  type App,
  applicationDefault,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | null = null;
let auth: Auth | null = null;
let storage: Storage | null = null;
let db: Firestore | null = null;

function normalizePem(v?: string | null) {
  if (!v) return undefined;
  let val = v.trim();

  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }

  val = val.replace(/\r\n/g, "\n");

  if (val.includes("\\n")) {
    val = val.replace(/\\n/g, "\n");
  }

  return val;
}

export const initFirebaseAdmin = (): Auth => {
  if (auth) return auth;
  const existing = getApps();
  if (existing.length) {
    app = existing[0];
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = normalizePem(process.env.FIREBASE_PRIVATE_KEY);
    const storageBucket =
      process.env.FIREBASE_STORAGE_BUCKET ||
      (projectId ? `${projectId}.appspot.com` : undefined);

    if (projectId && clientEmail && privateKey) {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        ...(storageBucket ? { storageBucket } : {}),
      });
    } else {
      app = initializeApp({
        credential: applicationDefault(),
        ...(storageBucket ? { storageBucket } : {}),
      });
    }
  }
  auth = getAuth(app!);
  storage = getStorage(app!);
  db = getFirestore(app!);
  return auth!;
};

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    return initFirebaseAdmin();
  }
  return auth;
};

export const getFirebaseStorage = (): Storage => {
  if (!storage) {
    initFirebaseAdmin();
  }
  if (!storage) {
    throw new Error("Firebase Storage is not initialized");
  }
  return storage;
};

export const getFirebaseApp = (): App => {
  if (!app) {
    initFirebaseAdmin();
  }
  if (!app) {
    throw new Error("Firebase Admin App is not initialized");
  }
  return app;
};

export const getFirebaseFirestore = (): Firestore => {
  if (!db) {
    initFirebaseAdmin();
  }
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  return db;
};
