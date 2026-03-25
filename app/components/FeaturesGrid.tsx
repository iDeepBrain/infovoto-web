"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "👤",
    title: "Candidatos",
    description: "Perfil completo: experiencia laboral, estudios y trayectoria politica de cada candidato.",
  },
  {
    icon: "📋",
    title: "Propuestas",
    description: "Planes de gobierno por tema: educacion, salud, seguridad, economia y mas.",
  },
  {
    icon: "⚖️",
    title: "Antecedentes",
    description: "Historial judicial y sentencias de cada candidato registrados en el JNE.",
  },
  {
    icon: "📊",
    title: "Comparar",
    description: "Compara candidatos lado a lado en cualquier tema que te interese.",
  },
  {
    icon: "💰",
    title: "Patrimonio",
    description: "Ingresos, bienes y nivel educativo declarados oficialmente al JNE.",
  },
  {
    icon: "🏛️",
    title: "Proceso Electoral",
    description: "Sistema bicameral, voto preferencial, segunda vuelta y como funciona todo.",
  },
];

export default function FeaturesGrid() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
          >
            Preguntale sobre cualquier tema electoral
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Informacion completa, neutral y verificada.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className="group p-8 rounded-2xl border border-slate-700 hover:border-amber-500/50 bg-slate-800/50 hover:bg-slate-800 hover:shadow-xl transition-all"
            >
              {/* Icon */}
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>

              {/* Bottom accent */}
              <div className="mt-6 h-1 w-0 bg-gradient-to-r from-amber-400 to-orange-400 group-hover:w-full transition-all duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
