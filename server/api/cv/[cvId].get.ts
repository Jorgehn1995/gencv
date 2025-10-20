import {
  getFirebaseFirestore,
  getFirebaseStorage,
} from "@@/server/utils/firebase-admin";

async function downloadFile(bucket: any, filePath: string) {
  const file = bucket.file(filePath);
  const [exists] = await file.exists();
  if (!exists) {
    throw createError({
      statusCode: 404,
      message: "File not found in Storage",
    });
  }
  return file;
}

export default defineEventHandler(async (event) => {
  const cvId = event.context.params?.cvId as string;

  if (!cvId) {
    throw createError({
      statusCode: 400,
      message: "Missing cvId parameter",
    });
  }

  const { download } = getQuery(event);
  const isDownload = download === "1";

  if (isDownload && !event.context.auth?.uid) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized. Login required to download files",
    });
  }

  const firestore = getFirebaseFirestore();
  const doc = await firestore.collection("cvs").doc(cvId).get();

  if (!doc.exists) {
    throw createError({
      statusCode: 404,
      message: "CV not found",
    });
  }

  const data = doc.data();
  const storage = getFirebaseStorage();
  const bucket = storage.bucket();

  if (isDownload) {
    if (!data?.fileUrl) {
      throw createError({
        statusCode: 404,
        message: "Original file not found for this CV",
      });
    }

    const pathUid = data.fileUrl.split("/")[1];
    if (pathUid !== event.context.auth?.uid) {
      throw createError({
        statusCode: 403,
        message: "Forbidden. You don't have permission to download this file",
      });
    }

    const file = await downloadFile(bucket, data.fileUrl);
    const [metadata, contents] = await Promise.all([
      file.getMetadata(),
      file.download(),
    ]);

    setResponseHeader(
      event,
      "Content-Type",
      metadata[0]?.contentType || "application/octet-stream"
    );
    setResponseHeader(
      event,
      "Content-Disposition",
      `attachment; filename="${data.filename || "cv"}"`
    );

    return contents[0];
  }

  if (!data?.textUrl) {
    throw createError({
      statusCode: 404,
      message: "Text file not found for this CV",
    });
  }

  const file = await downloadFile(bucket, data.textUrl);
  const [contents] = await file.download();

  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");
  return contents.toString("utf-8");
});
