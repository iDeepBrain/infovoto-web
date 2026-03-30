"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import VotiSprite from "./VotiSprite";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-gradient-to-br from-slate-950 via-[#0c1222] to-slate-950">
      {/* Subtle glow behind Voti */}
      <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[120px]" />
      <div className="absolute right-[15%] top-1/3 w-[300px] h-[300px] bg-blue-500/6 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left — Voti */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Floating animation */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <VotiSprite
                  sprite="voti_body_turnaround"
                  width={420}
                  loop={false}
                  playing={false}
                />
              </motion.div>
              {/* Shadow under Voti */}
              <motion.div
                animate={{ scale: [1, 0.9, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-4 bg-black/30 rounded-full blur-md"
              />
            </div>
          </motion.div>

          {/* Right — Copy + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-6"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Elecciones Generales 2026
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Te ayudo a votar{" "}
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-red-400 bg-clip-text text-transparent">
                informado
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-lg">
              Consulta candidatos, compara propuestas y entiende las elecciones en segundos.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/chat"
                className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] transition-all"
              >
                Preguntar ahora
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </Link>
              <Link
                href="/chat"
                className="px-8 py-4 border border-white/15 text-gray-300 rounded-xl font-semibold text-lg hover:bg-white/5 transition backdrop-blur-sm"
              >
                Preguntarle a Voti
              </Link>
            </div>

            {/* Trust micro-copy */}
            <p className="mt-6 text-sm text-gray-500">
              Datos oficiales del JNE y ONPE. Sin afiliaciones politicas.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
