import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEGORA — de rechten van één mens raken ons allemaal",
  description:
    "Aegora werkt aan onafhankelijk onderzoek en rechtsbescherming. Onze eerste focus: gesloten zorg, jeugdzorg en beschermd en begeleid wonen.",
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
