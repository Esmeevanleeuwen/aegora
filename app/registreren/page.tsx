import { ArrowRight, Check, FolderLock } from "lucide-react";
import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { SiteHeader } from "@/components/site-header";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;

  return (
    <main className="auth-page">
      <SiteHeader active="account" />
      <section className="auth-layout">
        <div className="auth-copy">
          <span className="eyebrow">Gratis persoonlijk account</span>
          <h1>Bewaar alleen wat jou helpt.</h1>
          <p>Je openbare rechten blijven altijd beschikbaar. Met een account voeg je daar je eigen overzicht aan toe.</p>
          <div className="auth-benefits">
            <span><Check size={16} /> Eigen dossiers maken</span>
            <span><Check size={16} /> Contracten veilig toevoegen</span>
            <span><Check size={16} /> Termijnen bijhouden</span>
          </div>
          <div className="auth-privacy-note"><FolderLock size={18} /> Je documenten worden nooit openbaar gemaakt.</div>
        </div>

        <div className="auth-card">
          <div>
            <span className="auth-card-kicker">Begin rustig</span>
            <h2>Account maken</h2>
            <p>Je kunt je account later weer verwijderen.</p>
          </div>
          {error ? <div className="form-notice error">{error}</div> : null}
          <form action={signup} className="auth-form">
            <label htmlFor="register-email">E-mailadres</label>
            <input id="register-email" name="email" type="email" autoComplete="email" required />
            <label htmlFor="register-password">Wachtwoord</label>
            <input id="register-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            <small>Gebruik minimaal 8 tekens.</small>
            <button type="submit">Account maken <ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">Al een account? <Link href="/inloggen">Inloggen</Link></p>
        </div>
      </section>
    </main>
  );
}
