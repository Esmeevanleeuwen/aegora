import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEGORA — weet waar je recht op hebt",
  description:
    "Verken je rechten per onderwerp, rol en situatie. Aegora verbindt toegankelijke informatie met onafhankelijk onderzoek en rechtsbescherming.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
