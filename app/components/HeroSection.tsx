"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,197,253,0.15),rgba(59,130,246,0))]" />

      {/* Animated Background Shapes (Subtle pastel) */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], rotate: [0, 90, 180] }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute top-20 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-screen filter blur-3xl opacity-10"
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1], rotate: [180, 90, 0] }}
        transition={{ duration: 30, repeat: Infinity }}
        className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-screen filter blur-3xl opacity-10"
      />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6 flex justify-center">
          <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium backdrop-blur-md">
            🗳️ Elecciones Generales 2026
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
        >
          Tu Voz,{" "}
          <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
            Informada
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Accede a información sobre candidatos, propuestas de gobierno, locales de votación y más — con datos verificados del JNE y ONPE.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/login"
            className="px-8 py-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform"
          >
            Continuar con Google
          </Link>
          <a
            href="#features"
            className="px-8 py-4 border border-blue-300/50 text-blue-200 rounded-lg font-semibold text-lg hover:bg-blue-500/10 transition backdrop-blur-md"
          >
            Ver características
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
