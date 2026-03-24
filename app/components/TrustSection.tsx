"use client";

import { motion } from "framer-motion";
import VotiSprite from "./VotiSprite";

const trustItems = [
  {
    icon: "✅",
    title: "Fuentes oficiales",
    description: "Toda la informacion proviene del JNE y ONPE.",
  },
  {
    icon: "⚖️",
    title: "Neutral",
    description: "Sin recomendaciones, sin sesgos, sin publicidad politica.",
  },
  {
    icon: "🔍",
    title: "Transparente y verificable",
    description: "Cada respuesta incluye la fuente para que puedas verificar.",
  },
];

export default function TrustSection() {
  return (
    <section className="py-24 bg-[#0c1222]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Trust points */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Confianza ante todo
            </h2>
            <p className="text-gray-400 mb-10 text-lg">
              Basado en datos reales del Peru
            </p>

            <div className="space-y-6">
              {trustItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-start gap-4"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Voti open eyes (neutral, trustworthy) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <VotiSprite
                sprite="voti_open_eyes_neutral"
                onHoverSprite="voti_happy_celebrating"
                width={420}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
