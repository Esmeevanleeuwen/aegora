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
  Menu,
  MessageCircleQuestion,
  Shield,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { domains, rightsCatalog, statusLabels } from "@/lib/rights-data";
import type { Domain, RightsAnswer, RightItem } from "@/lib/types";

const contextOptions = [
  "Cliënt in de GGZ",
  "Vrijwillige behandeling",
  "Informatie gedeeld",
  "Ouder of vertegenwoordiger betrokken",
];

const iconByDomain: Record<Domain, typeof HeartPulse> = {
  "Zorg & cliënt": HeartPulse,
  Wonen: Home,
  Werk: BriefcaseBusiness,
  Veiligheid: Shield,
  Familie: Users,
  Overheid: Landmark,
};

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [question, setQuestion] = useState(
    "Mijn psycholoog heeft zonder mijn toestemming informatie met mijn ouders gedeeld. Mag dat?",
  );
  const [situation, setSituation] = useState("Cliënt in de GGZ");
  const [ageGroup, setAgeGroup] = useState("18 jaar of ouder");
  const [pronouns, setPronouns] = useState("zij/haar");
  const [tags, setTags] = useState<string[]>(["Vrijwillige behandeling", "Informatie gedeeld"]);
  const [selectedDomain, setSelectedDomain] = useState<Domain>("Zorg & cliënt");
  const [answer, setAnswer] = useState<RightsAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const visibleRights = rightsCatalog.filter((right) => right.domain === selectedDomain);

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
    <main>
      <header className="site-header">
        <a className="brand" href="#start" aria-label="RECHT NU homepage">
          <BrandMark />
          <span>RECHT NU</span>
        </a>
        <nav className={mobileMenuOpen ? "nav-open" : ""} aria-label="Hoofdnavigatie">
          <a href="#rechten" onClick={() => setMobileMenuOpen(false)}>Mijn rechten</a>
          <a href="#vraag" onClick={() => setMobileMenuOpen(false)}>Vraag het de AI</a>
          <a href="#bronnen" onClick={() => setMobileMenuOpen(false)}>Bronnen</a>
          <a href="#werking" onClick={() => setMobileMenuOpen(false)}>Hoe het werkt</a>
        </nav>
        <a className="overview-button" href="#rechten">
          <UserRound size={17} /> Mijn overzicht
        </a>
        <button
          className="menu-button"
          type="button"
          aria-label={mobileMenuOpen ? "Menu sluiten" : "Menu openen"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((value) => !value)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <section className="hero" id="start">
        <div className="hero-copy">
          <span className="eyebrow"><span className="live-dot" /> Actuele officiële bronnen</span>
          <h1>Weet wat er<br />voor <em>jou</em> geldt.</h1>
          <p>
            Je rechten, uitzonderingen en volgende stap — uitgelegd vanuit jouw situatie,
            zonder dat je eerst het juiste loket of wetsartikel hoeft te kennen.
          </p>
          <div className="trust-row">
            <span><Shield size={18} /> Bron vóór antwoord</span>
            <span><LockKeyhole size={18} /> Jij kiest je context</span>
          </div>
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
            minLength={10}
            maxLength={2500}
            required
          />

          <div className="context-fields">
            <label>
              <span>Situatie</span>
              <select value={situation} onChange={(event) => setSituation(event.target.value)}>
                <option>Cliënt in de GGZ</option>
                <option>Patiënt in algemene zorg</option>
                <option>Cliënt in jeugdhulp</option>
                <option>Anders of nog onbekend</option>
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
            {contextOptions.slice(1).map((tag) => (
              <button
                className={tags.includes(tag) ? "chip selected" : "chip"}
                type="button"
                key={tag}
                aria-pressed={tags.includes(tag)}
                onClick={() => toggleTag(tag)}
              >
                {tags.includes(tag) && <Check size={14} />} {tag}
              </button>
            ))}
          </fieldset>

          <button className="ask-button" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}
            {loading ? "Bronnen en context controleren…" : "Vraag het aan RECHT NU"}
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
            <span className="eyebrow">Persoonlijke rechtenkaart</span>
            <h2>Niet alleen wat er staat.<br />Ook wat je ermee kunt.</h2>
          </div>
          <p>
            Ieder recht toont de voorwaarden, uitzonderingen, actuele bron en een concrete
            vervolgstap. De eerste gecontroleerde bronset richt zich op zorg en cliëntrechten.
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

        {visibleRights.length > 0 ? (
          <div className="rights-grid">
            {visibleRights.map((right) => <RightCard right={right} key={right.id} />)}
          </div>
        ) : (
          <div className="empty-domain">
            <FileText size={28} />
            <div>
              <h3>{selectedDomain} wordt toegevoegd na juridische broncontrole.</h3>
              <p>Een rechtsgebied gaat pas live als kaarten, uitzonderingen en bronnen samen zijn gevalideerd.</p>
            </div>
          </div>
        )}
      </section>

      <section className="method-section" id="werking">
        <div className="method-intro">
          <span className="eyebrow">Geen losse chatbot</span>
          <h2>Van vraag naar een<br />controleerbare vervolgstap.</h2>
          <p>
            De AI mag uitleggen en formuleren. De rechten, voorwaarden en bronnen komen uit
            een beheerde kennislaag en blijven apart controleerbaar.
          </p>
        </div>
        <ol className="method-steps">
          <li><span>01</span><div><strong>Situatie</strong><p>Je beschrijft wat er gebeurde en kiest zelf relevante context.</p></div></li>
          <li><span>02</span><div><strong>Bronnen</strong><p>Het systeem zoekt alleen in actuele, goedgekeurde bronversies.</p></div></li>
          <li><span>03</span><div><strong>Toepassen</strong><p>Voorwaarden en uitzonderingen bepalen de zichtbare status.</p></div></li>
          <li><span>04</span><div><strong>Handelen</strong><p>Je krijgt een concrete stap, bewijscheck of conceptbrief.</p></div></li>
        </ol>
      </section>

      <section className="sources-section" id="bronnen">
        <div>
          <span className="eyebrow">Brontransparantie</span>
          <h2>Geen bron,<br />geen stellige conclusie.</h2>
        </div>
        <div className="source-principles">
          <article><Database /><strong>Versies blijven zichtbaar</strong><p>Een antwoord bewaart de gebruikte bronversie en controledatum.</p></article>
          <article><CircleAlert /><strong>Onzekerheid is informatie</strong><p>Ontbrekende feiten en mogelijke uitzonderingen verdwijnen niet uit beeld.</p></article>
          <article><LockKeyhole /><strong>Context blijft begrensd</strong><p>Pronouns, identiteit en juridische kenmerken krijgen ieder een eigen doel.</p></article>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#start"><BrandMark /><span>RECHT NU</span></a>
        <p>Een eerste werkende productbasis binnen de Aegora-repository.</p>
        <a href="#vraag">Stel je vraag <ArrowRight size={15} /></a>
      </footer>
    </main>
  );
}
