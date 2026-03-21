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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,178,72,0))]" />
      </div>

      {/* Animated Background Shapes */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 180] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-10 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [180, 90, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute bottom-10 left-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Tu Voz,{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Informada
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Accede a información sobre candidatos, propuestas de gobierno, locales de votación y más — con datos verificados del JNE y ONPE.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform"
          >
            Empezar Ahora
          </Link>
          <a
            href="#features"
            className="px-8 py-4 border border-white/30 text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition backdrop-blur-md"
          >
            Saber Más
          </a>
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-3 gap-4 sm:gap-8"
        >
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">12.5M+</div>
            <div className="text-sm text-gray-400">Consultas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">50+</div>
            <div className="text-sm text-gray-400">Candidatos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">Real-time</div>
            <div className="text-sm text-gray-400">Datos Actuales</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
