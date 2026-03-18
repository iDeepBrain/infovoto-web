import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "./session-provider";

export const metadata: Metadata = {
  title: "InfoVoto Perú 2026",
  description: "Información electoral verificada para las Elecciones Generales Perú 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
