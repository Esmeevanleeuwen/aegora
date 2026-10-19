import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { RightsNetworkProvider } from "@/components/rights-network-provider";
import { getRightsGraph } from "@/lib/rights-network-repository";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEGORA — weet waar je recht op hebt",
  description:
    "Verken je rechten per onderwerp, rol en situatie. Aegora verbindt toegankelijke informatie met onafhankelijk onderzoek en rechtsbescherming.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const graph = await getRightsGraph();
  return (
    <html lang="nl">
      <body>
        <RightsNetworkProvider graph={graph}>{children}</RightsNetworkProvider>
        <Analytics />
      </body>
    </html>
  );
}

