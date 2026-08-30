"use client";

import {
  BadgeCheck,
  Brain,
  BriefcaseBusiness,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  FileText,
  HeartPulse,
  Home,
  LockKeyhole,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import {
  publicRoles,
  publicRules,
  publicTopics,
  type PublicRoleId,
  type PublicTopic,
  type RuleType,
} from "@/lib/public-rights-data";

const iconByRole = {
  users: Users,
  heart: HeartPulse,
  brain: Brain,
  stethoscope: Stethoscope,
  badge: BadgeCheck,
  briefcase: BriefcaseBusiness,
  home: Home,
  family: UsersRound,
};

const ruleCountByRole = new Map(
  publicRoles.map((item) => [
    item.id,
    publicRules.reduce((count, rule) => count + Number(rule.roles.includes(item.id)), 0),
  ]),
);

const typeLabels: Record<RuleType, string> = {
  recht: "Recht",
  plicht: "Plicht",
  bevoegdheid: "Bevoegdheid",
  grens: "Belangrijke grens",
};

export default function RightsLibraryPage() {
  const [role, setRole] = useState<PublicRoleId>("iedereen");
  const [topic, setTopic] = useState<"Alles" | PublicTopic>("Alles");
  const [query, setQuery] = useState("");
  const currentRole = publicRoles.find((item) => item.id === role) ?? publicRoles[0];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleRules = publicRules.filter((rule) => {
    const matchesRole = rule.roles.includes(role);
    const matchesTopic = topic === "Alles" || rule.topic === topic;
    const matchesQuery = !normalizedQuery || `${rule.title} ${rule.summary} ${rule.boundary}`.toLowerCase().includes(normalizedQuery);
    return matchesRole && matchesTopic && matchesQuery;
  });

  return (
    <main className="library-page">
      <SiteHeader active="library" />

      <section className="library-hero">
        <div>
          <span className="eyebrow"><span className="live-dot" /> Openbaar en zonder account</span>
          <h1>Vind wat je mag,<br />moet en kunt doen.</h1>
          <p>Kies je rol en onderwerp. Je ziet alleen algemene informatie die niet afhankelijk is van een persoonlijk dossier.</p>
        </div>
        <div className="library-search">
          <Search size={20} />
          <label className="sr-only" htmlFor="rights-search">Zoek in openbare rechten</label>
          <input id="rights-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek bijvoorbeeld beroepsgeheim, huur of aangifte" />
          <span>{publicRules.length} gecontroleerde kaarten</span>
        </div>
      </section>

      <section className="library-browser">
        <aside className="role-selector" aria-label="Kies je rol">
          <div className="selector-heading"><span>Ik bekijk dit als</span><small>Geen account nodig</small></div>
          <div className="role-list">
            {publicRoles.map((item) => {
              const Icon = iconByRole[item.icon];
              const count = ruleCountByRole.get(item.id) ?? 0;
              return (
                <button key={item.id} type="button" className={role === item.id ? "active" : ""} aria-pressed={role === item.id} onClick={() => { setRole(item.id); setTopic("Alles"); }}>
                  <span className="role-icon"><Icon size={18} /></span>
                  <span><strong>{item.label}</strong><small>{count} onderwerpen</small></span>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
          <div className="anonymous-note"><LockKeyhole size={16} /><p>Je selectie wordt niet opgeslagen. Persoonlijke gegevens zijn voor deze bibliotheek niet nodig.</p></div>
        </aside>

        <div className="library-results">
          <div className="selected-role-heading">
            <div><span className="eyebrow">Openbare informatie voor</span><h2>{currentRole.label}</h2><p>{currentRole.description}</p></div>
            <Link href="/basisrechten">Bekijk discriminatiegronden <ExternalLink size={13} /></Link>
          </div>

          <div className="topic-filter" role="group" aria-label="Filter op rechtsgebied">
            {publicTopics.map((item) => <button key={item} type="button" className={topic === item ? "active" : ""} aria-pressed={topic === item} onClick={() => setTopic(item)}>{item}</button>)}
          </div>

          <div className="public-rule-list" aria-live="polite">
            {visibleRules.length > 0 ? visibleRules.map((rule) => (
              <article className="public-rule-card" key={rule.id}>
                <div className="rule-card-topline"><span className={`rule-type rule-type-${rule.type}`}>{typeLabels[rule.type]}</span><span>{rule.topic}</span></div>
                <h3>{rule.title}</h3>
                <p>{rule.summary}</p>
                <dl>
                  <div><dt>Wanneer geldt dit?</dt><dd>{rule.appliesWhen}</dd></div>
                  <div><dt>Waar ligt de grens?</dt><dd>{rule.boundary}</dd></div>
                </dl>
                <a href={rule.sourceUrl} target="_blank" rel="noreferrer"><ShieldCheck size={14} /> {rule.sourceTitle}<ExternalLink size={12} /></a>
              </article>
            )) : (
              <div className="no-public-results"><CircleAlert size={23} /><div><strong>Geen kaart gevonden</strong><p>Kies een ander onderwerp of maak je zoekopdracht korter.</p></div></div>
            )}
          </div>
        </div>
      </section>

      <section className="account-bridge">
        <div className="account-bridge-copy">
          <span className="eyebrow">Optioneel account</span>
          <h2>Openbaar zoeken blijft gratis.<br />Een account onthoudt de rest.</h2>
          <p>Je hebt geen account nodig om rechten te lezen. Log alleen in wanneer je informatie wilt bewaren of een eigen dossier wilt opbouwen.</p>
        </div>
        <div className="account-feature-grid">
          <article><ShieldCheck /><strong>Rechten opslaan</strong><span>Bewaar belangrijke kaarten.</span></article>
          <article><FileText /><strong>Contracten toevoegen</strong><span>Houd versies en afspraken samen.</span></article>
          <article><BadgeCheck /><strong>Dossiers bijhouden</strong><span>Bewaar acties, bewijs en status.</span></article>
          <article><CircleAlert /><strong>Termijnen volgen</strong><span>Zie wat aandacht nodig heeft.</span></article>
        </div>
        <Link className="account-bridge-link" href="/account">Bekijk de persoonlijke omgeving <ChevronRight size={17} /></Link>
      </section>
    </main>
  );
}
