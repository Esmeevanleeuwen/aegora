import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { login } from "@/app/auth/actions";
import { SiteHeader } from "@/components/site-header";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <main className="auth-page">
      <SiteHeader active="account" />
      <section className="auth-layout">
        <div className="auth-copy">
          <span className="eyebrow">Persoonlijke omgeving</span>
          <h1>Jouw informatie blijft van jou.</h1>
          <p>Bekijk rechten zonder account. Log alleen in wanneer je dossiers, contracten of belangrijke rechten wilt bewaren.</p>
          <div className="auth-trust-list">
            <span><ShieldCheck size={18} /> Alleen jij ziet jouw dossiers</span>
            <span><LockKeyhole size={18} /> Bestanden staan in private opslag</span>
          </div>
        </div>

        <div className="auth-card">
          <div>
            <span className="auth-card-kicker">Welkom terug</span>
            <h2>Inloggen</h2>
            <p>Ga verder waar je gebleven was.</p>
          </div>
          {message ? <div className="form-notice success">{message}</div> : null}
          {error ? <div className="form-notice error">{error}</div> : null}
          <form action={login} className="auth-form">
            <label htmlFor="login-email">E-mailadres</label>
            <input id="login-email" name="email" type="email" autoComplete="email" required />
            <label htmlFor="login-password">Wachtwoord</label>
            <input id="login-password" name="password" type="password" autoComplete="current-password" minLength={8} required />
            <button type="submit">Inloggen <ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">Nog geen account? <Link href="/registreren">Account maken</Link></p>
        </div>
      </section>
    </main>
  );
}
