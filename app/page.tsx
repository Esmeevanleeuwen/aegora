"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Database,
  ExternalLink,
  FileText,
  HeartPulse,
  Home,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  MessageCircleQuestion,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import styles from "./home.module.css";
import { BrandMark } from "@/components/brand-mark";
import { SiteHeader } from "@/components/site-header";
import { publicSituations } from "@/lib/public-rights-data";
import { domains, rightsCatalog, statusLabels } from "@/lib/rights-data";
import type { Domain, RightsAnswer, RightItem } from "@/lib/types";

const situationOptions = [
  "Algemeen of nog onbekend",
  "Cliënt of patiënt",
  "Werknemer of werkzoekende",
  "Huurder of woningzoekende",
  "Ouder, voogd of familielid",
  "Slachtoffer of betrokkene",
  "Burger bij overheid of politie",
  "Professional of organisatie",
];

const iconByDomain: Record<Domain, typeof HeartPulse> = {
  "Zorg & cliënt": HeartPulse,
  Wonen: Home,
  Werk: BriefcaseBusiness,
  Veiligheid: Shield,
  Familie: Users,
  Overheid: Landmark,
};

function RightCard({ right }: { right: RightItem }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="right-card">
      <div className="right-card-topline">
        <span className={`status status-${right.status}`}>{statusLabels[right.status]}</span>
        <span className="source-date">
          <Clock3 size={14} /> {right.sourceDate}
        </span>
      </div>
      <h3>{right.title}</h3>
      <p>{right.summary}</p>
      <div className="right-action">
        <span className="action-number">1</span>
        <div>
          <strong>Wat je nu kunt doen</strong>
          <p>{right.nextStep}</p>
        </div>
      </div>
      <button className="details-button" type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Minder details" : "Voorwaarden en uitzonderingen"}
        <ChevronDown className={open ? "rotate" : ""} size={18} />
      </button>
      {open && (
        <div className="right-details">
          <div>
            <strong>Voorwaarde</strong>
            <ul>{right.conditions.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <strong>Kan de uitkomst veranderen?</strong>
            <ul>{right.exceptions.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      )}
      <a className="source-link" href={right.sourceUrl} target="_blank" rel="noreferrer">
        <Database size={15} /> {right.sourceTitle} <ExternalLink size={14} />
      </a>
    </article>
  );
}

function AnswerPanel({ answer }: { answer: RightsAnswer }) {
  return (
    <section className="answer-panel" aria-live="polite">
      <div className="answer-heading">
        <div>
          <span className="eyebrow">Uitkomst van je vraag</span>
          <h2>{answer.summary}</h2>
        </div>
        <span className={`status status-${answer.status}`}>{statusLabels[answer.status]}</span>
      </div>

      <p className="answer-explanation">{answer.explanation}</p>

      <div className="answer-grid">
        <div className="answer-block">
          <span className="answer-index">01</span>
          <h3>Rechten die mogelijk gelden</h3>
          <ul>{answer.rights.map((right) => <li key={right.id}>{right.title}</li>)}</ul>
        </div>
        <div className="answer-block">
          <span className="answer-index">02</span>
          <h3>Wat je nu kunt doen</h3>
          <ol>{answer.nextSteps.map((step) => <li key={step}>{step}</li>)}</ol>
        </div>
        <div className="answer-block">
          <span className="answer-index">03</span>
          <h3>Aannames in dit antwoord</h3>
          <ul>{answer.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>

      <div className="answer-sources">
        <strong>Controleerbare bronnen</strong>
        <div>
          {answer.sources.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
              {source.title} <ExternalLink size={13} />
            </a>
          ))}
        </div>
      </div>

      {answer.warning && (
        <p className="answer-warning"><CircleAlert size={17} /> {answer.warning}</p>
      )}
    </section>
  );
}

