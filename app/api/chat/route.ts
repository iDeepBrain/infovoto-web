/**
 * Proxy minimal: Browser → Next.js (agrega API key + session ID) → Gateway
 * La API key NUNCA llega al browser. No requiere login.
 */
import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:2080";
const API_KEY = process.env.GATEWAY_API_KEY_WEB || "";

export async function POST(req: NextRequest) {
  // 1. Leer body
  const body = await req.json().catch(() => null);
  if (!body?.message) {
    return NextResponse.json({ detail: "Message required" }, { status: 400 });
  }

  // 2. Session ID from cookie (set by middleware)
  const sessionId = req.cookies.get("voti_session")?.value || "";

  // 3. Forward al gateway con API Key + Session ID + client IP
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  try {
    const res = await fetch(`${GATEWAY_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(API_KEY && { "X-API-Key": API_KEY }),
        ...(sessionId && { "X-Session-ID": sessionId }),
        ...(clientIp && { "X-Real-IP": clientIp }),
      },
      body: JSON.stringify({ message: body.message }),
      signal: AbortSignal.timeout(20000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    if (err.name === "TimeoutError") {
      return NextResponse.json({ detail: "Gateway timeout" }, { status: 504 });
    }
    console.error("[Proxy]", err.message);
    return NextResponse.json({ detail: "Gateway unavailable" }, { status: 502 });
  }
}
