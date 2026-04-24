import type { Metadata } from "next";
import "./globals.css";
import { ensureAdminUser } from "@/actions/init";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });


// Ejecutar inicialización de admin
ensureAdminUser();

export const metadata: Metadata = {
  title: "Indicadores | PepsiCo",
  description: "Módulo de gestión operativa e indicadores de seguridad PepsiCo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("h-full antialiased", "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
