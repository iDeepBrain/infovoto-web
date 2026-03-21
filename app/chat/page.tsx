/**
 * Chat page — protected, requires Google login.
 * Connects to gateway /api/chat.
 */

"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createLogger } from "@/lib/logger";
import {
  sendMessage,
  type ChatResponse,
  type SourceMetadata,
  type Warning,
  AuthError,
  RateLimitError,
  TimeoutError,
  isTokenExpired,
} from "@/lib/api";

const log = createLogger("ChatPage");

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SourceMetadata[];
  warnings?: Warning[];
  isError?: boolean;
  errorType?: "auth" | "rate_limit" | "timeout" | "server" | "network";
}

const PREGUNTAS_SUGERIDAS = [
  "¿Quiénes postulan a la presidencia en 2026?",
  "¿Qué propone Renovación Popular sobre seguridad?",
  "¿Cuándo son las elecciones 2026?",
  "¿Qué es el sistema bicameral? ¿Qué cambia?",
  "¿Dónde me toca votar?",
  "¿Cuánto es la multa por no votar?",
  "¿Qué proponen sobre pensiones?",
  "¿Quién financia a Fuerza Popular?",
  "Compara las propuestas de economía de Keiko y López Aliaga",
  "¿Qué candidatos tienen sentencias judiciales?",
  "¿Cuántas cédulas de votación voy a recibir?",
  "¿Qué es el voto preferencial? ¿Cómo funciona?",
];

