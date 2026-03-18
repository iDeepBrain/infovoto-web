/**
 * Next.js middleware — protects /chat/* routes.
 * Redirects unauthenticated users to /login.
 */

export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/chat/:path*"],
};
