import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
  type Role,
} from "~/server/db/schema";
import { eq } from "drizzle-orm";

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

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    // Auth.js types require these unique keys to be declared as primary keys,
    // while the existing Prisma schema uses a separate Session id and unique constraints.
    sessionsTable: sessions as never,
    verificationTokensTable: verificationTokens as never,
  }),
  callbacks: {
    async session({ session, user }) {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: { role: true },
      });
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          image: user.image ?? session.user.image,
          role: dbUser?.role ?? "USER",
        },
      };
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
