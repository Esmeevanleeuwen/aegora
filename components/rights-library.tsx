"use client";

import {
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Brain,
  BriefcaseBusiness,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  FileText,
  HeartPulse,
  Home,
  LoaderCircle,
  LockKeyhole,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";
import type {
  PublicRole,
  PublicRoleId,
  PublicRule,
  PublicTopic,
  RuleType,
} from "@/lib/public-rights-data";
import type { PublicRightsData } from "@/lib/public-rights-repository";

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

const typeLabels: Record<RuleType, string> = {
  recht: "Recht",
  plicht: "Plicht",
  bevoegdheid: "Bevoegdheid",
  grens: "Belangrijke grens",
};

type RightsLibraryProps = Pick<
  PublicRightsData,
  "roles" | "rules" | "situations" | "topics" | "dataSource"
>;

function appliesToRole(rule: PublicRule, role: PublicRoleId) {
  return rule.roles.includes(role) || (role !== "iedereen" && rule.roles.includes("iedereen"));
}

function buildRuleCounts(roles: PublicRole[], rules: PublicRule[]) {
  return new Map(roles.map((item) => [
    item.id,
    rules.reduce((count, rule) => count + Number(appliesToRole(rule, item.id)), 0),
  ]));
}

function formatCheckedDate(value: string | null) {
  if (!value) return "Controledatum niet beschikbaar";
  return `Gecontroleerd ${new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value))}`;
}

export function RightsLibrary({ roles, rules, situations, topics, dataSource }: RightsLibraryProps) {
  const router = useRouter();
  const firstRole = roles[0]?.id ?? "iedereen";
  const [role, setRole] = useState<PublicRoleId>(firstRole);
  const [situation, setSituation] = useState("alles");
  const [topic, setTopic] = useState<"Alles" | PublicTopic>("Alles");
  const [query, setQuery] = useState("");
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [savedRightIds, setSavedRightIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSavedRights() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user || cancelled) return;

        setViewerId(user.id);
        const { data } = await supabase
          .from("aegora_saved_rights")
          .select("right_id")
          .eq("user_id", user.id);

        if (!cancelled && data) {
          setSavedRightIds(new Set(data.map((item) => String(item.right_id))));
        }
      } catch {
        // De openbare bibliotheek blijft zonder Supabase of account volledig bruikbaar.
      }
    }

    void loadSavedRights();
    return () => { cancelled = true; };
  }, []);

  const ruleCountByRole = useMemo(() => buildRuleCounts(roles, rules), [roles, rules]);
  const currentRole = roles.find((item) => item.id === role) ?? roles[0];
  const currentSituation = situations.find((item) => item.slug === situation);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleRules = useMemo(() => rules.filter((rule) => {
    const matchesRole = appliesToRole(rule, role);
    const matchesSituation = situation === "alles" || rule.situations.includes(situation);
    const matchesTopic = topic === "Alles" || rule.topic === topic;
    const matchesQuery = !normalizedQuery || [
      rule.title,
      rule.summary,
      rule.boundary,
      rule.practicalNote,
      rule.nextStep,
    ].join(" ").toLowerCase().includes(normalizedQuery);
    return matchesRole && matchesSituation && matchesTopic && matchesQuery;
  }), [normalizedQuery, role, rules, situation, topic]);

  async function toggleSavedRight(rightId: string) {
    setSaveMessage("");
    if (!viewerId) {
      router.push(`/inloggen?next=${encodeURIComponent("/rechten")}`);
      return;
    }

    setSavingId(rightId);
    const supabase = createClient();
    const isSaved = savedRightIds.has(rightId);
    const { error } = isSaved
      ? await supabase
          .from("aegora_saved_rights")
          .delete()
          .eq("user_id", viewerId)
          .eq("right_id", rightId)
      : await supabase
          .from("aegora_saved_rights")
          .insert({ user_id: viewerId, right_id: rightId });

    setSavingId(null);
    if (error) {
      setSaveMessage("Opslaan is niet gelukt. Probeer het opnieuw.");
      return;
    }

    setSavedRightIds((current) => {
      const next = new Set(current);
      if (isSaved) next.delete(rightId);
      else next.add(rightId);
      return next;
    });
    setSaveMessage(isSaved ? "Recht verwijderd uit je account." : "Recht opgeslagen in je account.");
  }

  return (
    <main className="library-page">
      <SiteHeader active="library" />

      <section className="library-hero">
        <div>
          <span className="eyebrow"><span className="live-dot" /> Openbaar en zonder account</span>
          <h1>Vind je recht via<br />wat er gebeurde.</h1>
          <p>Kies je rol, situatie en onderwerp. Je krijgt algemene informatie, praktische grenzen en een duidelijke eerstvolgende stap.</p>
        </div>
        <div className="library-search">
          <Search size={20} />
          <label className="sr-only" htmlFor="rights-search">Zoek in openbare rechten</label>
          <input id="rights-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek bijvoorbeeld beroepsgeheim, huur of aangifte" />
          <span>{rules.length} kaarten · {dataSource === "supabase" ? "database actief" : "lokale basisset"}</span>
        </div>
      </section>

      <section className="library-browser">
        <aside className="role-selector" aria-label="Kies je rol">
          <div className="selector-heading"><span>1. Ik bekijk dit als</span><small>Geen account nodig</small></div>
          <div className="role-list">
            {roles.map((item) => {
              const Icon = iconByRole[item.icon];
              const count = ruleCountByRole.get(item.id) ?? 0;
              return (
                <button key={item.id} type="button" className={role === item.id ? "active" : ""} aria-pressed={role === item.id} onClick={() => { setRole(item.id); setTopic("Alles"); }}>
                  <span className="role-icon"><Icon size={18} /></span>
                  <span><strong>{item.label}</strong><small>{count} rechten en grenzen</small></span>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
          <div className="anonymous-note"><LockKeyhole size={16} /><p>Je selectie wordt niet opgeslagen. Persoonlijke gegevens zijn voor deze route niet nodig.</p></div>
        </aside>

        <div className="library-results">
          {currentRole ? (
            <div className="selected-role-heading">
              <div><span className="eyebrow">Openbare informatie voor</span><h2>{currentRole.label}</h2><p>{currentRole.description}</p></div>
              <Link href="/basisrechten">Bekijk basisrechten <ExternalLink size={13} /></Link>
            </div>
          ) : null}

          <section className="situation-selector" aria-labelledby="situation-heading">
            <div className="route-step-heading">
              <div><span>Stap 2</span><h3 id="situation-heading">Wat speelt er?</h3></div>
              <p>Kies alleen iets wanneer het bij je situatie past.</p>
            </div>
            <div className="situation-list">
              <button type="button" className={situation === "alles" ? "active" : ""} aria-pressed={situation === "alles"} onClick={() => setSituation("alles")}>
                <strong>Algemeen bekijken</strong><small>Geen specifieke situatie kiezen</small>
              </button>
              {situations.map((item) => (
                <button type="button" key={item.slug} className={situation === item.slug ? "active" : ""} aria-pressed={situation === item.slug} onClick={() => setSituation(item.slug)}>
                  <strong>{item.label}</strong><small>{item.description}</small>
                </button>
              ))}
            </div>
          </section>

          {situation === "acuut-gevaar" ? (
            <div className="acute-route-warning"><CircleAlert size={19} /><div><strong>Algemene informatie is nu niet genoeg.</strong><p>Bel bij direct gevaar 112. Gebruik de route hieronder alleen als aanvulling, niet als vervanging van directe hulp.</p></div></div>
          ) : null}

          <div className="route-filter-heading">
            <div><span>Stap 3</span><strong>Kies eventueel een onderwerp</strong></div>
            <small>{currentSituation?.label ?? "Alle situaties"} · {visibleRules.length} resultaten</small>
          </div>
          <div className="topic-filter" role="group" aria-label="Filter op rechtsgebied">
            {topics.map((item) => <button key={item} type="button" className={topic === item ? "active" : ""} aria-pressed={topic === item} onClick={() => setTopic(item)}>{item}</button>)}
          </div>

          {saveMessage ? <p className="save-right-message" aria-live="polite">{saveMessage}</p> : null}

          <div className="public-rule-list" aria-live="polite">
            {visibleRules.length > 0 ? visibleRules.map((rule) => {
              const isSaved = savedRightIds.has(rule.id);
              return (
                <article className="public-rule-card" key={rule.id}>
                  <div className="rule-card-topline"><span className={`rule-type rule-type-${rule.type}`}>{typeLabels[rule.type]}</span><span>{rule.topic}</span></div>
                  <h3>{rule.title}</h3>
                  <p>{rule.summary}</p>
                  <dl>
                    <div><dt>Wanneer geldt dit?</dt><dd>{rule.appliesWhen}</dd></div>
                    <div><dt>Waar ligt de grens?</dt><dd>{rule.boundary}</dd></div>
                  </dl>
                  <div className="rule-practical"><strong>Formeel recht, praktische werkelijkheid</strong><p>{rule.practicalNote}</p></div>
                  <div className="rule-next-step"><span>01</span><div><strong>Wat kun je nu doen?</strong><p>{rule.nextStep}</p></div></div>
                  <div className="rule-footer">
                    <a href={rule.sourceUrl} target="_blank" rel="noreferrer"><ShieldCheck size={14} /><span>{rule.sourcePublisher}<small>{formatCheckedDate(rule.sourceCheckedAt)}</small></span><ExternalLink size={12} /></a>
                    <button type="button" className={isSaved ? "save-rule-button saved" : "save-rule-button"} disabled={savingId === rule.id} onClick={() => toggleSavedRight(rule.id)}>
                      {savingId === rule.id ? <LoaderCircle className="spin" size={15} /> : isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                      {isSaved ? "Opgeslagen" : "Bewaren"}
                    </button>
                  </div>
                </article>
              );
            }) : (
              <div className="no-public-results"><CircleAlert size={23} /><div><strong>Geen kaart gevonden</strong><p>Kies een andere situatie, rol of kortere zoekopdracht.</p></div></div>
            )}
          </div>
        </div>
      </section>

      <section className="account-bridge">
        <div className="account-bridge-copy">
          <span className="eyebrow">Optioneel account</span>
          <h2>Openbaar zoeken blijft gratis.<br />Een account onthoudt de rest.</h2>
          <p>Je hebt geen account nodig om deze route te gebruiken. Log alleen in wanneer je een recht wilt bewaren of een eigen dossier wilt opbouwen.</p>
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
