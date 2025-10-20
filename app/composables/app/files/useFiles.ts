import { computed, unref } from "vue";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  Timestamp,
  type QueryConstraint
} from "firebase/firestore";

import { useFilesStore } from "~/stores/app/files";
import { useFirebase } from "~/composables/base/useFirebase";
import type { AppFile } from "~/types/app";

const COLLECTION = "files";

type Id = string;

function asTimestamp(value: unknown): Timestamp {
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);
  if (value && typeof value === "object" && "seconds" in (value as any) && "nanoseconds" in (value as any)) {
    const v = value as { seconds: number; nanoseconds: number };
    return new Timestamp(v.seconds, v.nanoseconds);
  }
  return Timestamp.now();
}

export default function useFiles() {
  const store = useFilesStore();
  const { firestore } = useFirebase();

  function upsertBatch(docs: any[]) {
    if (!docs.length) return;
    let maxUpdated = store.lastCheck.value ?? Timestamp.fromMillis(0);
    for (const doc of docs) {
      const file: AppFile = {
        id: doc.id,
        name: doc.name ?? '',
        url: doc.url ?? '',
        path: doc.path ?? '',
        size: doc.size,
        category: doc.category ?? '',
        updatedAt: asTimestamp(doc.updatedAt),
      };
      store.files[file.id] = file;
      const ts = asTimestamp(doc.updatedAt);
      if (ts.toMillis() > maxUpdated.toMillis()) maxUpdated = ts;
    }
    store.lastCheck.value = maxUpdated;
  }

  function getFiles() {
    return computed(() => Object.values(store.files));
  }

  function getFileById(fileId: Id) {
    const fid = unref(fileId);
    return computed(() => (fid ? store.files[fid] ?? null : null));
  }

  async function fetchFiles() {
    if (store.loading.value) return;
    store.loading.value = true;
    try {
      const last = store.lastCheck.value;
      const constraints: QueryConstraint[] = last
        ? [where("updatedAt", ">", last), orderBy("updatedAt")]
        : [orderBy("updatedAt")];
      const q = query(collection(firestore, COLLECTION), ...constraints);
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      upsertBatch(docs);
      if (!last) store.loaded.value = true;
    } finally {
      store.loading.value = false;
    }
  }

  async function fetchFileById(fileId: Id) {
    const fid = unref(fileId);
    if (!fid) return;
    store.loading.value = true;
    try {
      const ref = doc(firestore, COLLECTION, fid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const raw = snap.data();
        if (raw && typeof raw === 'object') {
          const file: AppFile = {
            id: snap.id,
            name: raw.name ?? '',
            url: raw.url ?? '',
            path: raw.path ?? '',
            size: raw.size,
            category: raw.category ?? '',
            updatedAt: asTimestamp(raw.updatedAt),
          };
          store.files[fid] = file;
        }
      }
    } finally {
      store.loading.value = false;
    }
  }

  function isFilesLoading() {
    return computed(() => store.loading.value);
  }

  function isFilesLoaded() {
    return computed(() => store.loaded.value);
  }

  return {
    getFiles,
    getFileById,
    fetchFiles,
    fetchFileById,
    isFilesLoading,
    isFilesLoaded,
  };
}
