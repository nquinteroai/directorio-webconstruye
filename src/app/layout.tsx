import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.nombre} — Negocios locales en Kennedy y Soacha`,
    template: `%s | ${siteConfig.nombre}`,
  },
  description: siteConfig.descripcion,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
