import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getDebates, type DebateSummary } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debates Presidenciales 2026 | Voti",
  description:
    "Analisis imparcial de cada debate presidencial organizado por el JNE para las elecciones Peru 2026",
  openGraph: {
    title: "Debates Presidenciales 2026 | Voti",
    description: "Analisis imparcial de cada debate presidencial organizado por el JNE",
  },
};

const ORDINAL_LABELS: Record<number, string> = {
  1: "PRIMER DEBATE",
  2: "SEGUNDO DEBATE",
  3: "TERCER DEBATE",
};

export const dynamic = "force-dynamic";

export default async function DebatesPage() {
  const debates = await getDebates();

  return (
    <main className="min-h-screen bg-[#0a0f1a] relative">
      <div
        className="fixed inset-0 opacity-[0.15] pointer-events-none z-0"
        style={{
          backgroundImage: "url('/bg-pixel-mountains.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated" as const,
        }}
      />
      <div className="relative z-10">
        <Navbar />

        <section className="pt-28 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 animate-float-up">
                Debates Presidenciales 2026
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto animate-float-up [animation-delay:0.2s]">
                Analisis imparcial de cada debate organizado por el JNE
              </p>
            </div>

            {/* Debates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {debates.map((debate, i) => (
                <DebateCard key={debate.id} debate={debate} index={i} />
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}

function DebateCard({ debate, index }: { debate: DebateSummary; index: number }) {
  return (
    <div
      className="animate-float-up transition-transform duration-300 hover:-translate-y-2"
      style={{ animationDelay: `${0.1 + index * 0.15}s` }}
    >
      <Link
        href={`/debates/${debate.id}`}
        className="group block p-8 rounded-2xl border border-slate-700 hover:border-amber-500/50 bg-slate-800/50 hover:bg-slate-800 hover:shadow-xl transition-all h-full"
      >
        {/* Badge */}
        <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold tracking-wider mb-4">
          {ORDINAL_LABELS[debate.numero] || `DEBATE ${debate.numero}`}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-2">{debate.titulo}</h2>

        {/* Meta */}
        <p className="text-gray-400 text-sm mb-4">
          {debate.fecha} &middot; {debate.lugar} &middot; {debate.candidatos_count} candidatos
        </p>

        {/* Highlight */}
        <p className="text-gray-300 text-sm leading-relaxed mb-5 line-clamp-3">
          {debate.highlight}
        </p>

        {/* Topic chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {debate.temas.slice(0, 4).map((tema) => (
            <span
              key={tema}
              className="px-2 py-1 rounded bg-slate-700/60 text-gray-300 text-xs"
            >
              {tema}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <span className="flex-1 text-center py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm">
            Ver analisis
          </span>
          <span className="flex-1 text-center py-2.5 rounded-lg border border-slate-600 text-gray-300 font-semibold text-sm">
            Preguntarle a VOTI
          </span>
        </div>

        {/* Bottom accent */}
        <div className="mt-6 h-1 w-0 bg-gradient-to-r from-amber-400 to-orange-400 group-hover:w-full transition-all duration-300" />
      </Link>
    </div>
  );
}
