import type { FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  runTransaction,
  Timestamp,
  setDoc,
  getDocFromServer,
  getDocsFromServer,
  increment,
  serverTimestamp,
  type DocumentData,
  QueryDocumentSnapshot,
  type WithFieldValue,
  type UpdateData,
  QueryConstraint,
  Transaction,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useFirebase } from "./useFirebase";

const firestoreConverter = <T extends DocumentData>() => ({
  toFirestore: (data: WithFieldValue<T>) => data,
  fromFirestore: (snap: QueryDocumentSnapshot): T & { id: string } => {
    const data = snap.data();

    const convertTimestamps = (obj: any): any => {
      if (obj === null || typeof obj !== "object") return obj;
      if (Array.isArray(obj)) return obj.map(convertTimestamps);

      return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[key] =
          value instanceof Timestamp
            ? value.toDate()
            : convertTimestamps(value);
        return acc;
      }, {} as Record<string, any>);
    };

    return {
      ...convertTimestamps(data),
      id: snap.id,
    } as T & { id: string };
  },
});

export default function () {
  const { app: $fb, firestore: $firestore } = useFirebase();

  const db = $firestore;
  const error = ref("");

  const handleError = (message: string, err: unknown) => {
    const errorMessage = `${message}: ${
      err instanceof Error ? err.message : err
    }`;
    error.value = errorMessage;
    throw new Error(errorMessage);
  };

  const getCollection = async <T extends DocumentData>(
    collectionName: string
  ) => {
    try {
      const colRef = collection(db, collectionName).withConverter(
        firestoreConverter<T>()
      );
      const snapshot = await getDocsFromServer(colRef);

      return snapshot.docs.map((doc) => doc.data());
    } catch (err) {
      return handleError("Error al obtener colección", err);
    }
  };

  const getDocument = async <T extends DocumentData>(
    collectionName: string,
    docId: string
  ) => {
    try {
      const docRef = doc(db, collectionName, docId).withConverter(
        firestoreConverter<T>()
      );
      const snapshot = await getDocFromServer(docRef);

      return snapshot.exists() ? snapshot.data() : null;
    } catch (err) {
      return handleError("Error al obtener documento", err);
    }
  };

  const addDocument = async <T extends DocumentData>(
    collectionName: string,
    data: T,
    id?: string
  ): Promise<string> => {
    try {
      const colRef = collection(db, collectionName).withConverter(
        firestoreConverter<T>()
      );

      if (id) {
        const docRef = doc(db, collectionName, id).withConverter(
          firestoreConverter<T>()
        );
        const existing = await getDocFromServer(docRef);

        if (existing.exists()) {
          throw new Error(`El documento con ID "${id}" ya existe.`);
        }

        await setDoc(docRef, data);
        return id;
      } else {
        const docRef = await addDoc(colRef, data);
        return docRef.id;
      }
    } catch (err) {
      return handleError("Error al agregar documento", err);
    }
  };

  const updateDocument = async <T extends DocumentData>(
    collectionName: string,
    docId: string,
    data: UpdateData<T> & Partial<T>
  ) => {
    try {
      const docRef = doc(db, collectionName, docId).withConverter(
        firestoreConverter<T>()
      );
      await updateDoc(docRef, data as UpdateData<T>);
      return true;
    } catch (err) {
      return handleError("Error al actualizar documento", err);
    }
  };
  const setDocument = async <T extends DocumentData>(
    collectionName: string,
    docId: string,
    data: T,
    merge = false
  ): Promise<boolean> => {
    try {
      const docRef = doc(db, collectionName, docId).withConverter(
        firestoreConverter<T>()
      );
      await setDoc(docRef, data, { merge });
      return true;
    } catch (err) {
      return handleError("Error al crear o reemplazar documento", err);
    }
  };

  const deleteDocument = async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      return handleError("Error al eliminar documento", err);
    }
  };

  const queryCollection = async <T extends DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<(T & { id: string })[]> => {
    try {
      const colRef = collection(db, collectionName).withConverter(
        firestoreConverter<T>()
      );
      const q = query(colRef, ...constraints);
      const snapshot = await getDocsFromServer(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      return handleError("Error en consulta", err);
    }
  };

  const onSnapshotCollection = <T extends DocumentData>(
    collectionName: string,
    callback: (docs: (T & { id: string })[]) => void,
    ...constraints: QueryConstraint[]
  ) => {
    const colRef = collection(db, collectionName).withConverter(
      firestoreConverter<T>()
    );
    const q = query(colRef, ...constraints);

    return onSnapshot(
      q,
      (snapshot) =>
        callback(
          snapshot.docs.map((doc) => ({
            ...(doc.data() as T),
            id: doc.id,
          }))
        ),
      (err) => handleError("Error en listener", err)
    );
  };

  const onSnapshotDocument = <T extends DocumentData>(
    collectionName: string,
    docId: string,
    callback: (doc: (T & { id: string }) | null) => void
  ) => {
    const docRef = doc(db, collectionName, docId).withConverter(
      firestoreConverter<T>()
    );

    return onSnapshot(
      docRef,
      (snap) => {
        callback(
          snap.exists()
            ? ({ ...snap.data(), id: snap.id } as T & { id: string })
            : null
        );
      },
      (err) => handleError("Error en listener documento", err)
    );
  };

  const createBatch = () => {
    const batch = writeBatch(db);

    return {
      add: <T extends DocumentData>(collectionName: string, data: T) => {
        const docRef = doc(collection(db, collectionName)).withConverter(
          firestoreConverter<T>()
        );
        batch.set(docRef, data);
        return docRef.id;
      },
      update: <T extends DocumentData>(
        collectionName: string,
        docId: string,
        data: UpdateData<T>
      ) => {
        const docRef = doc(db, collectionName, docId).withConverter(
          firestoreConverter<T>()
        );
        batch.update(docRef, data as UpdateData<DocumentData>);
      },
      delete: (collectionName: string, docId: string) => {
        const docRef = doc(db, collectionName, docId);
        batch.delete(docRef);
      },
      commit: async () => {
        try {
          await batch.commit();
          return true;
        } catch (err) {
          return handleError("Error en batch", err);
        }
      },
    };
  };

  const executeTransaction = async <T>(
    updateFunction: (transaction: Transaction) => Promise<T>
  ) => {
    try {
      return await runTransaction(db, async (transaction) => {
        return await updateFunction(transaction);
      });
    } catch (err) {
      return handleError("Error en transacción", err);
    }
  };

  const getPaginated = async <T extends DocumentData>(
    collectionName: string,
    itemsPerPage: number,
    orderField: string,
    lastDoc?: QueryDocumentSnapshot<T>
  ) => {
    try {
      const colRef = collection(db, collectionName).withConverter(
        firestoreConverter<T>()
      );
      const constraints: QueryConstraint[] = [
        orderBy(orderField),
        limit(itemsPerPage),
      ];
      if (lastDoc) constraints.push(startAfter(lastDoc));

      const q = query(colRef, ...constraints);
      const snapshot = await getDocsFromServer(q);

      return {
        data: snapshot.docs.map((doc) => doc.data()),
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
      };
    } catch (err) {
      return handleError("Error en paginación", err);
    }
  };

  const getDocRef = <T extends DocumentData>(
    collectionName: string,
    docId?: string
  ) => {
    return docId
      ? doc(db, collectionName, docId).withConverter(firestoreConverter<T>())
      : doc(collection(db, collectionName)).withConverter(
          firestoreConverter<T>()
        );
  };

  const resetError = () => (error.value = "");

  const uploadFile = async (
    userId: string,
    file: File,
    path: string = "images"
  ): Promise<string> => {
    try {
      const storage = getStorage($fb as FirebaseApp);
      const filePath = `images/profile/${Date.now()}_${file.name}`;
      const imgRef = storageRef(storage, filePath);

      await uploadBytes(imgRef, file);
      console.log("Subido:", filePath);

      const bucketName = "lerniz-a5496.firebasestorage.app";
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
      await waitForImageLoadWithRetry(publicUrl);

      return publicUrl;
    } catch (err) {
      return handleError("Error al subir imagen de perfil", err);
    }
  };
  function waitForImageLoadWithRetry(
    url: string,
    retries = 3,
    delay = 1000 // milisegundos
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const tryLoad = (attempt: number) => {
        const img = new Image();
        img.src = url + `?cachebust=${Date.now()}`;

        img.onload = () => resolve();
        img.onerror = () => {
          if (attempt < retries) {
            setTimeout(() => tryLoad(attempt + 1), delay);
          } else {
            reject(
              new Error(
                "La imagen no se pudo cargar después de varios intentos."
              )
            );
          }
        };
      };

      tryLoad(1);
    });
  }

  return {
    error,
    resetError,

    getCollection,
    getDocument,
    addDocument,
    updateDocument,
    setDocument,
    deleteDocument,

    queryCollection,
    onSnapshotCollection,
    onSnapshotDocument,
    createBatch,
    runTransaction,
    getPaginated,

    getDocRef,
    orderBy,
    Timestamp,
    where,
    limit,
    uploadFile,

    serverTimestamp,
    increment,
  };
}
