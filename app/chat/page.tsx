/**
 * Chat page — protected, requires Google login.
 * Dark theme with Voti avatar and pixel art background.
 */

"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import VotiSprite from "@/app/components/VotiSprite";
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
  "¿Dónde me toca votar?",
  "¿Cuánto es la multa por no votar?",
  "Compara las propuestas de economía de Keiko y López Aliaga",
  "¿Qué candidatos tienen sentencias judiciales?",
  "¿Qué es el voto preferencial? ¿Cómo funciona?",
];

function getRandomSugeridas(count: number): string[] {
  const shuffled = [...PREGUNTAS_SUGERIDAS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Sanitize HTML tags to prevent XSS from gateway responses */
function sanitize(text: string): string {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarkdown(text: string) {
  text = sanitize(text);
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
    if (/^---+$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-2 border-gray-600" />);
      continue;
    }
    if (/^[-*•]\s/.test(line.trim())) {
      listItems.push(line.trim().replace(/^[-*•]\s/, ""));
      continue;
    }
    if (/^\d+\.\s/.test(line.trim())) {
      listItems.push(line.trim().replace(/^\d+\.\s/, ""));
      continue;
    }
    flushList();
    if (line.trim() === "") continue;
    elements.push(
      <p key={`p-${i}`} className="my-1">
        {formatInline(line)}
      </p>
    );
  }
  flushList();
  return elements;
}

function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2]) parts.push(<strong key={match.index}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={match.index}>{match[3]}</em>);
    else if (match[4] && match[5])
      parts.push(
        <a key={match.index} href={match[5]} target="_blank" rel="noopener noreferrer" className="underline text-amber-400 hover:text-amber-300">
          {match[4]}
        </a>
      );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

