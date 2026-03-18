/**
 * Typed client for InfoVoto Gateway /api/chat.
 */

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:2080";

export interface ChatResponse {
  reply: string;
  sources?: string[];
  session_id?: string;
}

export async function sendMessage(
  message: string,
  idToken: string
): Promise<ChatResponse> {
  const res = await fetch(`${GATEWAY_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gateway error ${res.status}: ${error}`);
  }

  return res.json();
}
