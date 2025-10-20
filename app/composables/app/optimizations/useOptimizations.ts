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

import { useOptimizationsStore } from "~/stores/app/optimizations";
import { useUserStore } from "~/stores/user";
import { useFirebase } from "~/composables/base/useFirebase";
import type { Optimization } from "~/types/cv";

const COLLECTION = "optimizations";

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

export default function useOptimizations() {
  const store = useOptimizationsStore();
  const userStore = useUserStore();
  const { firestore } = useFirebase();

  function upsertBatch(docs: any[]) {
    if (!docs.length) return;
    let maxUpdated = store.lastCheck.value ?? Timestamp.fromMillis(0);
    for (const doc of docs) {
      const optimization: Optimization = {
        id: doc.id,
        status: doc.status ?? '',
        harvardCV: doc.harvardCV ?? {
          personalInfo: {
            firstName: '',
            email: '',
            phone: '',
            location: '',
          },
          workExperience: [],
          skills: {
            languages: [],
            tools: [],
          },
          education: [],
        },
        coverLetter: doc.coverLetter ?? '',
        compatibility: doc.compatibility ?? { percentage: 0, description: '' },
        studyRecommendations: doc.studyRecommendations ?? [],
        cvImprovements: doc.cvImprovements ?? [],
        salaryExpectation: doc.salaryExpectation ?? {
          expectation: 0,
          range: '',
          description: '',
        },
        job: doc.job ?? { title: '', companyName: '', jobDescription: '' },
        fileURL: doc.fileURL,
        userId: doc.userId,
        createdAt: doc.createdAt ? asTimestamp(doc.createdAt) : null,
        additionalNotes: doc.additionalNotes,
      };
      store.optimizations[optimization.id] = optimization;
      const ts = asTimestamp(doc.createdAt);
      if (ts.toMillis() > maxUpdated.toMillis()) maxUpdated = ts;
    }
    store.lastCheck.value = maxUpdated;
  }

  function getOptimizations() {
    return computed(() => Object.values(store.optimizations));
  }

  function getOptimizationById(optimizationId: Id) {
    const oid = unref(optimizationId);
    return computed(() => (oid ? store.optimizations[oid] ?? null : null));
  }

  async function fetchOptimizations() {
    if (store.loading.value || !userStore.uid) return;
    store.loading.value = true;
    try {
      const constraints: QueryConstraint[] = [
        where("userId", "==", userStore.uid),
        orderBy("createdAt", "desc")
      ];
      const q = query(collection(firestore, COLLECTION), ...constraints);
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      upsertBatch(docs);
      store.loaded.value = true;
    } finally {
      store.loading.value = false;
    }
  }

  async function fetchOptimizationById(optimizationId: Id) {
    const oid = unref(optimizationId);
    if (!oid) return;
    store.loading.value = true;
    try {
      const ref = doc(firestore, COLLECTION, oid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const raw = snap.data();
        if (raw && typeof raw === 'object') {
          const optimization: Optimization = {
            id: snap.id,
            status: raw.status ?? '',
            harvardCV: raw.harvardCV ?? {
              personalInfo: {
                firstName: '',
                email: '',
                phone: '',
                location: '',
              },
              workExperience: [],
              skills: {
                languages: [],
                tools: [],
              },
              education: [],
            },
            coverLetter: raw.coverLetter ?? '',
            compatibility: raw.compatibility ?? { percentage: 0, description: '' },
            studyRecommendations: raw.studyRecommendations ?? [],
            cvImprovements: raw.cvImprovements ?? [],
            salaryExpectation: raw.salaryExpectation ?? {
              expectation: 0,
              range: '',
              description: '',
            },
            job: raw.job ?? { title: '', companyName: '', jobDescription: '' },
            fileURL: raw.fileURL,
            userId: raw.userId,
            createdAt: raw.createdAt ? asTimestamp(raw.createdAt) : null,
            additionalNotes: raw.additionalNotes,
          };
          store.optimizations[oid] = optimization;
        }
      }
    } finally {
      store.loading.value = false;
    }
  }

  function isOptimizationsLoading() {
    return computed(() => store.loading.value);
  }

  function isOptimizationsLoaded() {
    return computed(() => store.loaded.value);
  }

  function removeOptimization(optimizationId: Id) {
    const oid = unref(optimizationId);
    if (oid && store.optimizations[oid]) {
      delete store.optimizations[oid];
    }
  }

  return {
    getOptimizations,
    getOptimizationById,
    fetchOptimizations,
    fetchOptimizationById,
    isOptimizationsLoading,
    isOptimizationsLoaded,
    removeOptimization,
  };
}
