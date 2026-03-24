"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: "📊",
    title: "Datos oficiales",
    description: "Recopilamos informacion publica del JNE y ONPE.",
    color: "from-blue-500 to-blue-600",
  },
  {
    number: "02",
    icon: "🧠",
    title: "Procesamiento estructurado",
    description: "Organizamos los datos para que sean faciles de consultar.",
    color: "from-amber-500 to-orange-500",
  },
  {
    number: "03",
    icon: "🦙",
    title: "Voti te responde",
    description: "Te damos respuestas claras, neutrales y verificables.",
    color: "from-red-500 to-rose-500",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 to-[#0c1222]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            ¿Como funciona?
          </h2>
          <p className="text-gray-400 text-lg">
            Voti no opina. Solo te muestra informacion objetiva.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative text-center"
              >
                {/* Step number bubble */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} text-white text-2xl font-bold mb-6 shadow-lg`}>
                  {step.icon}
                </div>

                <div className="text-xs font-mono text-gray-500 mb-2">
                  PASO {step.number}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
