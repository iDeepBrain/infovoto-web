"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const demoQuestions = [
  {
    icon: "📄",
    text: "¿Cual es la hoja de vida de Antauro Humala?",
  },
  {
    icon: "⚖️",
    text: "Compara propuestas de educacion entre Lopez Aliaga y Fujimori",
  },
  {
    icon: "💰",
    text: "¿Cuanto gana el candidato Daniel Urresti?",
  },
  {
    icon: "🎓",
    text: "¿Que estudios tiene Keiko Fujimori?",
  },
];

export default function DemoSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#0c1222] to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Preguntale a Voti
          </h2>
          <p className="text-gray-400 text-lg">
            Haz clic en cualquier pregunta para comenzar
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {demoQuestions.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/chat?q=${encodeURIComponent(q.text)}`}
                className="group flex items-start gap-3 p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/60 hover:border-amber-500/30 transition-all"
              >
                <span className="text-2xl shrink-0 mt-0.5">{q.icon}</span>
                <span className="text-gray-300 group-hover:text-white transition text-left leading-relaxed">
                  &ldquo;{q.text}&rdquo;
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
