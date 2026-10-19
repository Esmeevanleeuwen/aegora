import { ArrowDown, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import styles from "./home-mission.module.css";

const researchAreas = [
  {
    title: "Gesloten zorg",
    description: "Vrijheid, zeggenschap en rechtsbescherming wanneer zorg ingrijpt in het dagelijks leven en mensen een instelling niet zelfstandig kunnen verlaten.",
    question: "Wie controleert de grenzen van een ingrijpende beslissing?",
  },
  {
    title: "Jeugdzorg",
    description: "De positie van kinderen, jongeren en gezinnen bij hulpverlening, plaatsing en beslissingen die hun toekomst bepalen.",
    question: "Hoe worden hun stemmen gehoord en meegewogen?",
  },
  {
    title: "Beschermd en begeleid wonen",
    description: "Zelfbeschikking, privacy en de verhouding tussen ondersteuning, huisregels en de vrijheid om het eigen leven vorm te geven.",
    question: "Waar houdt ondersteuning op en begint ongeoorloofde controle?",
  },
];

const researchSteps = [
  {
    title: "Luisteren en vastleggen",
    text: "We beginnen bij ervaringen, gevoelens en klachten. Wat is er gebeurd, hoe is dat ervaren en welke vragen zijn onbeantwoord gebleven?",
  },
  {
    title: "Perspectieven onderzoeken",
    text: "We onderzoeken een onderwerp zo onafhankelijk mogelijk, vanuit de mensen die het meemaken, betrokken professionals, instellingen en beschikbare documenten en bronnen.",
  },
  {
    title: "Verbanden vergelijken",
    text: "We leggen perspectieven naast elkaar, vergelijken overeenkomsten én verschillen en toetsen wat we herkennen aan andere bronnen. Ervaringen, vermoedens en vastgestelde feiten blijven herkenbaar.",
  },
  {
    title: "Terug naar het systeem",
    text: "Vanuit die samenhang onderzoeken we waar het misgaat: in regels, besluiten, uitvoering, toezicht of de mogelijkheid om een fout te laten herstellen. En wat er nodig is om herhaling te voorkomen.",
  },
];

export function MissionIntroduction() {
  return (
    <>
      <section className={styles.intro} id="start" aria-labelledby="mission-title">
        <p className={styles.eyebrow}>Aegora · Onafhankelijk onderzoek & rechtsbescherming</p>
        <h1 id="mission-title">De rechten van één mens <span>raken ons allemaal.</span></h1>
        <div className={styles.introGrid}>
          <div>
            <p className={styles.lead}>
              Als de bescherming van één mens tekortschiet, staat de rechtszekerheid van ons allemaal
              op het spel. Aegora bouwt aan een platform dat mensen helpt zich te beschermen tegen
              problemen binnen het rechtssysteem. We beginnen bij de zorg.
            </p>
            <div className={styles.actions}>
              <a className={styles.primaryLink} href="#waarom">Waarom dit ons allemaal raakt <ArrowDown size={17} aria-hidden="true" /></a>
              <a className={styles.textLink} href="#jouw-stem">Jouw stem telt <ArrowRight size={17} aria-hidden="true" /></a>
            </div>
          </div>
          <aside className={styles.statement} aria-label="Ons uitgangspunt">
            <span>Ons uitgangspunt</span>
            <p>Wat één mens overkomt,<br />kan ieder ander overkomen.</p>
            <small>Vrijheid. Zeggenschap. Een rechtsstaat waarop iedereen kan vertrouwen.</small>
          </aside>
        </div>
        <div className={styles.focusLine}>
          <span>Onze eerste focus</span>
          <a href="#onderzoek">Gesloten zorg</a>
          <a href="#onderzoek">Jeugdzorg</a>
          <a href="#onderzoek">Beschermd en begeleid wonen</a>
        </div>
      </section>

      <section className={styles.problem} id="waarom" aria-labelledby="problem-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>De probleemstelling</p>
          <h2 id="problem-title">Wie beschermt je als het systeem tekortschiet?</h2>
        </div>
        <div className={styles.prose}>
          <p>
            Wanneer rechten worden geschonden, raakt dat meer dan de persoon die het overkomt.
            Het raakt de betekenis van de Grondwet, de betrouwbaarheid van de rechtsstaat en
            het vertrouwen dat onze democratie iedereen beschermt. Daarom gaat rechtsbescherming
            ons als samenleving aan.
          </p>
          <p>
            Juist waar mensen afhankelijk zijn van zorg, wonen of beslissingen van anderen, moet
            bescherming ook in de praktijk werken. Wie kan een besluit uitleggen? Wie luistert als
            iemand bezwaar maakt? En wie grijpt in wanneer de mogelijkheden om op te komen voor
            jezelf tekortschieten?
          </p>
          <p>
            Veel mensen voelen zich alleen met hun problemen, omdat zij ervaren dat er niet naar
            hen wordt geluisterd of dat hun klachten worden genegeerd. Aegora wil zichtbaar maken
            wat anders buiten beeld blijft en onderzoeken hoe persoonlijke ervaringen samenhangen
            met de werking van het systeem.
          </p>
          <a className={styles.sourceLink} href="https://www.rijksoverheid.nl/themas/overheid-en-democratie/democratie/democratische-rechtsstaat-in-nederland" target="_blank" rel="noreferrer">
            Achtergrond: de democratische rechtsstaat <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}

export function MissionResearch() {
  return (
    <>
      <section className={styles.research} id="onderzoek" aria-labelledby="research-title">
        <div className={styles.researchHeading}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Hier beginnen we</p>
            <h2 id="research-title">Drie zorggebieden.<br />Een gedeelde vraag.</h2>
          </div>
          <p className={styles.sectionIntro}>
            Hoe blijven vrijheid en rechtsbescherming overeind wanneer anderen veel invloed
            hebben op je leven? Dit zijn onze eerste onderzoeksgebieden.
          </p>
        </div>
        <ol className={styles.areaList}>
          {researchAreas.map((area, index) => (
            <li key={area.title}>
              <span className={styles.number} aria-hidden="true">0{index + 1}</span>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
              <p className={styles.researchQuestion}>{area.question}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.method} id="werking" aria-labelledby="method-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Onze manier van onderzoeken</p>
          <h2 id="method-title">Verschillende perspectieven.<br />Meer zicht op het geheel.</h2>
          <p className={styles.sectionIntro}>
            Zorg, wonen, toezicht en rechtspraak beïnvloeden elkaar. Volgens ons vinden we de
            waarheid door een onderwerp zo onafhankelijk mogelijk te onderzoeken en de
            verschillende perspectieven vervolgens samen te leggen.
          </p>
          <p className={styles.methodNote}>De uitkomst staat niet vooraf vast. Ook wat niet past bij een eerste vermoeden telt mee.</p>
        </div>
        <ol className={styles.stepList}>
          {researchSteps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.number} aria-hidden="true">0{index + 1}</span>
              <div><h3>{step.title}</h3><p>{step.text}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

export function MissionParticipation() {
  return (
    <section className={styles.participation} id="jouw-stem" aria-labelledby="participation-title">
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}>Een samenleving begint bij elkaar</p>
        <h2 id="participation-title">Jij bent<br /><span>nooit alleen.</span></h2>
      </div>
      <div className={styles.prose}>
        <p>
          Je stem verdient ruimte. Je moet je mening kunnen geven, vragen kunnen stellen en
          kunnen opkomen voor je vrijheid. Ook wanneer je het gevoel hebt dat niemand luistert.
        </p>
        <p>
          Je kunt bijdragen door te vertellen wat je voelt, door je ervaring te delen of door
          je klacht onder woorden te brengen. We willen daarvoor een plek bieden waar je zelf
          kiest: anoniem, of juist met je naam omdat je wilt dat die eindelijk wordt gehoord.
        </p>
        <p>
          Wat jou is aangedaan kan ook een ander overkomen. Daarom zien wij het als een
          gezamenlijke verantwoordelijkheid om onze stem te laten horen, naar elkaar te luisteren
          en op te komen voor elkaars rechten. Jouw ervaring kan helpen zichtbaar te maken wat
          moet veranderen.
        </p>
        <div className={styles.intakeNotice}>
          <strong>Een plek voor jouw verhaal is in voorbereiding</strong>
          <p>Je kunt hier nog geen ervaring of klacht insturen. We bereiden een route voor waarin je zelf kiest wat je deelt en of je naam zichtbaar wordt.</p>
        </div>
        <Link className={styles.textLink} href="/rechten">Bekijk ondertussen je rechten <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