function getRandomSugeridas(count: number): string[] {
  const shuffled = [...PREGUNTAS_SUGERIDAS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Simple markdown-like rendering: bold, italic, lists, links, horizontal rules */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
          {listItems.map((item, i) => (
            <li key={i}>{formatInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-2 border-gray-300" />);
      continue;
    }

    // List item
    if (/^[-*•]\s/.test(line.trim())) {
      listItems.push(line.trim().replace(/^[-*•]\s/, ""));
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line.trim())) {
      listItems.push(line.trim().replace(/^\d+\.\s/, ""));
      continue;
    }

    flushList();

    // Empty line
    if (line.trim() === "") {
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1">
        {formatInline(line)}
      </p>
    );
  }

  flushList();
  return elements;
}

/** Format inline markdown: **bold**, *italic*, [links](url) */
function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Match **bold**, *italic*, [text](url)
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4] && match[5]) {
      // [text](url)
      parts.push(
        <a
          key={match.index}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 hover:text-blue-800"
        >
          {match[4]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false);
  const [sugeridas] = useState(() => getRandomSugeridas(6));
  const [showDebugLogs, setShowDebugLogs] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Intercept console methods to show debug logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalInfo = console.info;
    const originalWarn = console.warn;

    const addLog = (message: string) => {
      setDebugLogs((prev) => [...prev.slice(-50), message]); // Keep last 50 logs
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog(`[LOG] ${args.join(" ")}`);
    };
    console.error = (...args) => {
      originalError(...args);
      addLog(`[ERROR] ${args.join(" ")}`);
    };
    console.info = (...args) => {
      originalInfo(...args);
      addLog(`[INFO] ${args.join(" ")}`);
    };
    console.warn = (...args) => {
      originalWarn(...args);
      addLog(`[WARN] ${args.join(" ")}`);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.info = originalInfo;
      console.warn = originalWarn;
    };
  }, []);

  useEffect(() => {
    log.info("ChatPage mounted", { status, sessionUser: (session as any)?.user?.email });
    if (status === "unauthenticated") {
      log.warn("User not authenticated, redirecting to /login");
      router.push("/login");
    }
  }, [status, router, session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    log.info("handleSend called", { text, loading });
    if (!text || loading) {
      log.warn("handleSend: text is empty or loading");
      return;
    }

    const idToken = (session as any)?.id_token;
    if (!idToken) {
      log.error("No id_token in session", { session });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Tu sesión expiró. Por favor inicia sesión de nuevo.",
          isError: true,
          errorType: "auth",
        },
      ]);
      await signOut({ redirect: false });
      router.push("/login");
      return;
    }

    log.info("Token found", { tokenLen: idToken.length, firstChars: idToken.slice(0, 20) });

    // Check for expired token before sending
    log.info("About to call isTokenExpired()");
    const tokenExpired = isTokenExpired(idToken);
    log.info("isTokenExpired() returned", { expired: tokenExpired });

    if (tokenExpired) {
      log.error("Token is expired");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Tu sesión expiró. Por favor inicia sesión de nuevo.",
          isError: true,
          errorType: "auth",
        },
      ]);
      await signOut({ redirect: false });
      router.push("/login");
      return;
    }

    log.info("Token is valid, sending message");
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      log.info("Calling sendMessage...", { text });
      const data: ChatResponse = await sendMessage(text, idToken);
      log.info("sendMessage successful", { hasReply: !!data.reply });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          sources: data.sources,
          warnings: data.warnings,
        },
      ]);
    } catch (e) {
      log.error("sendMessage failed", { error: String(e), errorName: (e as any)?.name });

      let errorMessage = "Lo siento, hubo un error. Por favor intenta de nuevo.";
      let errorType: Message["errorType"] = "server";

      if (e instanceof AuthError) {
        log.warn("AuthError caught");
        errorMessage = "Tu sesión expiró. Por favor inicia sesión de nuevo.";
        errorType = "auth";
        // Auto-redirect to login
        setTimeout(() => {
          signOut({ redirect: false });
          router.push("/login");
        }, 2000);
      } else if (e instanceof RateLimitError) {
        log.warn("RateLimitError caught");
        errorMessage = "Alcanzaste el límite de consultas. Por favor intenta más tarde.";
        errorType = "rate_limit";
      } else if (e instanceof TimeoutError) {
        log.warn("TimeoutError caught");
        errorMessage = "La solicitud tomó demasiado tiempo. Intenta nuevamente.";
        errorType = "timeout";
      } else if (e instanceof Error && e.message.includes("fetch")) {
        log.warn("Network error caught");
        errorMessage = "No se puede conectar con el servidor. Verifica tu conexión.";
        errorType = "network";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
          isError: true,
          errorType,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Debug Logs Panel (floating) */}
      {showDebugLogs && (
        <div className="fixed bottom-20 right-4 w-96 h-64 bg-black text-white rounded-lg border border-gray-700 flex flex-col z-50">
          <div className="flex items-center justify-between p-2 border-b border-gray-700">
            <span className="text-sm font-bold">🐛 Debug Logs</span>
            <button
              onClick={() => setShowDebugLogs(false)}
              className="text-sm hover:bg-gray-700 px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto text-xs font-mono p-2 space-y-1">
            {debugLogs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              debugLogs.map((log, i) => (
                <div key={i} className="text-gray-300 break-words">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Debug Logs Button (floating) */}
      <button
        onClick={() => setShowDebugLogs(!showDebugLogs)}
        className="fixed bottom-4 right-4 px-3 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 z-50 font-mono"
      >
        🐛 {debugLogs.length}
      </button>

      {/* Header */}
      <header className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">InfoVoto</span>
          <span className="text-sm text-gray-500">Perú 2026</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/stats"
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
          >
            📊 Estadísticas
          </Link>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
            className="px-3 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded transition"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Disclaimer banner */}
      {!disclaimerDismissed && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 flex items-start justify-between text-sm text-yellow-800">
          <p>
            <strong>InfoVoto es una herramienta educativa.</strong> La IA puede cometer errores — verifica siempre en{" "}
            <a href="https://www.jne.gob.pe" target="_blank" rel="noopener noreferrer" className="underline">JNE</a>{" "}
            y{" "}
            <a href="https://www.onpe.gob.pe" target="_blank" rel="noopener noreferrer" className="underline">ONPE</a>.
            Tus consultas se almacenan de forma anónima para mejorar el sistema.
          </p>
          <button onClick={() => setDisclaimerDismissed(true)} className="ml-4 shrink-0 font-bold">✕</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="mt-8 space-y-4">
            <div className="text-center text-gray-400">
              <p>¿En qué puedo ayudarte?</p>
              <p className="text-sm mt-2">
                Pregunta sobre candidatos, planes de gobierno, o locales de votación.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {sugeridas.map((pregunta, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(pregunta);
                  }}
                  className="text-left text-sm px-3 py-2 rounded-lg border border-gray-200 hover:border-red-400 hover:bg-red-50 text-gray-600 hover:text-gray-900 transition"
                >
                  {pregunta}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-red-600 text-white"
                  : msg.isError && msg.errorType === "auth"
                  ? "bg-red-50 text-red-900 border border-red-200"
                  : msg.isError && msg.errorType === "rate_limit"
                  ? "bg-amber-50 text-amber-900 border border-amber-200"
                  : msg.isError && msg.errorType === "timeout"
                  ? "bg-orange-50 text-orange-900 border border-orange-200"
                  : msg.isError && msg.errorType === "network"
                  ? "bg-blue-50 text-blue-900 border border-blue-200"
                  : msg.isError
                  ? "bg-gray-50 text-gray-900 border border-gray-200"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {/* Warnings badge */}
              {msg.warnings && msg.warnings.length > 0 && (
                <div className="mb-2 space-y-1">
                  {msg.warnings.map((w, j) => (
                    <div
                      key={j}
                      className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded"
                    >
                      {w.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Message content with markdown */}
              {msg.role === "assistant" ? (
                <div className="text-sm leading-relaxed">{renderMarkdown(msg.content)}</div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs opacity-70">
                  <p className="font-semibold mb-1">Fuentes:</p>
                  <ul className="space-y-0.5">
                    {msg.sources.map((s, j) => (
                      <li key={j}>
                        {s.url ? (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-600"
                          >
                            {s.name}
                          </a>
                        ) : (
                          s.name
                        )}
                        {s.data_type === "declaracion_jurada" && (
                          <span className="ml-1 text-amber-600">(Declaración Jurada)</span>
                        )}
                        {s.data_type === "plan_gobierno" && (
                          <span className="ml-1 text-blue-600">(Plan de Gobierno)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 text-gray-500 text-sm">
              Consultando fuentes...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer disclaimer */}
      <div className="text-center text-xs text-gray-400 py-1 border-t border-gray-100">
        Verifica siempre en{" "}
        <a href="https://www.jne.gob.pe" target="_blank" rel="noopener noreferrer" className="underline">JNE</a>
        {" "}y{" "}
        <a href="https://www.onpe.gob.pe" target="_blank" rel="noopener noreferrer" className="underline">ONPE</a>
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Escribe tu pregunta sobre las elecciones..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
