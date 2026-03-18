/**
 * Landing page pública — infovoto.pe
 */

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          InfoVoto Perú 2026
        </h1>
        <p className="text-xl text-gray-600">
          Tu asistente de información electoral. Consulta candidatos, planes de
          gobierno, locales de votación y más — con fuentes verificadas del JNE
          y ONPE.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/chat"
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Consultar ahora
          </Link>
          <a
            href="https://www.jne.gob.pe"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            JNE oficial
          </a>
        </div>
        <p className="text-sm text-gray-400">
          InfoVoto es un servicio informativo independiente. No hace
          recomendaciones de voto.
        </p>
      </div>
    </main>
  );
}
