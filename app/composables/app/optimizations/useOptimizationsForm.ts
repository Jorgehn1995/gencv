import { ref } from "vue";
import useFirestore from "@/composables/base/useFirestore";
import { useFirebase } from "@/composables/base/useFirebase";
import type { NewCv } from "@/types/app";
import { buildProCVPrompt } from "@/composables/app/optimizations/utils/buildPrompts";
import { useUserStore } from "@/stores/user";
import useApi from "~/composables/base/useApi";
import type { Optimization } from "~/types/cv";
import type { Timestamp } from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage";
import useOptimizations from "~/composables/app/optimizations/useOptimizations";

export function useOptimizationsForm() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const api = useApi();
  const { ai, storage } = useFirebase();
  const { addDocument, serverTimestamp, deleteDocument, getDocument } =
    useFirestore();
  const userStore = useUserStore();
  const { removeOptimization } = useOptimizations();
  const createOptimization = async (data: NewCv) => {
    loading.value = true;
    error.value = null;
    try {
      const cv = await api.sendFile("/cv", data.cvFile!);
      const cvInfo = await api.get(`/cv/${cv.id}`);
      const prompt = buildProCVPrompt({
        cvText: cvInfo,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        jobDescription: data.jobDescription,
      });

      const result = await ai.generateContent(prompt);
      const raw =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const clean = raw.replace(/```json|```/g, "").trim();

      const parsed: Optimization = JSON.parse(clean);

      const { harvardCV, ...safeInfo } = parsed;

      const cvOptimized = await api.post("/cv/generate", {
        body: {
          cvData: harvardCV,
        },
      });
      parsed.fileURL = cvOptimized.url;
      parsed.fileURLDocx = cvOptimized.urlDocx;
      parsed.userId = userStore.fullUser?.uid || "guest";
      parsed.status = "Enviado";
      parsed.job = {
        title: data.jobTitle,
        companyName: data.companyName,
        jobDescription: data.jobDescription,
      };
      parsed.createdAt = serverTimestamp() as unknown as Timestamp;

      const optimizedId = await addDocument<Optimization>(
        "optimizations",
        parsed
      );

      return optimizedId;
    } catch (e: any) {
      error.value = e.message || "Error al guardar";
      loading.value = false;
      return false;
    }
  };

  const deleteOptimization = async (optimizationId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const optimization = await getDocument<Optimization>(
        "optimizations",
        optimizationId
      );

      if (optimization) {
        const deleteFileFromURL = async (url: string) => {
          try {
            const urlObj = new URL(url);
            const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
            if (pathMatch && pathMatch[1]) {
              const filePath = decodeURIComponent(pathMatch[1]);
              const fileRef = storageRef(storage, filePath);
              await deleteObject(fileRef);
            }
          } catch (e) {
            console.error("Error al eliminar archivo:", e);
          }
        };

        if (optimization.fileURL) {
          await deleteFileFromURL(optimization.fileURL);
        }
        if (optimization.fileURLDocx) {
          await deleteFileFromURL(optimization.fileURLDocx);
        }
      }

      await deleteDocument("optimizations", optimizationId);
      removeOptimization(optimizationId);
      loading.value = false;
      return true;
    } catch (e: any) {
      error.value = e.message || "Error al eliminar";
      loading.value = false;
      return false;
    }
  };

  return {
    loading,
    error,
    createOptimization,
    deleteOptimization,
  };
}
