import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEGORA — weet wat er voor jou geldt",
  description:
    "Een persoonlijk burgerplatform voor actuele rechten, cliëntpositie en controleerbare AI-antwoorden.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
