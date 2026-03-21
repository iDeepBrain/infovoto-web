"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                IV
              </div>
              <span className="font-bold text-white">InfoVoto Perú 2026</span>
            </div>
            <p className="text-sm text-gray-400">
              Información electoral verificada para ciudadanos informados.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold text-white mb-4">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Consultar
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white transition">
                  Características
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-white mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.jne.gob.pe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  JNE Oficial
                </a>
              </li>
              <li>
                <a
                  href="https://www.onpe.gob.pe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  ONPE Oficial
                </a>
              </li>
              <li>
                <a
                  href="https://www.elecciones2026.pe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Portal Electoral
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Términos
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Contacto
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6"
          >
            <h5 className="font-semibold text-blue-300 mb-3">⚠️ Aviso Legal</h5>
            <p className="text-xs text-gray-400 leading-relaxed">
              InfoVoto es una herramienta educativa e informativa independiente. La información proviene de fuentes públicas oficiales (
              <a href="https://www.jne.gob.pe" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                JNE
              </a>
              ,{" "}
              <a href="https://www.onpe.gob.pe" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                ONPE
              </a>
              ). InfoVoto NO es un servicio oficial del gobierno peruano. NO recomendamos ni apoyamos a ningún candidato o partido político.
              Verifica siempre en las fuentes oficiales. Las consultas se almacenan de forma anónima para mejorar el sistema.
            </p>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500"
        >
          <p>&copy; 2026 InfoVoto Perú. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-300 transition">
              Twitter
            </a>
            <a href="#" className="hover:text-gray-300 transition">
              GitHub
            </a>
            <a href="#" className="hover:text-gray-300 transition">
              Email
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
