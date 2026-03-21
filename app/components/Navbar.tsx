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
      className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              IV
            </div>
            <span className="hidden sm:inline">InfoVoto</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition font-medium text-sm">
              Inicio
            </Link>
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition font-medium text-sm">
              Características
            </a>
            <a href="https://www.jne.gob.pe" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition font-medium text-sm">
              JNE Oficial
            </a>
          </div>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/chat" className="px-4 py-2 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition">
                  Consultar
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition">
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
            className="md:hidden border-t border-gray-200 py-4 space-y-3"
          >
            <Link href="/" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              Inicio
            </Link>
            <a href="#features" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              Características
            </a>
            {session ? (
              <>
                <Link href="/chat" className="block px-4 py-2 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded font-semibold">
                  Consultar
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link href="/login" className="block px-4 py-2 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded font-semibold">
                Iniciar Sesión
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
