import { createHash, timingSafeEqual } from "node:crypto";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

/** Internal account that backs the username/password admin login. */
const ADMIN_EMAIL = "admin@belmanchurch.in";

/** Constant-time comparison, so response timing can't reveal a partial match. */
function safeEqual(a: string, b: string) {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // Kept so existing Google-linked admins and photographers can still sign in.
    // There is no public login button; parishioners do not need accounts.
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: "admin",
      name: "Admin",
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const expectedUser = process.env.ADMIN_USERNAME;
        const expectedPassword = process.env.ADMIN_PASSWORD;
        if (!expectedUser || !expectedPassword) return null;

        const username =
          typeof credentials?.username === "string" ? credentials.username : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        // Evaluate both so a wrong username and a wrong password take equal time.
        const userOk = safeEqual(username.trim(), expectedUser);
        const passwordOk = safeEqual(password, expectedPassword);
        if (!userOk || !passwordOk) {
          // Slow down guessing.
          await new Promise((resolve) => setTimeout(resolve, 800));
          return null;
        }

        // A real row, so records that reference the uploader stay valid.
        const user = await db.user.upsert({
          where: { email: ADMIN_EMAIL },
          update: { role: "ADMIN" },
          create: { email: ADMIN_EMAIL, name: "Parish Admin", role: "ADMIN" },
        });
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  // Credentials sign-in requires JWT sessions.
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.id = user.id;
        token.role = dbUser?.role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: typeof token.id === "string" ? token.id : "",
          role: (token.role as Role | undefined) ?? "USER",
        },
      };
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
