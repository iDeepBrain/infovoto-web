/**
 * Chat page — protected, requires Google login.
 * Connects to gateway /api/chat.
 */

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sendMessage } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const idToken = (session as any)?.id_token;
    if (!idToken) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const data = await sendMessage(text, idToken);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, sources: data.sources },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento, hubo un error. Por favor intenta de nuevo.",
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
      {/* Header */}
      <header className="border-b p-4 flex items-center gap-2">
        <span className="font-bold text-lg">InfoVoto</span>
        <span className="text-sm text-gray-500">Perú 2026</span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p>¿En qué puedo ayudarte?</p>
            <p className="text-sm mt-2">
              Pregunta sobre candidatos, planes de gobierno, o locales de votación.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 text-xs opacity-70">
                  <p className="font-semibold">Fuentes:</p>
                  <ul className="list-disc list-inside">
                    {msg.sources.map((s, j) => <li key={j}>{s}</li>)}
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
