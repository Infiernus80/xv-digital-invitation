import type { Metadata } from "next";
import { SiteConfig } from "@/lib/constants";
import "./globals.css";
import { DancingScript, MoonTime, BadScript } from "@/lib/fonts";

export const metadata: Metadata = {
  title: SiteConfig.title,
  description: SiteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${DancingScript.variable} ${MoonTime.variable} ${BadScript.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
