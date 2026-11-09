import NextAuth, { type NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getDb } from "@/lib/db";
import { verifyPassword } from "@/modules/identity/password";
import { sessionCookie } from "@/modules/identity/session";

export function authConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET && process.env.DATABASE_URL);
}

let cached: NextAuthResult | undefined;

export function getAuth(): NextAuthResult | null {
  if (!authConfigured()) {
    return null;
  }
  if (!cached) {
    cached = NextAuth({
      trustHost: true,
      secret: process.env.AUTH_SECRET,
      session: { strategy: "jwt" },
      cookies: {
        sessionToken: {
          name: sessionCookie.name,
          options: {
            httpOnly: sessionCookie.httpOnly,
            sameSite: sessionCookie.sameSite,
            path: sessionCookie.path,
            secure: sessionCookie.secure,
          },
        },
      },
      providers: [
        Credentials({
          credentials: {
            email: {},
            password: {},
          },
          authorize: async (credentials) => {
            const email =
              typeof credentials.email === "string"
                ? credentials.email.trim().toLowerCase()
                : "";
            const password =
              typeof credentials.password === "string" ? credentials.password : "";
            if (!email || !password) {
              return null;
            }
            const user = await getDb().user.findUnique({ where: { email } });
            if (!user || !(await verifyPassword(password, user.passwordHash))) {
              return null;
            }
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              tokenVersion: user.tokenVersion,
            };
          },
        }),
      ],
      callbacks: {
        jwt({ token, user }) {
          if (user) {
            token.sub = user.id;
            token.email = user.email ?? "";
            token.name = user.name;
            token.tokenVersion = user.tokenVersion;
          }
          return token;
        },
        session({ session, token }) {
          if (!token.sub || token.tokenVersion === undefined) {
            return session;
          }
          session.user = {
            id: token.sub,
            email: token.email ?? session.user.email ?? "",
            name: token.name ?? session.user.name ?? "",
            tokenVersion: token.tokenVersion,
            emailVerified: null,
          };
          return session;
        },
      },
    });
  }
  return cached;
}
