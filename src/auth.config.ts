import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config.
 * This file MUST NOT import bcryptjs, drizzle, or any Node.js-only modules
 * because it runs in the Edge Runtime (middleware/proxy.ts).
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [], // Providers with DB/bcrypt are added in auth.ts only
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth }) {
      // Used by middleware to check if the request is authenticated
      return !!auth?.user;
    },
  },
  pages: {
    signIn: "/login",
  },
};
