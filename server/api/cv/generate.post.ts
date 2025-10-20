import { generateHarvardPDF } from "@@/server/utils/generatePDF";
import { generateHarvardDOCX } from "@@/server/utils/generateDOCX";
import type { HarvardCV } from "@@/app/types/cv";

export default defineEventHandler(async (event) => {
  const user = event.context.auth;

  if (!user || !user.uid) {
    throw createError({
      statusCode: 401,
      message: "No autorizado. Debe iniciar sesión.",
    });
  }

  const body = await readBody<{ cvData: HarvardCV }>(event);

  if (!body.cvData) {
    throw createError({
      statusCode: 400,
      message: "Datos incompletos. Se requiere cvData.",
    });
  }

  try {
    const [pdfUrl, docxUrl] = await Promise.all([
      generateHarvardPDF(body.cvData, user.uid),
      generateHarvardDOCX(body.cvData, user.uid),
    ]);

    return {
      success: true,
      url: pdfUrl,
      urlDocx: docxUrl,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error al generar el CV optimizado",
    });
  }
});

export type CVGenerateResponse = {
  success: boolean;
  url: string;
  urlDocx: string;
};
