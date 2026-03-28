"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getDebates, type DebateSummary } from "@/lib/api";

const ORDINAL_LABELS: Record<number, string> = {
  1: "PRIMER DEBATE",
  2: "SEGUNDO DEBATE",
  3: "TERCER DEBATE",
};

export default function DebatesPage() {
  const [debates, setDebates] = useState<DebateSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDebates()
      .then(setDebates)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl sm:text-5xl font-bold text-white mb-4"
              >
                Debates Presidenciales 2026
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-400 max-w-2xl mx-auto"
              >
                Analisis imparcial de cada debate organizado por el JNE
              </motion.p>
            </div>

            {/* Debates Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {debates.map((debate) => (
                  <motion.div
                    key={debate.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                    }}
                    whileHover={{ y: -8 }}
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
                        <Link
                          href={`/chat?q=Cuentame sobre el ${ORDINAL_LABELS[debate.numero]?.toLowerCase() || "debate"} presidencial`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 text-center py-2.5 rounded-lg border border-slate-600 hover:border-amber-500/50 text-gray-300 hover:text-white font-semibold text-sm transition-all"
                        >
                          Preguntarle a VOTI
                        </Link>
                      </div>

                      {/* Bottom accent */}
                      <div className="mt-6 h-1 w-0 bg-gradient-to-r from-amber-400 to-orange-400 group-hover:w-full transition-all duration-300" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
