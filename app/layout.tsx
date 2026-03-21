import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "./session-provider";
import { GoogleAnalytics } from "./analytics";

export const metadata: Metadata = {
  title: "InfoVoto Perú 2026",
  description: "Información electoral verificada para las Elecciones Generales Perú 2026",
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
