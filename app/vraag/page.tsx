"use client";

import { ArrowLeft, ArrowRight, Check, CircleAlert, ExternalLink, LoaderCircle, LockKeyhole, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { publicSituations } from "@/lib/public-rights-data";
import { statusLabels } from "@/lib/rights-data";
import type { RightsAnswer } from "@/lib/types";

const steps = ["Je vraag", "Relevante context", "Controle", "Uitkomst"];
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
export default function QuestionPage() {
  const [step, setStep] = useState(0);
  const [question, setQuestion] = useState("");
  const [situation, setSituation] = useState("Algemeen of nog onbekend");
  const [ageGroup, setAgeGroup] = useState("");
  const [pronouns, setPronouns] = useState("Nog niet delen");
  const [tags, setTags] = useState<string[]>([]);
  const [answer, setAnswer] = useState<RightsAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleTag(tag: string) {
    setTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
  }

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: { situation, ageGroup, pronouns, tags } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "De vraag kon niet worden verwerkt.");
      setAnswer(data as RightsAnswer);
      setStep(3);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setAnswer(null);
    setError("");
    setStep(0);
  }

  return (
    <main className="question-flow-page">
      <SiteHeader active="question" />
      <div className="question-flow-shell">
        <div className="flow-intro">
          <span className="eyebrow">Persoonlijke rechtencheck</span>
          <h1>Vertel wat er<br />is gebeurd.</h1>
          <p>Je hoeft geen juridisch woord te kennen. We vragen alleen door als een antwoord je rechten kan veranderen.</p>
          <div className="flow-privacy"><LockKeyhole size={18} /><span>Je kunt anoniem beginnen. Deel geen BSN, dossiernummer of volledige naam.</span></div>
        </div>

        <section className="flow-card">
          <ol className="progress-steps" aria-label="Voortgang">
            {steps.map((label, index) => (
              <li key={label} className={index === step ? "active" : index < step ? "complete" : ""} aria-current={index === step ? "step" : undefined}>
                <span>{index < step ? <Check size={14} /> : index + 1}</span><small>{label}</small>
              </li>
            ))}
          </ol>

          {step < 3 && (
            <form onSubmit={submitQuestion}>
              {step === 0 && (
                <div className="flow-step">
                  <span className="step-count">Stap 1 van 3</span>
                  <h2>Wat wil je weten?</h2>
                  <p>Beschrijf één gebeurtenis in je eigen woorden. Een paar zinnen is genoeg.</p>
                  <label htmlFor="guided-question">Jouw situatie</label>
                  <textarea id="guided-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Beschrijf wat er gebeurde en wat je wilt weten." minLength={10} maxLength={2500} required />
                  <div className="example-line"><span>Dit kan gaan over</span> wonen, werk, zorg, familie, veiligheid of de overheid.</div>
                </div>
              )}

              {step === 1 && (
                <div className="flow-step">
                  <span className="step-count">Stap 2 van 3</span>
                  <h2>Wat is relevant voor je vraag?</h2>
                  <p>Je mag een vraag overslaan. Minder delen kan betekenen dat de uitkomst voorzichtiger wordt.</p>
                  <div className="flow-fields">
                    <label><span>Jouw rol of situatie</span><select value={situation} onChange={(event) => setSituation(event.target.value)}>{situationOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                    <label><span>Leeftijdsgroep</span><select value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)}><option value="">Nog niet delen</option><option>Jonger dan 12 jaar</option><option>12 tot en met 15 jaar</option><option>16 of 17 jaar</option><option>18 jaar of ouder</option></select></label>
                  </div>
                  <fieldset className="choice-grid"><legend>Welke omschrijvingen passen?</legend>{publicSituations.map((option) => <button key={option.slug} type="button" className={tags.includes(option.slug) ? "choice-card selected" : "choice-card"} aria-pressed={tags.includes(option.slug)} onClick={() => toggleTag(option.slug)}><span className="choice-check">{tags.includes(option.slug) && <Check size={14} />}</span>{option.label}</button>)}</fieldset>
                  <div className="pronoun-field"><label htmlFor="pronouns">Hoe spreken we je aan?</label><select id="pronouns" value={pronouns} onChange={(event) => setPronouns(event.target.value)}><option>Nog niet delen</option><option>zij/haar</option><option>hij/hem</option><option>die/diens</option><option>hen/hun</option><option>naam gebruiken</option></select><small>Dit verandert alleen de aanspreekvorm, nooit de juridische uitkomst.</small></div>
                </div>
              )}

              {step === 2 && (
                <div className="flow-step review-step">
                  <span className="step-count">Stap 3 van 3</span>
                  <h2>Klopt deze samenvatting?</h2>
                  <p>Controleer de informatie voordat we bronnen en uitzonderingen toepassen.</p>
                  <div className="review-question"><small>Je vraag</small><strong>{question}</strong><button type="button" onClick={() => setStep(0)}>Aanpassen</button></div>
                  <dl className="review-context">
                    <div><dt>Situatie</dt><dd>{situation}</dd></div>
                    <div><dt>Leeftijd</dt><dd>{ageGroup || "Niet gedeeld"}</dd></div>
                    <div><dt>Context</dt><dd>{tags.length ? tags.map((tag) => publicSituations.find((item) => item.slug === tag)?.label ?? tag).join(", ") : "Niet gedeeld"}</dd></div>
                    <div><dt>Aanspreekvorm</dt><dd>{pronouns}</dd></div>
                  </dl>
                  <button className="text-button" type="button" onClick={() => setStep(1)}>Context aanpassen</button>
                </div>
              )}

              {error && <p className="form-error" role="alert"><CircleAlert size={16} />{error}</p>}
              <div className="flow-actions">
                {step > 0 ? <button className="back-button" type="button" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={17} /> Terug</button> : <Link className="back-button" href="/"><ArrowLeft size={17} /> Naar home</Link>}
                <button className="flow-next" type="submit" disabled={loading || (step === 0 && question.trim().length < 10)}>{loading ? <LoaderCircle className="spin" size={18} /> : step === 2 ? <Sparkles size={18} /> : null}{loading ? "Bronnen controleren…" : step === 2 ? "Bekijk mijn rechten" : "Ga verder"}<ArrowRight size={17} /></button>
              </div>
            </form>
          )}

          {step === 3 && answer && (
            <div className="flow-result" aria-live="polite">
              <div className="result-heading"><div><span className="eyebrow">Uitkomst</span><h2>{answer.summary}</h2></div><span className={`status status-${answer.status}`}>{statusLabels[answer.status]}</span></div>
              <p>{answer.explanation}</p>
              <div className="result-sections">
                <section><span>01</span><h3>Wat geldt mogelijk?</h3><ul>{answer.rights.map((right) => <li key={right.id}>{right.title}</li>)}</ul></section>
                <section><span>02</span><h3>Wat kun je nu doen?</h3><ol>{answer.nextSteps.map((item) => <li key={item}>{item}</li>)}</ol></section>
              </div>
              <div className="result-sources"><strong>Gebruikte officiële bronnen</strong>{answer.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink size={13} /></a>)}</div>
              {answer.warning && <p className="answer-warning"><CircleAlert size={17} />{answer.warning}</p>}
              <div className="result-actions"><Link className="flow-next" href="/rechten">Bekijk alle openbare rechten <ArrowRight size={17} /></Link><button className="back-button" type="button" onClick={restart}><RotateCcw size={16} /> Nieuwe vraag</button></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
