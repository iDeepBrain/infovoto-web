/**
 * Typed client for Voti Gateway /api/chat.
 */

import { createLogger } from "./logger";

const log = createLogger("GatewayAPI");
// Chat goes through Next.js API route (server-side proxy — API key never reaches browser)
// Other endpoints (stats) still go direct for now
// Server-side reads GATEWAY_URL at runtime (docker internal network: gateway:8080)
// Client-side uses NEXT_PUBLIC_GATEWAY_URL (inlined at build time: localhost:2080)
function getGatewayUrl(): string {
  if (typeof window === "undefined") {
    // Server: dynamic access prevents webpack from inlining at build time
    return process.env["GATEWAY_URL"] || process.env["NEXT_PUBLIC_GATEWAY_URL"] || "http://localhost:2080";
  }
  return process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:2080";
}
const REQUEST_TIMEOUT_MS = 30000; // 30s — allows for cold-start chain (gateway + MCP)

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

export interface CandidateCard {
  nombre: string;
  partido: string;
  cargo: string;
  foto_url?: string;
  logo_url?: string;
  dni?: string;
}

export interface ChatResponse {
  reply: string;
  sources?: SourceMetadata[];
  warnings?: Warning[];
  candidates?: CandidateCard[];
  session_id?: string;
  cached?: boolean;
}

// Utility: decode JWT payload to check expiry
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    log.debug("Token parts check", { partsLength: parts.length });

    if (parts.length !== 3) {
      log.warn("Invalid JWT format - wrong number of parts", { partsLength: parts.length });
      return true;
    }

    const payload = JSON.parse(atob(parts[1]));
    const isExpired = payload.exp < Date.now() / 1000;
    log.debug("Token expiry check", {
      exp: payload.exp,
      now: Math.floor(Date.now() / 1000),
      isExpired
    });
    return isExpired; // exp is in seconds
  } catch (err) {
    log.error("Error decoding token", { error: String(err) });
    return true; // If we can't decode, assume expired
  }
}

// ── Debates Content API (public, no auth) ──

export interface DebateSummary {
  id: string;
  numero: number;
  titulo: string;
  fecha: string;
  lugar: string;
  candidatos_count: number;
  temas: string[];
  highlight: string;
}

export interface CandidatoRef {
  nombre: string;
  partido: string;
  slug: string;
}

export interface PuntoClave {
  numero: number;
  titulo: string;
  texto: string;
}

export interface DebateDetail extends DebateSummary {
  youtube_url: string;
  candidatos: CandidatoRef[];
  puntos_clave: PuntoClave[];
  analisis_titulo: string;
  analisis_completo: string;
}

export async function getDebates(): Promise<DebateSummary[]> {
  const res = await fetch(`${getGatewayUrl()}/api/debates`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new GatewayError(res.status, "Failed to fetch debates");
  return res.json();
}

export async function getDebate(id: string): Promise<DebateDetail> {
  const res = await fetch(`${getGatewayUrl()}/api/debates/${id}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new GatewayError(res.status, `Debate ${id} not found`);
  return res.json();
}

export async function sendMessage(
  message: string
): Promise<ChatResponse> {
  log.info("sendMessage called", { messageLen: message.length });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Browser → Next.js proxy /api/chat → Gateway (API key added server-side)
    const url = "/api/chat";
    log.info("Calling proxy /api/chat", { messageLen: message.length });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });

    log.info("Gateway response received", { status: res.status, ok: res.ok });

    if (!res.ok) {
      const error = await res.text();
      log.error("Gateway returned error", { status: res.status, error });

      if (res.status === 401) {
        throw new AuthError(`Session expired: ${error}`);
      } else if (res.status === 429) {
        throw new RateLimitError(`Too many requests: ${error}`);
      } else {
        throw new GatewayError(res.status, error);
      }
    }

    const data = await res.json();
    log.info("Gateway response parsed successfully", { hasReply: !!data.reply });
    return data;
  } catch (err) {
    if (err instanceof AuthError || err instanceof RateLimitError || err instanceof GatewayError) {
      log.error("Known error type caught", { errorName: err.name });
      throw err;
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      log.warn("Request timeout (15s)");
      throw new TimeoutError("Request took too long (15s timeout)");
    }
    log.error("Unknown error in sendMessage", { error: String(err) });
    throw new GatewayError(0, String(err));
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * SSE streaming client — sends message and yields events progressively.
 * TODO: route through /api/chat/stream proxy (like sendMessage uses /api/chat)
 */
export async function* sendMessageStream(
  message: string
): AsyncGenerator<{ type: string; content?: string; data?: any }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // TODO: create /api/chat/stream proxy route (currently direct — no auth)
    const res = await fetch(`${getGatewayUrl()}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
