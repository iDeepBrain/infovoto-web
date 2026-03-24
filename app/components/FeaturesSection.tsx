"use client";

import { motion } from "framer-motion";
import VotiSprite from "./VotiSprite";

const features = [
  {
    icon: "📄",
    title: "Hoja de vida",
    description: "Consulta experiencia, estudios y trayectoria de cualquier candidato.",
    sprite: "voti_explaining_talking",
  },
  {
    icon: "⚖️",
    title: "Comparacion de propuestas",
    description: "Compara propuestas entre partidos de forma clara y neutral.",
    sprite: "voti_thinking_squint",
  },
  {
    icon: "💰",
    title: "Ingresos y educacion",
    description: "Accede a informacion declarada oficialmente al JNE.",
    sprite: "voti_explaining_side",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Tus 3 superpoderes electorales
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Informacion electoral clara, neutral y en un solo lugar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6 }}
              className="group relative p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-amber-500/30 hover:bg-slate-900 transition-all"
            >
              {/* Mini Voti for this feature */}
              <div className="mb-6 flex justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <VotiSprite sprite={feat.sprite} width={200} />
              </div>

              <div className="text-3xl mb-3">{feat.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feat.description}</p>

              <div className="mt-6 h-0.5 w-0 bg-gradient-to-r from-amber-400 to-orange-400 group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
