import type { DecodedIdToken } from "firebase-admin/auth";
import { getFirebaseAuth } from "./firebase-admin";

export const verifyFirebaseToken = async (
  token: string
): Promise<DecodedIdToken> => {
  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(token, true);
    return decodedToken;
  } catch (error: any) {
    if (error.code === "auth/id-token-expired") {
      throw createError({
        statusCode: 401,
        message: "Token expired. Please sign in again.",
      });
    }
    if (error.code === "auth/id-token-revoked") {
      throw createError({
        statusCode: 401,
        message: "Token revoked. Please sign in again.",
      });
    }
    throw createError({
      statusCode: 401,
      message: "Invalid token",
      data: {
        token: token,
        error: error.message,
      },
    });
  }
};

export const extractBearerToken = (
  authHeader: string | undefined
): string | null => {
  if (!authHeader) {
    return null;
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  return parts[1];
};
