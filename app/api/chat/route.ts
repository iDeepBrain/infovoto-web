/**
 * Proxy minimal: Browser → Next.js (agrega API key) → Gateway
 * La API key NUNCA llega al browser.
 */
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:2080";
const API_KEY = process.env.GATEWAY_API_KEY_WEB || "";

export async function POST(req: NextRequest) {
  // 1. Verificar session de Google
  const session = await getServerSession(authOptions);
  const idToken = (session as any)?.id_token;
  if (!session || !idToken) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  // 2. Leer body
  const body = await req.json().catch(() => null);
  if (!body?.message) {
    return NextResponse.json({ detail: "Message required" }, { status: 400 });
  }

  // 3. Forward al gateway con Bearer + API Key
  try {
    const res = await fetch(`${GATEWAY_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        ...(API_KEY && { "X-API-Key": API_KEY }),
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
