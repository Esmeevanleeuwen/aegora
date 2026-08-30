import {
  ArrowRight,
  BellRing,
  FileCheck2,
  FileText,
  FolderLock,
  History,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const accountFeatures = [
  { icon: ShieldCheck, title: "Rechten bewaren", text: "Sla kaarten en bronnen op die voor jou belangrijk zijn." },
  { icon: FileText, title: "Contracten toevoegen", text: "Bewaar arbeids-, huur- en zorgdocumenten op één plek." },
  { icon: FileCheck2, title: "Eigen dossiers", text: "Koppel gebeurtenissen, bewijs, contactpersonen en vervolgstappen." },
  { icon: BellRing, title: "Termijnen volgen", text: "Houd bezwaar-, reactie- en opzegtermijnen overzichtelijk bij." },
  { icon: History, title: "Vraaggeschiedenis", text: "Vind eerdere AI-antwoorden en de toen gebruikte bronnen terug." },
  { icon: FolderLock, title: "Zelf gegevens beheren", text: "Bepaal wat wordt bewaard en verwijder informatie wanneer je wilt." },
];

export default function AccountPage() {
  return (
    <main className="account-page">
      <SiteHeader active="account" />
      <section className="account-shell">
        <div className="account-intro">
          <span className="eyebrow">Persoonlijke omgeving</span>
          <h1>Alleen persoonlijk<br />als jij dat wilt.</h1>
          <p>Alle openbare rechten blijven zonder account beschikbaar. Een account is alleen nodig om iets te bewaren, volgen of aan een eigen document te koppelen.</p>
          <div className="account-privacy"><LockKeyhole size={18} /><span>Contracten en dossiers worden nooit openbaar onderdeel van de rechtenbibliotheek.</span></div>
          <Link href="/rechten">Eerst zonder account rondkijken <ArrowRight size={16} /></Link>
        </div>

        <div className="account-panel">
          <div className="account-panel-heading"><span>Accountfuncties</span><small>Technische koppeling volgt</small></div>
          <h2>Wat je straks kunt bijhouden</h2>
          <div className="account-preview-grid">
            {accountFeatures.map(({ icon: Icon, title, text }) => (
              <article key={title}><span><Icon size={18} /></span><div><strong>{title}</strong><p>{text}</p></div></article>
            ))}
          </div>
          <div className="account-next-step"><strong>Volgende technische stap</strong><p>Veilig inloggen, versleutelde documentopslag, toestemming per gegeven en een volledig verwijderbaar account.</p></div>
          <button type="button" disabled>Account maken — binnenkort beschikbaar</button>
        </div>
      </section>
    </main>
  );
}