/** Voti avatar next to assistant messages */
function VotiAvatar({ size = 40, sprite = "voti_idle_half_blink" }: { size?: number; sprite?: string }) {
  // Sprite is portrait (470×625, ratio 0.752). Scale by height to fit in circle.
  const spriteWidth = Math.round(size * 0.75);
  return (
    <div
      className="shrink-0 rounded-full overflow-hidden border border-[#334155] bg-[#1e293b] flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <VotiSprite sprite={sprite} width={spriteWidth} />
    </div>
  );
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sugeridas] = useState(() => getRandomSugeridas(4));
  const [consentDismissed, setConsentDismissed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load consent state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setConsentDismissed(localStorage.getItem("voti_consent") === "1");
    }
  }, []);

  const isAuthenticated = status === "authenticated" && !!(session as any)?.id_token;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle ?q= param for pre-filled questions from landing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && messages.length === 0) {
      setInput(q);
      // Auto-focus the input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages.length]);

  const MAX_MESSAGE_LENGTH = 1000;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || !isAuthenticated) return;
    if (text.length > MAX_MESSAGE_LENGTH) return;

    const idToken = (session as any)?.id_token;
    if (!idToken || isTokenExpired(idToken)) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Tu sesión expiró. Por favor inicia sesión de nuevo.", isError: true, errorType: "auth" },
      ]);
      return;
    }

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const data: ChatResponse = await sendMessage(text, idToken);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, sources: data.sources, warnings: data.warnings },
      ]);
    } catch (e) {
      let errorMessage = "Lo siento, hubo un error. Por favor intenta de nuevo.";
      let errorType: Message["errorType"] = "server";

      if (e instanceof AuthError) {
        errorMessage = "Tu sesión expiró. Por favor inicia sesión de nuevo.";
        errorType = "auth";
        setTimeout(() => { signOut({ redirect: false }); router.push("/login"); }, 2000);
      } else if (e instanceof RateLimitError) {
        errorMessage = "Alcanzaste el límite de consultas. Por favor intenta más tarde.";
        errorType = "rate_limit";
      } else if (e instanceof TimeoutError) {
        errorMessage = "La solicitud tomó demasiado tiempo. Intenta nuevamente.";
        errorType = "timeout";
      } else if (e instanceof Error && e.message.includes("fetch")) {
        errorMessage = "No se puede conectar con el servidor. Verifica tu conexión.";
        errorType = "network";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: errorMessage, isError: true, errorType }]);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f1a]">
        <div className="text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0f1a] relative">
      {/* Pixel art background */}
      <div
        className="fixed inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_URL || ""}/bg-pixel-mountains.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 px-4 md:px-8 py-3 bg-[#111827] border-b border-[#1e293b]">
        <VotiAvatar size={48} sprite={loading ? "voti_thinking_squint" : "voti_idle_half_blink"} />
        <div className="flex-1">
          <h1 className="font-bold text-white text-base">VOTI</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs text-gray-400">En línea — Datos del JNE y ONPE</span>
          </div>
        </div>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            {(session as any)?.user?.email === "cristian2023ml@gmail.com" && (
              <a
                href="/stats"
                className="px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 transition"
              >
                Dashboard
              </a>
            )}
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
              className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-gray-300 rounded-lg border border-[#334155] transition"
            >
              Salir
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google", { callbackUrl: "/chat" })}
            className="px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-[#0a0f1a] font-bold rounded-lg transition"
          >
            Iniciar sesión
          </button>
        )}
      </header>

      {/* Consent banner */}
      {!consentDismissed && (
        <div className="relative z-10 flex items-center justify-between px-4 md:px-8 lg:px-32 py-2 bg-[#1e293b] border-b border-[#334155] text-xs text-gray-400">
          <span>Tus consultas se almacenan de forma anónima para mejorar el servicio.</span>
          <button
            onClick={() => { setConsentDismissed(true); localStorage.setItem("voti_consent", "1"); }}
            className="ml-3 text-gray-500 hover:text-white shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 md:px-8 lg:px-32 py-6 space-y-4">
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-[#1e293b] bg-[#111827] flex items-center justify-center">
                <VotiSprite sprite="voti_idle_half_blink" width={108} />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">¡Hola! Soy VOTI</p>
                <p className="text-gray-400 text-sm mt-1">Te ayudo a votar informado. Pregúntame sobre candidatos, propuestas o procesos electorales.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {sugeridas.map((pregunta, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(pregunta); inputRef.current?.focus(); }}
                  className="text-left text-sm px-4 py-3 rounded-xl bg-[#1e293b] border border-[#334155] text-gray-300 hover:border-amber-500/50 hover:text-white transition"
                >
                  👉 {pregunta}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {/* Voti avatar for assistant — reactive sprite */}
            {msg.role === "assistant" && (
              <VotiAvatar
                size={44}
                sprite={msg.isError ? "voti_loading_worried" : "voti_explaining_talking"}
              />
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-amber-500 text-[#0a0f1a] font-medium"
                  : msg.isError
                  ? "bg-red-900/30 text-red-200 border border-red-800/50"
                  : "bg-[#111827] text-gray-200 border border-[#1e293b]"
              }`}
            >
              {/* VOTI label for assistant messages */}
              {msg.role === "assistant" && !msg.isError && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">VOTI</span>
                  {loading && i === messages.length - 1 ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-blue-400">thinking</span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-amber-400">explaining</span>
                  )}
                </div>
              )}

              {/* Warnings */}
              {msg.warnings && msg.warnings.length > 0 && (
                <div className="mb-2 space-y-1">
                  {msg.warnings.map((w, j) => (
                    <div key={j} className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded">
                      {w.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Content */}
              {msg.role === "assistant" ? (
                <div className="text-sm leading-relaxed">
                  {renderMarkdown(
                    msg.content
                      .split("\n")
                      .filter(
                        (line) =>
                          !line.includes("Voti es una herramienta educativa") &&
                          !line.includes("Verifica siempre en") &&
                          line.trim() !== ""
                      )
                      .join("\n")
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              )}

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#334155] text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-gray-500">Fuentes:</span>
                    {msg.sources.map((s, i) => {
                      const typeColors: Record<string, string> = {
                        oficial: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                        declaracion_jurada: "bg-amber-500/10 border-amber-500/30 text-amber-400",
                        plan_gobierno: "bg-blue-500/10 border-blue-500/30 text-blue-400",
                      };
                      const colorClass = typeColors[s.data_type] || typeColors.oficial;
                      return s.url ? (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${colorClass} hover:opacity-80 transition`}
                        >
                          <span>📊</span>
                          <span>{s.name}</span>
                        </a>
                      ) : (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${colorClass}`}
                        >
                          <span>📊</span>
                          <span>{s.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <VotiAvatar size={44} sprite="voti_thinking_squint" />
            <div className="bg-[#111827] border border-[#1e293b] rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="text-sm font-bold text-white">VOTI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-blue-400">thinking</span>
              <span className="text-sm text-gray-400">Buscando información...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Disclaimer */}
      <div className="relative z-10 text-center text-[10px] text-gray-500 py-1 border-t border-[#1e293b]">
        Verifica en{" "}
        <a href="https://www.jne.gob.pe" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">JNE</a>
        {" | "}
        <a href="https://www.onpe.gob.pe" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">ONPE</a>
        {" | "}
        <a href="https://votoinformado.jne.gob.pe/home" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">Voto Informado</a>
      </div>

      {/* Input bar */}
      <div className="relative z-10 flex gap-3 px-4 md:px-8 lg:px-32 py-4 bg-[#111827] border-t border-[#1e293b]">
        {isAuthenticated ? (
          <>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Escribe tu pregunta..."
                className={`w-full bg-[#0a0f1a] border rounded-full px-5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition ${
                  input.length >= MAX_MESSAGE_LENGTH ? "border-red-500" : "border-[#1e293b] focus:border-amber-500/50"
                }`}
                disabled={loading}
                maxLength={MAX_MESSAGE_LENGTH}
              />
              {input.length > MAX_MESSAGE_LENGTH * 0.8 && (
                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] ${
                  input.length >= MAX_MESSAGE_LENGTH ? "text-red-400" : "text-gray-500"
                }`}>
                  {input.length}/{MAX_MESSAGE_LENGTH}
                </span>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim() || input.length > MAX_MESSAGE_LENGTH}
              className="w-12 h-12 bg-amber-500 text-[#0a0f1a] rounded-full flex items-center justify-center hover:bg-amber-400 disabled:opacity-40 transition text-lg font-bold shrink-0"
            >
              →
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("google", { callbackUrl: "/chat" })}
            className="flex-1 bg-amber-500 text-[#0a0f1a] font-bold py-3 rounded-full hover:bg-amber-400 transition text-sm"
          >
            Inicia sesión con Google para preguntar
          </button>
        )}
      </div>
    </div>
  );
}
