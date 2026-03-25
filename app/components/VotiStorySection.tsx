"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import VotiSprite from "./VotiSprite";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const studyItems = [
  { number: 33, label: "planes de gobierno", suffix: "" },
  { number: 7236, label: "hojas de vida", suffix: "" },
  { label: "Antecedentes penales" },
  { label: "Patrimonio declarado" },
  { label: "Resoluciones del JNE" },
  { label: "Proceso electoral completo" },
];

export default function VotiStorySection() {
  return (
    <section id="voti" className="py-20 bg-gradient-to-b from-[#0c1222] to-[#0a0f1a] overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Beat 1 — EL ORIGEN */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row items-center gap-8 mb-24"
        >
          <div className="shrink-0">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <VotiSprite sprite="voti_idle_half_blink" width={140} />
            </motion.div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed">
              Voti es una llama peruana que quiso votar informada.
              Pero se encontro con{" "}
              <span className="text-amber-400 font-bold">33 planes de gobierno</span>,{" "}
              <span className="text-amber-400 font-bold">7,236 candidatos</span>{" "}
              y montañas de documentos que ningun ciudadano tiene tiempo de leer.
            </p>
          </div>
        </motion.div>

        {/* Beat 2 — EL ESTUDIO */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row-reverse items-center gap-10 mb-24"
        >
          <div className="shrink-0">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <VotiSprite sprite="voti_explaining_talking" width={260} />
            </motion.div>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Entonces se puso a estudiar.
            </h3>
            <p className="text-lg text-gray-400 mb-8">
              Leyo cada plan de gobierno, cada hoja de vida,
              cada antecedente penal, cada declaracion de patrimonio,
              cada resolucion del JNE.
            </p>

            {/* Stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {studyItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center"
                >
                  {item.number ? (
                    <div className="text-2xl font-bold text-amber-400 mb-1">
                      <AnimatedCounter target={item.number} suffix={item.suffix} />
                    </div>
                  ) : (
                    <div className="text-lg mb-1">
                      {item.label?.includes("Antecedentes") ? "⚖️" :
                       item.label?.includes("Patrimonio") ? "💰" :
                       item.label?.includes("Resoluciones") ? "📄" : "🏛️"}
                    </div>
                  )}
                  <p className="text-xs text-gray-400">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Beat 3 — LA MISION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row items-center gap-10 mb-24"
        >
          <div className="shrink-0">
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <VotiSprite sprite="voti_happy_talking" width={320} />
            </motion.div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl text-white font-bold leading-relaxed">
              Ahora quiere compartir lo que aprendio contigo,
              para que tu tambien votes con informacion,{" "}
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                no con miedo.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Beat 4 — LA HONESTIDAD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <VotiSprite sprite="voti_open_eyes_neutral" width={200} />
          </div>
          <p className="text-xl text-gray-300 leading-relaxed mb-4">
            Pero Voti es honesta: no es perfecta, puede equivocarse.
          </p>
          <p className="text-lg text-gray-400 leading-relaxed mb-6">
            Por eso cada respuesta incluye la fuente oficial para que tu verifiques.
            No opina. No recomienda. Solo te muestra los datos.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
            <span>✓</span>
            Fuentes oficiales del JNE y ONPE
          </div>
        </motion.div>

      </div>
    </section>
  );
}
