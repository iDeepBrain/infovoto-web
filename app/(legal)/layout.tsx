"use client";

import { useRouter } from "next/navigation";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-300">
      <header className="border-b border-[#1e293b] px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-white transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver
          </button>
          <span className="text-sm font-semibold text-white">Voti</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-12">
        {children}
      </main>
    </div>
  );
}
