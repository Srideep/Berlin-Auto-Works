import "server-only";

/**
 * Session cookie attributes. Auth.js (or the chosen provider) must use these
 * flags. The value is never readable from client JavaScript.
 */
export const sessionCookie = {
  name: "baw_session",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;
