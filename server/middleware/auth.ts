import type { DecodedIdToken } from "firebase-admin/auth";
import { verifyFirebaseToken, extractBearerToken } from "../utils/verifyToken";

export default defineEventHandler(async (event) => {
  const path = event.path;
  const publicPaths = ["/api/public", "/api/_", "/api/health"];
  const isPublicPath = publicPaths.some((publicPath) =>
    path.startsWith(publicPath)
  );
  if (isPublicPath) {
    return;
  }
  if (!path.startsWith("/api/")) {
    return;
  }
  const authHeader = getHeader(event, "authorization");
  const token = extractBearerToken(authHeader);
  if (!token) {
    return (
      setResponseStatus(event, 401),
      {
        statusCode: 401,
        statusMessage: "Unauthorized",
        message:
          "Authentication token required. Please sign in.",
      }
    );
  }
  try {
    const decodedToken: DecodedIdToken = await verifyFirebaseToken(token);
    event.context.auth = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      emailVerified: decodedToken.email_verified || false,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null,
      token: decodedToken,
    };
    if (process.env.NODE_ENV === "development") {
      console.log(`Auth: ${decodedToken.email} → ${path}`);
    }
  } catch (error: any) {
    throw error;
  }
});
