"use client";

import Link from "next/link";

export default function DebatesError({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-xl mb-4">No se pudieron cargar los debates</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
          >
            Reintentar
          </button>
          <Link href="/" className="px-4 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white transition">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
