/**
 * NextAuth.js configuration — Google OAuth provider.
 *
 * After Google login, sends the id_token to the gateway /auth/verify
 * to get the canonical user_id (Google sub claim).
 */

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:2080";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the Google id_token and user_id in the JWT
      if (account?.id_token) {
        token.id_token = account.id_token;

        try {
          const res = await fetch(`${GATEWAY_URL}/auth/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
          });
          if (res.ok) {
            const data = await res.json();
            token.user_id = data.user_id;
          }
        } catch (e) {
          console.error("Failed to verify token with gateway:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expose user_id to client
      (session as any).user_id = token.user_id;
      (session as any).id_token = token.id_token;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
