import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:2080";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const idToken = (session as any)?.id_token;
  if (!session || !idToken) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  if (session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  }

  const days = req.nextUrl.searchParams.get("days") || "30";

  try {
    const res = await fetch(`${GATEWAY_URL}/analytics/daily-stats?days=${days}`, {
      headers: { Authorization: `Bearer ${idToken}` },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("[Analytics proxy]", err.message);
    return NextResponse.json({ detail: "Gateway unavailable" }, { status: 502 });
  }
}
