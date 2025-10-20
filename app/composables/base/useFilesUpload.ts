import {
  ref as storageRef,
  uploadString,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { useFirebase } from "@/composables/base/useFirebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useUserStore } from "@/stores/user";

import type { AppFile, NewAppFile } from "~/types/app";

export const useFilesUpload = () => {
  const userStore = useUserStore();
  const { storage, firestore } = useFirebase();

  /**
   * Sube una imagen en base64 a Firebase Storage y retorna la URL pública
   * @param base64 string en formato data_url
   * @param userId id del usuario para generar el path
   * @returns url pública de la imagen
   */
  const uploadBase64Image = async (base64: string): Promise<AppFile> => {
    try {
      const userId = userStore.fullUser.uid;
      if (!userId) throw new Error("UID de usuario no disponible");
      const match = /^data:image\/(\w+);base64,/.exec(base64);
      const ext = match ? match[1] : "jpg";
      const imageId = Date.now().toString();
      const path = `users/${userId}/images/${imageId}.${ext}`;
      const ref = storageRef(storage, path);
      await uploadString(ref, base64, "data_url");
      const url = await getDownloadURL(ref);
      const id = await saveFileInfo({
        name: `${imageId}.${ext}`,
        url,
        path,
        category: "image",
        size: undefined,
      });
      return {
        id,
        name: `${imageId}.${ext}`,
        url,
        path,
        category: "image",
        size: undefined,
        updatedAt: null,
      };
    } catch (e) {
      console.error("Error al subir imagen:", e);
      throw e;
    }
  };

  /**
   * Sube un archivo genérico a Firebase Storage y retorna la URL pública
   * @param file Archivo a subir
   * @param userId id del usuario para generar el path
   * @returns url pública del archivo
   */
  const uploadFile = async (
    file: File,
    category: string = "cv"
  ): Promise<AppFile> => {
    try {
      const userId = userStore.fullUser.uid;
      if (!userId) throw new Error("UID de usuario no disponible");
      if (!file) throw new Error("Archivo no proporcionado");
      const ext = file.name.split(".").pop() || "dat";
      const fileId = Date.now().toString();
      const path = `users/${userId}/files/${fileId}.${ext}`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      const id = await saveFileInfo({
        name: file.name,
        url,
        path,
        category,
        size: file.size,
      });
      return {
        id,
        name: file.name,
        url,
        path,
        category,
        size: file.size,
        updatedAt: null,
      };
    } catch (e) {
      console.error("Error al subir archivo:", e);
      throw e;
    }
  };

  /**
   * Guarda la información del archivo en la colección /files
   * @param fileInfo Objeto con los datos del archivo
   * @returns id del documento creado
   */
  const saveFileInfo = async (fileInfo: NewAppFile) => {
    try {
      const ref = collection(firestore, "files");

      const data: Record<string, any> = {
        ...fileInfo,
        updatedAt: serverTimestamp(),
      };
      if (data.size === undefined) {
        delete data.size;
      }
      const docRef = await addDoc(ref, data);
      return docRef.id;
    } catch (e) {
      console.error("Error al guardar información del archivo:", e);
      throw e;
    }
  };

  return { uploadBase64Image, uploadFile, saveFileInfo };
};
