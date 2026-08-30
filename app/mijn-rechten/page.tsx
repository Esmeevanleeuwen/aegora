"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileCheck2,
  LockKeyhole,
  MessageCircleQuestion,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { rightsCatalog, statusLabels } from "@/lib/rights-data";
import type { ApplicabilityStatus, RightItem } from "@/lib/types";

type Filter = "alles" | "bevestigd" | "controleren";

const filters: Array<{ id: Filter; label: string }> = [
  { id: "alles", label: "Alle rechten" },
  { id: "bevestigd", label: "Bevestigd" },
  { id: "controleren", label: "Nog controleren" },
];

function matchesFilter(status: ApplicabilityStatus, filter: Filter) {
  if (filter === "alles") return true;
  if (filter === "bevestigd") return status === "bevestigd";
  return status !== "bevestigd";
}

function DashboardRightCard({ right }: { right: RightItem }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="dashboard-right-card">
      <div className="dashboard-card-status">
        <span className={`status status-${right.status}`}>{statusLabels[right.status]}</span>
        <span><Clock3 size={14} /> {right.sourceDate}</span>
      </div>
      <h2>{right.title}</h2>
      <p className="dashboard-card-summary">{right.summary}</p>

      <div className="next-step-panel">
        <span><ArrowRight size={17} /></span>
        <div><small>Beste volgende stap</small><strong>{right.nextStep}</strong></div>
      </div>

      <dl className="right-facts">
        <div><dt>Verantwoordelijk</dt><dd>{right.responsibleParty}</dd></div>
        <div><dt>Termijn</dt><dd>{right.deadline}</dd></div>
      </dl>

      <button className="dashboard-details-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {open ? "Verberg volledige uitleg" : "Bekijk voorwaarden, bewijs en route"}
        <ChevronDown className={open ? "rotate" : ""} size={18} />
      </button>

      {open && (
        <div className="dashboard-card-details">
          <section><h3>Dit moet kloppen</h3><ul>{right.conditions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h3>Uitzondering mogelijk</h3><ul>{right.exceptions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h3>Handig als bewijs</h3><p>{right.evidence}</p></section>
          <section><h3>Als je er niet uitkomt</h3><p>{right.escalationRoute}</p></section>
        </div>
      )}

      <a className="dashboard-source" href={right.sourceUrl} target="_blank" rel="noreferrer">
        Officiële bron bekijken <ExternalLink size={14} />
      </a>
    </article>
  );
}

export default function MyRightsPage() {
  const [filter, setFilter] = useState<Filter>("alles");
  const visibleRights = rightsCatalog.filter((right) => matchesFilter(right.status, filter));
  const confirmedCount = rightsCatalog.filter((right) => right.status === "bevestigd").length;

  return (
    <main className="dashboard-page">
      <SiteHeader active="rights" />
      <div className="dashboard-shell">
        <aside className="profile-panel" aria-label="Gebruikte context">
          <div className="profile-icon"><UserRound size={24} /></div>
          <span className="eyebrow">Anoniem overzicht</span>
          <h1>Jouw context</h1>
          <p>Je hebt alleen gedeeld wat de juridische uitkomst kan veranderen.</p>

          <dl className="profile-context">
            <div><dt>Situatie</dt><dd>Cliënt in de GGZ</dd></div>
            <div><dt>Leeftijd</dt><dd>18 jaar of ouder</dd></div>
            <div><dt>Behandeling</dt><dd>Vrijwillig</dd></div>
            <div><dt>Aanspreekvorm</dt><dd>zij/haar</dd></div>
          </dl>

          <Link className="secondary-button" href="/vraag"><SlidersHorizontal size={16} /> Context aanpassen</Link>
          <div className="privacy-note"><LockKeyhole size={16} /><p>Je aanspreekvorm verandert nooit automatisch welke rechten je ziet.</p></div>
        </aside>

        <section className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <span className="eyebrow">Zorg & cliënt</span>
              <h1>Dit zijn je rechten<br />in deze situatie.</h1>
              <p>{confirmedCount} rechten zijn bevestigd. Bij {rightsCatalog.length - confirmedCount} recht kan extra context de uitkomst veranderen.</p>
            </div>
            <Link className="primary-link" href="/vraag"><MessageCircleQuestion size={18} /> Stel een vervolgvraag</Link>
          </div>

          <div className="rights-summary" aria-label="Samenvatting rechten">
            <article><CheckCircle2 /><div><strong>{confirmedCount}</strong><span>Bevestigd</span></div></article>
            <article><CircleAlert /><div><strong>{rightsCatalog.length - confirmedCount}</strong><span>Nog controleren</span></div></article>
            <article><FileCheck2 /><div><strong>{rightsCatalog.length}</strong><span>Bronnen gecontroleerd</span></div></article>
          </div>

          <div className="dashboard-toolbar">
            <div className="filter-tabs" role="group" aria-label="Filter rechten">
              {filters.map((item) => (
                <button key={item.id} type="button" className={filter === item.id ? "active" : ""} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            <span>{visibleRights.length} resultaten</span>
          </div>

          <div className="dashboard-rights-list">
            {visibleRights.map((right) => <DashboardRightCard key={right.id} right={right} />)}
          </div>
        </section>
      </div>
    </main>
  );
}
