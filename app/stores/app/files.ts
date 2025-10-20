import { defineStore } from "pinia";
import type { Timestamp } from "firebase/firestore";
import { reactive } from "vue";
import type { AppFile } from "~/types/app";

export const useFilesStore = defineStore("files", () => {
  const files = reactive<Record<string, AppFile>>({});
  const lastCheck = reactive<{ value: Timestamp | null }>({ value: null });
  const loading = reactive<{ value: boolean }>({ value: false });
  const loaded = reactive<{ value: boolean }>({ value: false });

  return {
    files,
    lastCheck,
    loading,
    loaded,
  };
});
