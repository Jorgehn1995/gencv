export default defineEventHandler((event) => {
  const origin = getHeader(event, "origin");
  const host = getHeader(event, "host");
  const referer = getHeader(event, "referer");

  const allowedOrigins = [
    process.env.NUXT_PUBLIC_SITE_URL,
    "http://localhost:3000",
    "http://localhost:4000",
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  if (origin) {
    const isAllowedOrigin = allowedOrigins.includes(origin);

    if (isAllowedOrigin) {
      setHeader(event, "Access-Control-Allow-Origin", origin);
      setHeader(event, "Access-Control-Allow-Credentials", "true");
    } else if (process.env.NODE_ENV === "production") {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Origen no permitido",
      });
    }
  }

  setHeader(event, "X-Content-Type-Options", "nosniff");
  setHeader(event, "X-Frame-Options", "DENY");
  setHeader(event, "X-XSS-Protection", "1; mode=block");

  if (event.method === "OPTIONS") {
    setHeader(
      event,
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,PATCH"
    );
    setHeader(
      event,
      "Access-Control-Allow-Headers",
      "Authorization,Content-Type,X-Requested-With"
    );
    setHeader(event, "Access-Control-Max-Age", 86400);

    event.node.res.statusCode = 204;
    return "";
  }

  if (process.env.NODE_ENV === "development") {
    //console.log(`CORS: ${origin || "same-origin"} → ${event.path}`);
  }
});
