/**
 * Next.js middleware — protects /chat/* routes.
 * Unauthenticated users can view /chat but can't send messages
 * (the UI shows a login button instead of input).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow /chat to be viewable without auth (shows login button)
  // The API proxy /api/chat enforces auth server-side
  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*"],
};
