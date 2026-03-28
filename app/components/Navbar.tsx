"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              V
            </div>
            <span className="hidden sm:inline">Voti</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-300 hover:text-white transition font-medium text-sm">
              Inicio
            </Link>
            <Link href="/#features" className="text-gray-300 hover:text-white transition font-medium text-sm">
              Características
            </Link>
            <Link href="/debates" className="text-gray-300 hover:text-amber-400 transition font-medium text-sm">
              Debates
            </Link>
            <a href="https://www.jne.gob.pe" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition font-medium text-sm">
              JNE Oficial
            </a>
            <a href="https://www.onpe.gob.pe" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition font-medium text-sm">
              ONPE
            </a>
            <a href="https://votoinformado.jne.gob.pe/home" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition font-medium text-sm">
              Voto Informado
            </a>
          </div>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/chat" className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition">
                  Consultar
                </Link>
                {(session as any)?.user?.email === "cristian2023ml@gmail.com" && (
                  <Link href="/stats" className="px-3 py-2 text-gray-400 hover:text-amber-400 transition text-sm">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-gray-300 hover:text-white transition"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition">
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-slate-800 py-4 space-y-3"
          >
            <Link href="/" className="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">
              Inicio
            </Link>
            <Link href="/#features" className="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">
              Características
            </Link>
            <Link href="/debates" className="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">
              Debates
            </Link>
            <a href="https://www.onpe.gob.pe" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">
              ONPE
            </a>
            <a href="https://votoinformado.jne.gob.pe/home" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">
              Voto Informado
            </a>
            {session ? (
              <>
                <Link href="/chat" className="block px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded font-semibold">
                  Consultar
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-slate-800 rounded"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link href="/login" className="block px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded font-semibold">
                Iniciar Sesión
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
