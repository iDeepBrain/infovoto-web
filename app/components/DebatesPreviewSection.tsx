import Link from "next/link";
import { getDebates } from "@/lib/api";

const ORDINAL_LABELS: Record<number, string> = {
  1: "PRIMER DEBATE",
  2: "SEGUNDO DEBATE",
  3: "TERCER DEBATE",
};

export default async function DebatesPreviewSection() {
  let debates;
  try {
    debates = await getDebates();
  } catch {
    return null; // Silently skip if gateway unavailable at build time
  }

  if (!debates.length) return null;

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Debates Presidenciales
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Analisis imparcial de cada debate organizado por el JNE
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {debates.slice(0, 3).map((debate) => (
            <Link
              key={debate.id}
              href={`/debates/${debate.id}`}
              className="group p-6 rounded-2xl border border-slate-700 hover:border-amber-500/50 bg-slate-800/50 hover:bg-slate-800 hover:shadow-xl transition-all"
            >
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold tracking-wider mb-3">
                {ORDINAL_LABELS[debate.numero] || `DEBATE ${debate.numero}`}
              </div>
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                {debate.titulo}
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                {debate.fecha} &middot; {debate.candidatos_count} candidatos
              </p>
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 mb-4">
                {debate.highlight}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {debate.temas.slice(0, 3).map((tema) => (
                  <span
                    key={tema}
                    className="px-2 py-0.5 rounded bg-slate-700/60 text-gray-400 text-xs"
                  >
                    {tema}
                  </span>
                ))}
              </div>
              <span className="text-amber-400 text-sm font-medium group-hover:underline">
                Ver analisis →
              </span>
              <div className="mt-4 h-0.5 w-0 bg-gradient-to-r from-amber-400 to-orange-400 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/debates"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-600 hover:border-amber-500/50 text-gray-300 hover:text-white font-semibold transition-all"
          >
            Ver todos los debates
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
