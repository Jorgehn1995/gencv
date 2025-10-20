import { defineStore } from "pinia";
import type { Timestamp } from "firebase/firestore";
import { reactive } from "vue";
import type { Optimization } from "~/types/cv";

export const useOptimizationsStore = defineStore("optimizations", () => {
  const optimizations = reactive<Record<string, Optimization>>({});
  const lastCheck = reactive<{ value: Timestamp | null }>({ value: null });
  const loading = reactive<{ value: boolean }>({ value: false });
  const loaded = reactive<{ value: boolean }>({ value: false });

  return {
    optimizations,
    lastCheck,
    loading,
    loaded,
  };
});