export default function HomePage() {
  const [question, setQuestion] = useState("");
  const [situation, setSituation] = useState("Algemeen of nog onbekend");
  const [ageGroup, setAgeGroup] = useState("");
  const [pronouns, setPronouns] = useState("Nog niet delen");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [answer, setAnswer] = useState<RightsAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const visibleRights = selectedDomain
    ? rightsCatalog.filter((right) => right.domain === selectedDomain)
    : [];

  function toggleTag(tag: string) {
    setTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  async function askQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          context: { situation, ageGroup, pronouns, tags },
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "De vraag kon niet worden verwerkt.");
      }

      setAnswer(data as RightsAnswer);
      window.setTimeout(() => {
        document.getElementById("antwoord")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className="hero" id="start">
        <div className="hero-copy">
          <span className="eyebrow"><span className="live-dot" /> Rechten helder uitgelegd</span>
          <h1>Weet waar je<br /><em>recht</em> op hebt.</h1>
          <p>
            Algemene rechten voor iedereen, duidelijk uitgelegd per onderwerp, rol en situatie.
            Zonder dat je eerst het juiste loket of wetsartikel hoeft te kennen.
          </p>
          <div className="trust-row">
            <span><Shield size={18} /> Bron vóór antwoord</span>
            <span><LockKeyhole size={18} /> Zonder account beginnen</span>
          </div>
          <Link className={styles.aboutLink} href="/waarom-aegora">Waarom Aegora <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>

        <form className="question-card" id="vraag" onSubmit={askQuestion}>
          <div className="question-card-heading">
            <div>
              <span className="eyebrow">Begin bij wat er gebeurde</span>
              <h2>Wat is je vraag?</h2>
            </div>
            <MessageCircleQuestion aria-hidden="true" />
          </div>
          <label htmlFor="question" className="sr-only">Beschrijf je situatie</label>
          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Bijvoorbeeld: mijn verhuurder herstelt een ernstig gebrek niet. Wat kan ik doen?"
            minLength={10}
            maxLength={2500}
            required
          />

          <div className={`context-fields ${styles.contextFields}`}>
            <label>
              <span>Rol of situatie</span>
              <select value={situation} onChange={(event) => setSituation(event.target.value)}>
                {situationOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label>
              <span>Leeftijd</span>
              <select value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)}>
                <option value="">Nog niet delen</option>
                <option>Jonger dan 12 jaar</option>
                <option>12 tot en met 15 jaar</option>
                <option>16 of 17 jaar</option>
                <option>18 jaar of ouder</option>
              </select>
            </label>
            <label>
              <span>Aanspreekvorm</span>
              <select value={pronouns} onChange={(event) => setPronouns(event.target.value)}>
                <option>Nog niet delen</option>
                <option>zij/haar</option>
                <option>hij/hem</option>
                <option>die/diens</option>
                <option>hen/hun</option>
                <option>naam gebruiken</option>
              </select>
            </label>
          </div>

          <fieldset className="context-chips">
            <legend>Extra context — alleen als het je antwoord kan veranderen</legend>
            {publicSituations.map((option) => (
              <button
                className={tags.includes(option.slug) ? "chip selected" : "chip"}
                type="button"
                key={option.slug}
                aria-pressed={tags.includes(option.slug)}
                onClick={() => toggleTag(option.slug)}
              >
                {tags.includes(option.slug) && <Check size={14} />} {option.label}
              </button>
            ))}
          </fieldset>

          <button className="ask-button" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}
            {loading ? "Bronnen en context controleren…" : "Vraag het aan Aegora"}
            {!loading && <ArrowRight size={18} />}
          </button>
          <p className="form-note"><LockKeyhole size={13} /> Pronouns veranderen alleen hoe we je aanspreken, niet welke rechten je krijgt.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
      </section>

      {answer && <div id="antwoord" className="answer-wrap"><AnswerPanel answer={answer} /></div>}

      <section className="rights-section" id="rechten">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Rechten per onderwerp</span>
            <h2>Voor iedere situatie<br />een duidelijk startpunt.</h2>
          </div>
          <p>
            Kies een onderwerp. Je ziet algemene rechten, voorwaarden, uitzonderingen,
            officiële bronnen en een mogelijke volgende stap. Een account is niet nodig.
          </p>
        </div>

        <div className="domain-grid" role="list" aria-label="Rechtsgebieden">
          {domains.map((domain) => {
            const Icon = iconByDomain[domain.name];
            const selected = selectedDomain === domain.name;
            return (
              <button
                type="button"
                role="listitem"
                className={`domain-card ${selected ? "active" : ""}`}
                key={domain.name}
                onClick={() => setSelectedDomain(domain.name)}
              >
                <span className="domain-icon"><Icon size={23} /></span>
                <strong>{domain.name}</strong>
                <small>{domain.description}</small>
                <span className={domain.available ? "domain-state available" : "domain-state"}>
                  {domain.available ? "Bronset actief" : "Volgende bronronde"}
                </span>
              </button>
            );
          })}
        </div>

        {selectedDomain && visibleRights.length > 0 ? (
          <div className="rights-grid">
            {visibleRights.map((right) => <RightCard right={right} key={right.id} />)}
          </div>
        ) : selectedDomain ? (
          <div className="empty-domain">
            <FileText size={28} />
            <div>
              <h3>{selectedDomain} wordt toegevoegd na juridische broncontrole.</h3>
              <p>Een rechtsgebied gaat pas live als kaarten, uitzonderingen en bronnen samen zijn gevalideerd.</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="method-section" id="werking">
        <div className="method-intro">
          <span className="eyebrow">Geen losse chatbot</span>
          <h2>Van vraag naar een<br />controleerbare vervolgstap.</h2>
          <p>
            Aegora helpt je om je vraag te verkennen met uitleg, rechten en bronverwijzingen.
            Controleer altijd welke voorwaarden en uitzonderingen bij jouw situatie horen.
          </p>
        </div>
        <ol className="method-steps">
          <li><span>01</span><div><strong>Situatie</strong><p>Je beschrijft wat er gebeurde en kiest zelf relevante context.</p></div></li>
          <li><span>02</span><div><strong>Bronnen</strong><p>Je krijgt bronverwijzingen om de uitleg zelf na te lezen.</p></div></li>
          <li><span>03</span><div><strong>Toepassen</strong><p>Je bekijkt welke voorwaarden en uitzonderingen van belang kunnen zijn.</p></div></li>
          <li><span>04</span><div><strong>Handelen</strong><p>Je verkent een mogelijke volgende stap en welke informatie daarvoor nodig is.</p></div></li>
        </ol>
      </section>

      <section className="sources-section" id="bronnen">
        <div>
          <span className="eyebrow">Brontransparantie</span>
          <h2>Geen bron,<br />geen stellige conclusie.</h2>
        </div>
        <div className="source-principles">
          <article><Database /><strong>Bronnen zelf nalezen</strong><p>Volg de bronverwijzingen en controleer of de informatie nog actueel is.</p></article>
          <article><CircleAlert /><strong>Ruimte voor onzekerheid</strong><p>Een eerste uitleg kan onvolledig zijn. Ontbrekende feiten kunnen de uitkomst veranderen.</p></article>
          <article><LockKeyhole /><strong>Deel alleen wat nodig is</strong><p>Beschrijf je vraag zonder namen, dossiernummers of andere herkenbare gegevens.</p></article>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#start" aria-label="Aegora, terug naar boven"><BrandMark /></a>
        <p>Inzicht in je rechten. Aandacht voor wat erachter ligt.</p>
        <Link href="/waarom-aegora">Waarom Aegora <ArrowRight size={15} aria-hidden="true" /></Link>
      </footer>
    </main>
  );
}
