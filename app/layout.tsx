import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "./session-provider";
import { GoogleAnalytics } from "./analytics";

export const metadata: Metadata = {
  title: "Voti — Te ayudo a votar informado",
  description: "Voti — Síntesis con IA de normativa electoral (Constitución, Ley Orgánica de Elecciones, JNE, ONPE). Consulta candidatos y propuestas para Perú 2026.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <GoogleAnalytics />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
