"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "👥",
    title: "Candidatos",
    description: "Perfiles completos, experiencia, y propuestas de los candidatos presidenciales y congresuales.",
  },
  {
    icon: "📋",
    title: "Propuestas",
    description: "Planes de gobierno detallados en educación, salud, economía, seguridad y más.",
  },
  {
    icon: "📍",
    title: "Dónde Votar",
    description: "Encuentra tu mesa electoral y locales de votación más cercanos.",
  },
  {
    icon: "🔍",
    title: "Búsqueda Avanzada",
    description: "Filtra candidatos por región, partido, edad, o especialidad.",
  },
  {
    icon: "📊",
    title: "Comparativas",
    description: "Compara propuestas de gobierno lado a lado para tomar una decisión informada.",
  },
  {
    icon: "✅",
    title: "Verificado",
    description: "Toda la información proviene de fuentes oficiales: JNE y ONPE.",
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
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
          >
            Todo lo que necesitas para votar informado
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Accede a información electoral verificada, completa y actualizada en tiempo real.
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
              className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-400 bg-white hover:shadow-xl transition-all"
            >
              {/* Icon */}
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>

              {/* Bottom accent */}
              <div className="mt-6 h-1 w-0 bg-gradient-to-r from-red-600 to-blue-600 group-hover:w-full transition-all duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
