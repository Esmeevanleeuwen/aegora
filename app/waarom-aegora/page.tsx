import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { SiteHeader } from "@/components/site-header";
import styles from "./waarom.module.css";

export const metadata: Metadata = {
  title: "Waarom Aegora — de rechten van één mens raken ons allemaal",
  description: "Waarom Aegora bouwt aan rechtsbescherming en onafhankelijk onderzoek. Over de rechtsstaat, onze eerste zorggebieden en de betekenis van jouw stem.",
};

const chapters = [
  { id: "waarom", title: "Waarom dit iedereen raakt" },
  { id: "onderzoek", title: "Waarom we bij de zorg beginnen" },
  { id: "samenhang", title: "Verder kijken dan één situatie" },
  { id: "werking", title: "Hoe we onderzoeken" },
  { id: "jouw-stem", title: "De betekenis van jouw stem" },
];

const researchAreas = [
  {
    title: "Gesloten zorg",
    text: "Waar zorg samengaat met het beperken van vrijheid, worden beslissingen bijzonder ingrijpend. We willen onderzoeken hoe die beslissingen tot stand komen, hoe mensen ertegen kunnen opkomen en wie controleert of hun rechten worden gerespecteerd.",
    question: "Wie bewaakt de grenzen wanneer vrijheid wordt beperkt?",
  },
  {
    title: "Jeugdzorg",
    text: "Beslissingen over hulpverlening en plaatsing kunnen het leven van kinderen, jongeren en gezinnen langdurig bepalen. We willen begrijpen hoe hun ervaringen worden gehoord, hoe informatie wordt beoordeeld en hoe besluiten kunnen worden bevraagd en herzien.",
    question: "Welke stem krijgen de mensen over wie wordt beslist?",
  },
  {
    title: "Beschermd en begeleid wonen",
    text: "Wonen en ondersteuning raken aan privacy, zelfstandigheid en de ruimte om eigen keuzes te maken. We onderzoeken de verhouding tussen begeleiding, huisregels en zeggenschap, en wat er gebeurt als ondersteuning en persoonlijke vrijheid met elkaar botsen.",
    question: "Hoe blijft een thuis ook een plek waar je zelf zeggenschap hebt?",
  },
];

const researchSteps = [
  {
    title: "Luisteren zonder de uitkomst vast te leggen",
    text: "Een ervaring, gevoel of klacht is een beginpunt. We willen begrijpen wat iemand heeft meegemaakt, welke vragen zijn blijven liggen en welke informatie nog ontbreekt.",
  },
  {
    title: "Perspectieven afzonderlijk onderzoeken",
    text: "We bekijken het onderwerp vanuit verschillende betrokkenen: mensen die het meemaken, naasten, professionals en instellingen. Daarnaast onderzoeken we documenten, regels en andere beschikbare bronnen. Ieder perspectief krijgt ruimte voordat we conclusies verbinden.",
  },
  {
    title: "Overeenkomsten én verschillen vergelijken",
    text: "We leggen de perspectieven naast elkaar. Waar herkennen mensen hetzelfde? Waar spreken verhalen elkaar tegen? Welke informatie ondersteunt een bewering? Overeenkomsten geven richting aan het onderzoek; ze vormen op zichzelf nog geen bewijs.",
  },
  {
    title: "Teruggaan naar de oorzaak",
    text: "Vanuit de samenhang onderzoeken we waar iets is misgegaan: in regels, besluitvorming, uitvoering, toezicht of het herstellen van fouten. Zo willen we duidelijk maken welke verandering nodig is om herhaling te voorkomen.",
  },
];

