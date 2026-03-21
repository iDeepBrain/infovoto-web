/**
 * Typed client for InfoVoto Gateway /api/chat.
 */

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:2080";

export interface SourceMetadata {
  name: string;
  url?: string;
  last_updated?: string;
  data_type: string; // "oficial" | "declaracion_jurada" | "plan_gobierno" | "ia_interpretacion"
}

export interface Warning {
  type: string; // "declaracion_jurada" | "ia_interpretacion" | "datos_incompletos" | "sesgo_detectado"
  message: string;
}

export interface ChatResponse {
  reply: string;
  sources?: SourceMetadata[];
  warnings?: Warning[];
  session_id?: string;
  cached?: boolean;
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

/**
 * SSE streaming client — sends message and yields events progressively.
 */
export async function* sendMessageStream(
  message: string,
  idToken: string
): AsyncGenerator<{ type: string; content?: string; data?: any }> {
  const res = await fetch(`${GATEWAY_URL}/api/chat/stream`, {
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

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const event = JSON.parse(line.slice(6));
          yield event;
        } catch {
          // Skip malformed events
        }
      }
    }
  }
}
