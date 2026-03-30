/**
 * Next.js middleware — assigns anonymous session UUID cookie on first visit.
 * The cookie is used as X-Session-ID for gateway rate limiting and analytics.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get("voti_session")) {
    response.cookies.set("voti_session", crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/chat/:path*", "/api/chat"],
};