export default function WhyAegoraPage() {
  return (
    <div className={styles.page}>
      <SiteHeader active="about" />
      <main id="start" className={styles.main}>
        <header className={styles.hero}>
          <Link className={styles.backLink} href="/"><ArrowLeft size={15} aria-hidden="true" /> Naar de homepage</Link>
          <p className={styles.eyebrow}>Waarom Aegora</p>
          <h1>De rechten van één mens <span>raken ons allemaal.</span></h1>
          <p className={styles.lead}>
            Vrijheid en rechtszekerheid krijgen betekenis in hoe we met elkaar omgaan.
            Als de bescherming van één mens tekortschiet, raakt dat het vertrouwen waarop
            we allemaal bouwen. Vanuit die overtuiging ontstaat Aegora.
          </p>
          <div className={styles.heroFoot}>
            <span>Onafhankelijk onderzoek & rechtsbescherming</span>
            <a href="#waarom">Lees ons verhaal <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
        </header>

        <div className={styles.readingLayout}>
          <aside className={styles.contents}>
            <nav aria-label="Op deze pagina">
              <p className={styles.contentsLabel}>In dit verhaal</p>
              <ol>
                {chapters.map((chapter, index) => (
                  <li key={chapter.id}>
                    <a href={`#${chapter.id}`}><span aria-hidden="true">0{index + 1}</span>{chapter.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
            <p className={styles.sideNote}>Een samenleving waarin je rechten ook in de praktijk bescherming bieden.</p>
          </aside>

          <article className={styles.story} aria-label="Het verhaal achter Aegora">
            <section id="waarom" aria-labelledby="why-title" className={styles.chapter}>
              <p className={styles.chapterNumber}>01 / Ons uitgangspunt</p>
              <h2 id="why-title">Waarom dit iedereen raakt</h2>
              <p>
                Wanneer de rechten van een mens worden geschonden, blijft de betekenis daarvan
                niet beperkt tot die ene situatie. Het raakt aan de Grondwet, aan de betrouwbaarheid
                van de rechtsstaat en aan het vertrouwen dat onze democratie ieder van ons beschermt.
                Wat vandaag bij een ander wordt toegestaan, zegt ook iets over de bescherming waarop
                je morgen zelf kunt rekenen.
              </p>
              <p>
                Grondrechten mogen niet zomaar worden beperkt. Juist daarom moeten we kunnen vragen
                waarop een beslissing berust, wie daarop toeziet en hoe een fout kan worden hersteld.
                Een rechtsstaat moet merkbaar zijn wanneer je bescherming nodig hebt, ook als je
                weinig invloed hebt of tegenover een organisatie staat die sterker is dan jij.
              </p>
              <p>
                Aegora bouwt aan een platform waarmee mensen zich beter kunnen beschermen tegen
                problemen binnen het rechtssysteem. Dat is een vraagstuk voor de hele samenleving.
                De manier waarop we omgaan met de vrijheid en waardigheid van een ander, bepaalt
                mede de samenleving waarin we zelf leven.
              </p>
              <a className={styles.sourceLink} href="https://www.rijksoverheid.nl/themas/overheid-en-democratie/democratie/democratische-rechtsstaat-in-nederland" target="_blank" rel="noreferrer">
                Meer over de democratische rechtsstaat · Rijksoverheid <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <blockquote className={styles.pullQuote}>
                Wat één mens overkomt,<br />kan ieder ander overkomen.
              </blockquote>
            </section>

            <section id="onderzoek" aria-labelledby="research-title" className={styles.chapter}>
              <p className={styles.chapterNumber}>02 / Onze eerste focus</p>
              <h2 id="research-title">Waarom we bij de zorg beginnen</h2>
              <p>
                In de zorg komen bescherming, afhankelijkheid en beslissingen over het dagelijks
                leven dicht bij elkaar. Wie afhankelijk is van anderen voor zorg of een woonplek,
                moet tegelijk kunnen vertrouwen op ruimte voor een eigen mening, eigen keuzes
                en een klacht. We beginnen daarom met drie gebieden waarin die verhouding centraal staat.
              </p>
              <div className={styles.areas}>
                {researchAreas.map((area) => (
                  <section className={styles.area} key={area.title}>
                    <h3>{area.title}</h3>
                    <p>{area.text}</p>
                    <p className={styles.researchQuestion}>{area.question}</p>
                  </section>
                ))}
              </div>
              <p>
                Deze gebieden vormen ons beginpunt. De vragen die we er stellen gaan iedereen aan:
                hoe wordt macht gebruikt, wie wordt gehoord en hoe zorgen we dat bescherming werkelijk werkt?
              </p>
            </section>

            <section id="samenhang" aria-labelledby="connections-title" className={styles.chapter}>
              <p className={styles.chapterNumber}>03 / Het grotere geheel</p>
              <h2 id="connections-title">Verder kijken dan één situatie</h2>
              <p>
                Een ervaring ontstaat niet los van haar omgeving. Regels beïnvloeden beslissingen,
                beslissingen bepalen hoe ondersteuning wordt uitgevoerd en toezicht bepaalt of
                problemen worden opgemerkt. Zorg, wonen, bestuur en rechtspraak raken elkaar.
                Wat binnen het ene onderdeel gebeurt, kan gevolgen hebben voor het andere.
              </p>
              <p>
                Daarom onderzoeken we onderwerpen afzonderlijk én in hun samenhang. We willen
                begrijpen hoe een probleem kon ontstaan, waarom een signaal mogelijk niet werd
                opgepakt en op welk moment bescherming had moeten werken. Een patroon kan pas
                zichtbaar worden wanneer ervaringen en informatie uit verschillende delen van
                het systeem bij elkaar komen.
              </p>
              <p>
                Daarbij blijven we precies: een verband is nog geen bewezen oorzaak. We willen
                duidelijk maken wat we weten, wat we vermoeden en welke vragen openstaan.
              </p>
            </section>

            <section id="werking" aria-labelledby="method-title" className={styles.chapter}>
              <p className={styles.chapterNumber}>04 / Onze werkwijze</p>
              <h2 id="method-title">De waarheid vraagt om meer dan één perspectief</h2>
              <p>
                Onze overtuiging is dat we dichter bij de waarheid komen door een onderwerp zo
                onafhankelijk mogelijk vanuit verschillende perspectieven te onderzoeken. Eerst
                begrijpen we die perspectieven op zichzelf. Daarna leggen we ze samen en vergelijken
                we wat overeenkomt, wat verschilt en wat nog niet verklaard is.
              </p>
              <ol className={styles.steps}>
                {researchSteps.map((step, index) => (
                  <li key={step.title}>
                    <span className={styles.stepNumber} aria-hidden="true">0{index + 1}</span>
                    <div><h3>{step.title}</h3><p>{step.text}</p></div>
                  </li>
                ))}
              </ol>
              <aside className={styles.principle} aria-label="Ons onderzoeksprincipe">
                <strong>De uitkomst staat niet vooraf vast.</strong>
                <p>Ook informatie die een eerste vermoeden tegenspreekt, moet worden meegewogen. Ervaringen, interpretaties en vastgestelde feiten blijven van elkaar te onderscheiden.</p>
              </aside>
            </section>

            <section id="jouw-stem" aria-labelledby="voice-title" className={styles.chapter}>
              <p className={styles.chapterNumber}>05 / Samen verantwoordelijkheid dragen</p>
              <h2 id="voice-title">Jij bent nooit alleen.</h2>
              <p>
                Veel mensen voelen zich alleen met hun problemen, omdat zij ervaren dat er niet
                naar hen wordt geluisterd. Een klacht blijft liggen, een gevoel wordt weggewuifd
                of hun woorden lijken nergens aan te komen. Juist dan vinden wij het belangrijk
                dat er ruimte is om te vertellen wat er is gebeurd en wat dat met iemand doet.
              </p>
              <p>
                Je stem verdient het om serieus genomen te worden. Je moet je mening kunnen
                geven, vragen kunnen stellen en kunnen opkomen voor je vrijheid. Een gevoel of
                ervaring hoeft nog geen volledig dossier te zijn om aanleiding te geven tot een vraag.
              </p>
              <p>
                We willen een plek bieden waar je ons kunt ondersteunen door jouw gevoelens,
                ervaring of klacht te delen. Anoniem, als dat voor jou belangrijk is. Of juist
                onder je eigen naam, omdat je wilt dat die een keer wordt gehoord. Jij kiest
                wat je wilt delen en hoe je daarbij zichtbaar wilt zijn.
              </p>
              <p>
                Wat jou is aangedaan, kan ook een ander overkomen. Daarom zien wij het als een
                gezamenlijke verantwoordelijkheid om onze stem te laten horen, naar elkaar te
                luisteren en op te komen voor elkaars rechten. Zo kan een persoonlijke ervaring
                bijdragen aan inzicht dat voor veel meer mensen van betekenis is.
              </p>
              <div className={styles.participation}>
                <span className={styles.status}>In voorbereiding</span>
                <h3>Een plek voor jouw verhaal</h3>
                <p>Je kunt hier nog geen ervaring of klacht insturen. We werken toe naar een route waarin je zelf kiest wat je deelt en of je naam zichtbaar wordt.</p>
                <Link className={styles.actionLink} href="/rechten">Verken je rechten <ArrowRight size={17} aria-hidden="true" /></Link>
              </div>
            </section>
          </article>
        </div>
      </main>
      <footer className={styles.footer}>
        <Link className="brand footer-brand" href="/" aria-label="Aegora homepage"><BrandMark /></Link>
        <p>De rechten van één mens raken ons allemaal.</p>
        <a href="#start">Terug naar boven <ArrowUpRight size={15} aria-hidden="true" /></a>
      </footer>
    </div>
  );
}
