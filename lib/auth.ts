/**
 * NextAuth.js configuration — Google OAuth provider.
 *
 * After Google login, sends the id_token to the gateway /auth/verify
 * to get the canonical user_id (Google sub claim).
 */

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createLogger } from "./logger";

const log = createLogger("NextAuth");

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:2080";
const SESSION_MAX_AGE = parseInt(process.env.NEXT_AUTH_SESSION_MAX_AGE || "300", 10); // Default: 5 minutes (300s)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    maxAge: SESSION_MAX_AGE, // Configurable via NEXT_AUTH_SESSION_MAX_AGE env (default: 300s = 5 min)
    updateAge: Math.floor(SESSION_MAX_AGE / 2), // Refresh session at 50% of max age
  },
  callbacks: {
    async jwt({ token, account }) {
      // On initial login, persist the tokens and user_id
      if (account?.id_token) {
        log.info("JWT callback: Initial login detected", {
          accountProvider: account.provider,
          expiresAt: account.expires_at,
        });
        token.id_token = account.id_token;
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
        token.expires_at = account.expires_at;

        try {
          log.info("Calling gateway /auth/verify...", { gatewayUrl: GATEWAY_URL });
          const res = await fetch(`${GATEWAY_URL}/auth/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
          });

          if (res.ok) {
            const data = await res.json();
            log.info("Gateway /auth/verify success", { user_id: data.user_id });
            token.user_id = data.user_id;
          } else {
            const errorText = await res.text();
            log.error("Gateway /auth/verify failed", {
              status: res.status,
              error: errorText,
            });
          }
        } catch (e) {
          log.error("Failed to verify token with gateway", { error: String(e) });
        }
      }

      // Refresh token if it's about to expire (within 5 minutes)
      if (
        token.expires_at &&
        typeof token.expires_at === "number" &&
        Date.now() + 5 * 60 * 1000 > token.expires_at * 1000
      ) {
        log.info("Token expiring soon, refreshing...", {
          expiresAt: token.expires_at,
          nowSecs: Math.floor(Date.now() / 1000),
        });
        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: (token.refresh_token as string) || "",
            }),
          });

          if (response.ok) {
            const tokens = await response.json();
            log.info("Token refresh success", { newExpiresIn: tokens.expires_in });
            token.access_token = tokens.access_token;
            token.id_token = tokens.id_token || token.id_token;
            token.expires_at = Math.floor(Date.now() / 1000) + tokens.expires_in;
            return token;
          } else {
            const errorText = await response.text();
            log.error("Token refresh failed", { status: response.status, error: errorText });
            return { ...token, error: "RefreshAccessTokenError" };
          }
        } catch (error) {
          log.error("Token refresh error", { error: String(error) });
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      return token;
    },

    async session({ session, token }) {
      log.debug("Session callback", {
        hasUserId: !!token.user_id,
        hasIdToken: !!token.id_token,
        hasError: !!token.error,
      });

      // Expose user_id and id_token to client
      (session as any).user_id = token.user_id;
      (session as any).id_token = token.id_token;
      (session as any).error = token.error;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
