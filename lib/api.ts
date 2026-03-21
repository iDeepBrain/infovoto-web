/**
 * Typed client for InfoVoto Gateway /api/chat.
 */

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:2080";
const REQUEST_TIMEOUT_MS = 15000; // 15 seconds client-side timeout

// Custom error types for proper error handling in UI
export class AuthError extends Error {
  constructor(message: string = "Authentication failed") {
    super(message);
    this.name = "AuthError";
  }
}

export class RateLimitError extends Error {
  constructor(message: string = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitError";
  }
}

export class GatewayError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "GatewayError";
    this.statusCode = statusCode;
  }
}

export class TimeoutError extends Error {
  constructor(message: string = "Request timeout") {
    super(message);
    this.name = "TimeoutError";
  }
}

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

// Utility: decode JWT payload to check expiry
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true; // Invalid JWT format
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp < Date.now() / 1000; // exp is in seconds
  } catch {
    return true; // If we can't decode, assume expired
  }
}

export async function sendMessage(
  message: string,
  idToken: string
): Promise<ChatResponse> {
  // Check if token is expired before sending
  if (isTokenExpired(idToken)) {
    throw new AuthError("Session expired — please log in again");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${GATEWAY_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const error = await res.text();
      if (res.status === 401) {
        throw new AuthError(`Session expired: ${error}`);
      } else if (res.status === 429) {
        throw new RateLimitError(`Too many requests: ${error}`);
      } else {
        throw new GatewayError(res.status, error);
      }
    }

    return res.json();
  } catch (err) {
    if (err instanceof AuthError || err instanceof RateLimitError || err instanceof GatewayError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new TimeoutError("Request took too long (15s timeout)");
    }
    throw new GatewayError(0, String(err));
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * SSE streaming client — sends message and yields events progressively.
 */
export async function* sendMessageStream(
  message: string,
  idToken: string
): AsyncGenerator<{ type: string; content?: string; data?: any }> {
  // Check if token is expired before sending
  if (isTokenExpired(idToken)) {
    throw new AuthError("Session expired — please log in again");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${GATEWAY_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const error = await res.text();
      if (res.status === 401) {
        throw new AuthError(`Session expired: ${error}`);
      } else if (res.status === 429) {
        throw new RateLimitError(`Too many requests: ${error}`);
      } else {
        throw new GatewayError(res.status, error);
      }
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
  } catch (err) {
    if (err instanceof AuthError || err instanceof RateLimitError || err instanceof GatewayError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new TimeoutError("Request took too long (15s timeout)");
    }
    throw new GatewayError(0, String(err));
  } finally {
    clearTimeout(timeoutId);
  }
}
