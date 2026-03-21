/**
 * Landing page pública — infovoto.pe
 */

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
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
        </div>
      </div>

      <footer className="border-t py-6 px-8 text-center text-xs text-gray-400 space-y-2">
        <p className="font-semibold text-gray-500">AVISO LEGAL</p>
        <p>
          InfoVoto es una herramienta educativa e informativa. La información proviene de fuentes públicas oficiales ({" "}
          <a href="https://www.jne.gob.pe" target="_blank" rel="noopener noreferrer" className="underline">JNE</a>,{" "}
          <a href="https://www.onpe.gob.pe" target="_blank" rel="noopener noreferrer" className="underline">ONPE</a>).
          InfoVoto NO es un servicio oficial del gobierno peruano.
        </p>
        <p>InfoVoto NO recomienda ni apoya a ningún candidato o partido político. Verifica siempre en las fuentes oficiales.</p>
        <p>Las consultas se almacenan de forma anónima para mejorar el sistema.</p>
      </footer>
    </main>
  );
}
