"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CountUpNumber = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <>{count.toLocaleString()}</>;
};

export default function StatsSection() {
  const stats = [
    { label: "Consultas Procesadas", value: 12500000, suffix: "+" },
    { label: "Candidatos Analizados", value: 50, suffix: "+" },
    { label: "Regiones Cubiertas", value: 24, suffix: "" },
    { label: "Ciudadanos Informados", value: 500000, suffix: "+" },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Impacto Electoral 2026
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Miles de ciudadanos peruanos utilizan Voti para tomar decisiones electorales informadas.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition"
            >
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text mb-2">
                <CountUpNumber end={stat.value} />
                {stat.suffix}
              </div>
              <p className="text-gray-300 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-300 mb-6">
            ¿Listo para tomar una decisión informada?
          </p>
          <a
            href="/login"
            className="inline-block px-8 py-4 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform"
          >
            Comienza Ahora
          </a>
        </motion.div>
      </div>
    </section>
  );
}
