import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function AuthErrorPage() {
  return (
    <main className="auth-page">
      <SiteHeader active="account" />
      <section className="auth-shell auth-status-shell">
        <div className="auth-status-icon"><AlertTriangle size={24} /></div>
        <span className="eyebrow">Bevestiging mislukt</span>
        <h1>Deze link werkt niet meer.</h1>
        <p>De bevestigingslink kan verlopen of al gebruikt zijn. Probeer opnieuw in te loggen of maak een nieuw account.</p>
        <Link className="auth-secondary-link" href="/inloggen"><ArrowLeft size={16} /> Naar inloggen</Link>
      </section>
    </main>
  );
}
