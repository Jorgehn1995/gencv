
import { getFirebaseStorage, getFirebaseFirestore } from "@@/server/utils/firebase-admin";


const MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;


function getFileExtension(mimeType: string): string {
  switch (mimeType) {
    case MIME_TYPES.pdf:
      return "pdf";
    case MIME_TYPES.docx:
      return "docx";
    default:
      return "bin";
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text || "";
  } catch (err) {
    throw err;
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (err) {
    throw err;
  }
}

async function extractTextFromFile(mimeType: string, buffer: Buffer): Promise<string> {
  if (mimeType === MIME_TYPES.pdf) return extractPdfText(buffer);
  if (mimeType === MIME_TYPES.docx) return extractDocxText(buffer);
  throw createError({ statusCode: 415, message: "Unsupported file type" });
}


async function uploadFilesToStorage(
  userId: string,
  originalName: string,
  buffer: Buffer,
  mimeType: string,
  extractedText: string
): Promise<{ originalPath: string; textPath: string }> {
  const storage = getFirebaseStorage();
  const bucket = storage.bucket();
  const timestamp = Date.now();
  const extension = getFileExtension(mimeType);
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const baseName = safeName.replace(/\.[^/.]+$/, "");
  const originalPath = `users/${userId}/files/cv/${timestamp}_${baseName}.${extension}`;
  const textPath = `users/${userId}/files/cv/${timestamp}_${baseName}.txt`;
  try {
    await Promise.all([
      bucket.file(originalPath).save(buffer, { metadata: { contentType: mimeType } }),
      bucket.file(textPath).save(extractedText, { metadata: { contentType: "text/plain; charset=utf-8" } }),
    ]);
    return { originalPath, textPath };
  } catch (err) {
    throw err;
  }
}


async function saveCvDocument(
  userId: string,
  filename: string,
  size: number,
  fileUrl: string,
  textUrl: string
): Promise<string> {
  const firestore = getFirebaseFirestore();
  const docRef = firestore.collection("cvs").doc();
  try {
    await docRef.set({
      userId,
      filename,
      size,
      fileUrl,
      textUrl,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (err) {
    throw err;
  }
}


export default defineEventHandler(async (event) => {
  const user = event.context.auth;

  if (!user || !user.uid) {
    throw createError({ statusCode: 401, message: "No autorizado. Debe iniciar sesión para subir archivos." });
  }

  const files = await readMultipartFormData(event);
  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, message: "Archivo no recibido" });
  }

  const file = files[0];
  if (!file.type || !file.data) {
    throw createError({ statusCode: 400, message: "Archivo inválido" });
  }

  if (file.data.length > MAX_FILE_SIZE_BYTES) {
    throw createError({
      statusCode: 413,
      message: "El archivo excede el tamaño máximo permitido de 10 MB",
    });
  }

  try {
    const extractedText = await extractTextFromFile(file.type, file.data);
    const { originalPath, textPath } = await uploadFilesToStorage(
      user.uid,
      file.filename || "cv",
      file.data,
      file.type,
      extractedText
    );
    const docId = await saveCvDocument(
      user.uid,
      file.filename || "cv",
      file.data.length,
      originalPath,
      textPath
    );
    return { id: docId };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "No se pudo procesar el archivo",
    });
  }
});


export type CVPostResponse = {
  id: string;
};
