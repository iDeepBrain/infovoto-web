import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getDebates, getDebate, type DebateDetail } from "@/lib/api";
import type { Metadata } from "next";

const ORDINAL_LABELS: Record<number, string> = {
  1: "Primer Debate",
  2: "Segundo Debate",
  3: "Tercer Debate",
};

export async function generateStaticParams() {
  const debates = await getDebates();
  return debates.map((d) => ({ id: d.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const debate = await getDebate(id);
  return {
    title: `${debate.titulo} | Voti`,
    description: debate.highlight,
    openGraph: {
      title: `${debate.titulo} | Voti`,
      description: debate.highlight,
    },
  };
}

export default async function DebateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let debate: DebateDetail;
  try {
    debate = await getDebate(id);
  } catch {
    notFound();
  }

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

        <article className="pt-28 pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Link
              href="/debates"
              className="inline-flex items-center text-gray-400 hover:text-amber-400 transition mb-8 text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Debates
            </Link>

            {/* Hero */}
            <div className="mb-12 animate-float-up">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold tracking-wider mb-4">
                {ORDINAL_LABELS[debate.numero] || `Debate ${debate.numero}`}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{debate.titulo}</h1>
              <p className="text-gray-400 mb-4">
                {debate.fecha} &middot; {debate.lugar} &middot; {debate.candidatos_count} candidatos
              </p>

              {/* Topic chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {debate.temas.map((tema) => (
                  <span key={tema} className="px-3 py-1 rounded-full bg-slate-700/60 text-gray-300 text-sm">
                    {tema}
                  </span>
                ))}
              </div>

              {/* YouTube link */}
              {debate.youtube_url && (
                <a
                  href={debate.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition text-sm font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  Ver debate en YouTube
                </a>
              )}
            </div>

            {/* Candidatos grid */}
            <section className="mb-12 animate-float-up [animation-delay:0.1s]">
              <h2 className="text-xl font-bold text-white mb-4">Candidatos participantes</h2>
              <div className="flex flex-wrap gap-2">
                {debate.candidatos.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/chat?q=${encodeURIComponent(`Que dijo ${c.nombre} en el debate?`)}`}
                    className="px-3 py-2 rounded-lg border border-slate-700 hover:border-amber-500/50 bg-slate-800/50 hover:bg-slate-800 text-sm text-gray-300 hover:text-white transition-all"
                  >
                    <span className="font-medium">{c.nombre}</span>
                    <span className="text-gray-500 ml-1">({c.partido})</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Puntos Clave */}
            {debate.puntos_clave.length > 0 && (
              <section className="mb-12 animate-float-up [animation-delay:0.2s]">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-bold text-white">Puntos Clave del Debate</h2>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Analisis IA
                  </span>
                </div>

                {/* Disclaimer */}
                <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-xs">
                  Analisis sintetizado con NotebookLM a partir de los debates del JNE. No representa postura editorial.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {debate.puntos_clave.map((pk) => (
                    <div
                      key={pk.numero}
                      className="p-5 rounded-xl border border-slate-700 bg-slate-800/50"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm">
                          {pk.numero}
                        </span>
                        <div>
                          <h3 className="font-semibold text-white mb-1">{pk.titulo}</h3>
                          <p className="text-gray-400 text-sm leading-relaxed">{pk.texto}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Analisis Completo */}
            {debate.analisis_completo && (
              <section className="mb-12 animate-float-up [animation-delay:0.3s]">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-bold text-white">Analisis Completo</h2>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Analisis IA
                  </span>
                </div>

                <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50">
                  {/* Disclaimer */}
                  <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-xs">
                    Este analisis fue sintetizado con NotebookLM a partir de los debates presidenciales del JNE.
                    Son declaraciones de los candidatos, no compromisos vinculantes. No constituye postura editorial.
                  </div>

                  <div className="prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-a:text-amber-400 text-gray-300">
                    <MarkdownRenderer content={debate.analisis_completo} />
                  </div>
                </div>
              </section>
            )}

            {/* Sticky CTA */}
            <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
              <Link
                href={`/chat?q=${encodeURIComponent(`Cuentame sobre el ${ORDINAL_LABELS[debate.numero]?.toLowerCase() || "debate"} presidencial 2026`)}`}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm"
              >
                Preguntarle a VOTI sobre este debate
              </Link>
            </div>
          </div>
        </article>

        <Footer />
      </div>
    </main>
  );
}

/** Simple markdown renderer for the editorial analysis. */
function MarkdownRenderer({ content }: { content: string }) {
  const html = content
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg mt-6 mb-2 text-white">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl mt-8 mb-3 text-white">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl mt-8 mb-4 text-white">$1</h1>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 text-gray-300">$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="mb-3 text-gray-300">')
    // Single newlines
    .replace(/\n/g, "<br/>");

  return (
    <div
      dangerouslySetInnerHTML={{ __html: `<p class="mb-3 text-gray-300">${html}</p>` }}
    />
  );
}
