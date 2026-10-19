import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { SiteHeader } from "@/components/site-header";
import styles from "./waarom.module.css";

export const metadata: Metadata = {
  title: "Waarom Aegora — de rechten van één mens raken ons allemaal",
  description: "Over rechten in de praktijk, macht en verantwoordelijkheid, onafhankelijk onderzoek en de samenhang tussen zorg, wonen en rechtsbescherming. Dit is waarom Aegora bestaat.",
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
    text: "Waar zorg samengaat met het beperken van vrijheid, worden beslissingen bijzonder ingrijpend. We willen onderzoeken waarop maatregelen berusten, hoe hun noodzaak wordt beoordeeld en of ze opnieuw worden overwogen wanneer omstandigheden veranderen. Daarbij kijken we naar informatie, zeggenschap, mogelijkheden om een beslissing te betwisten en de onafhankelijkheid van de controle daarop.",
    question: "Wie bewaakt de grenzen wanneer vrijheid wordt beperkt?",
  },
  {
    title: "Jeugdzorg",
    text: "Beslissingen over hulpverlening en plaatsing kunnen het leven van kinderen, jongeren en gezinnen langdurig bepalen. We willen begrijpen hoe hun ervaringen worden gehoord, welke informatie in dossiers terechtkomt en hoe vermoedens, waarnemingen en conclusies uit elkaar worden gehouden. Ook onderzoeken we hoe verschillende organisaties informatie overnemen en hoe een onjuist of onvolledig beeld kan worden rechtgezet.",
    question: "Welke stem krijgen de mensen over wie wordt beslist?",
  },
  {
    title: "Beschermd en begeleid wonen",
    text: "Wonen en ondersteuning raken aan privacy, zelfstandigheid en de ruimte om eigen keuzes te maken. We onderzoeken hoe afspraken, huisregels en begeleiding doorwerken in het dagelijks leven. Daarbij vragen we wie de grenzen bepaalt, welke ruimte er is voor verschil van mening en hoe iemand een klacht kan bespreken wanneer diegene voor zijn woonplek of ondersteuning van dezelfde organisatie afhankelijk is.",
    question: "Hoe blijft een thuis ook een plek waar je zelf zeggenschap hebt?",
  },
];

const researchSteps = [
  {
    title: "De ervaring en de onderzoeksvraag begrijpen",
    text: "Een ervaring, gevoel of klacht is een beginpunt. We willen begrijpen wat iemand heeft meegemaakt, wat de gevolgen waren en welke vraag onbeantwoord bleef. We maken onderscheid tussen wat iemand zelf heeft waargenomen, wat diegene van anderen heeft gehoord en welke betekenis eraan wordt gegeven.",
  },
  {
    title: "Gebeurtenissen en besluiten reconstrueren",
    text: "We brengen de volgorde van gebeurtenissen, beslissingen en reacties in kaart. Welke informatie was op welk moment beschikbaar? Wie kon wat weten of doen? We bekijken de herkomst en context van documenten, zodat een latere uitleg niet vanzelf wordt behandeld als de oorspronkelijke reden voor een besluit.",
  },
  {
    title: "Perspectieven afzonderlijk onderzoeken",
    text: "We bekijken het onderwerp vanuit de mensen die het meemaken, naasten, professionals, instellingen en andere relevante betrokkenen. Daarnaast onderzoeken we documenten, regels en beschikbare bronnen. We willen ieder perspectief eerst op zichzelf begrijpen, inclusief de belangen, beperkingen en informatie die voor die persoon of organisatie een rol speelden.",
  },
  {
    title: "Overeenkomsten toetsen en tegenspraak zoeken",
    text: "We vergelijken overeenkomsten én verschillen en zoeken actief naar informatie die een eerste verklaring tegenspreekt. Meerdere bronnen kunnen dezelfde oorspronkelijke aanname herhalen. Daarom onderzoeken we ook of bevestigingen werkelijk onafhankelijk van elkaar zijn en welke andere verklaringen mogelijk blijven.",
  },
  {
    title: "Teruggaan naar de oorzaak",
    text: "We onderzoeken welke keuzes, regels en omstandigheden aan een probleem hebben bijgedragen en waar bescherming of correctie had kunnen werken. Daarbij onderscheiden we de verantwoordelijkheid voor een concrete beslissing van de omstandigheden die herhaling mogelijk maken. Een samenhang is pas een verklaring als de tussenliggende stappen voldoende onderbouwd zijn.",
  },
  {
    title: "Conclusies controleerbaar maken",
    text: "We willen laten zien waarop een conclusie berust, welke informatie ontbreekt en hoe zeker een bevinding is. Betrokkenen moeten relevante bevindingen kunnen beantwoorden. Reacties wegen we mee; onbeantwoorde vragen blijven zichtbaar. Nieuwe informatie kan aanleiding zijn om een conclusie aan te passen of een fout te herstellen.",
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
            Rechten moeten bescherming bieden op het moment dat je ze nodig hebt.
            Ook wanneer je afhankelijk bent van anderen, weinig invloed hebt of tegen een
            beslissing ingaat. Aegora ontstaat vanuit de overtuiging dat die bescherming
            een verantwoordelijkheid van ons allemaal is.
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
                Als een schending zonder onderzoek of herstel kan blijven bestaan, ontstaat de vraag
                hoeveel bescherming dezelfde rechten een ander nog bieden. Daarom gaat het ons
                allemaal aan wanneer iemand geen gehoor vindt.
              </p>
              <h3 className={styles.subheading}>Vrijheid vraagt om begrensde macht</h3>
              <p>
                Een democratische rechtsstaat omvat verkiezingen, grondrechten, verantwoording
                en onafhankelijke controle op macht. Ook wie een minderheidsstandpunt heeft of
                tegenover een invloedrijke organisatie staat, moet op bescherming kunnen rekenen.
                Rechten verliezen hun betekenis wanneer de ruimte om ze uit te oefenen afhankelijk
                wordt van instemming met degene die over je beslist.
              </p>
              <p>
                Grondrechten mogen niet zomaar worden beperkt. Een beperking kan onder voorwaarden
                rechtmatig zijn; de onderbouwing en controle daarop zijn juist wezenlijk. Wij willen
                zichtbaar maken wie beslist, op welke gronden dat gebeurt, welke belangen worden
                afgewogen en hoe een onjuiste beslissing kan worden gecorrigeerd. Goede bedoelingen
                maken die vragen niet overbodig.
              </p>
              <h3 className={styles.subheading}>Rechten op papier moeten bereikbaar zijn</h3>
              <p>
                Tussen een recht hebben en er gebruik van kunnen maken kan een grote afstand zitten.
                Je moet weten waar je terechtkunt, begrijpen welke informatie nodig is en tijd en
                ruimte hebben om je verhaal te doen. Als bescherming in de praktijk vooral bereikbaar
                is voor wie de weg kent, mondig is of kan blijven volhouden, schiet zij voor anderen tekort.
              </p>
              <p>
                Voor ons hoort vertrouwen samen te gaan met aanspreekbaarheid. Een instelling moet
                kunnen uitleggen wat zij doet en bereid zijn haar handelen te laten onderzoeken.
                De mogelijkheid om fouten te erkennen en te herstellen maakt bescherming geloofwaardig.
                Dat is de maatstaf die wij ook aan onszelf willen stellen.
              </p>
              <p>
                Aegora bouwt aan een platform waarmee mensen zich beter kunnen beschermen tegen
                problemen binnen het rechtssysteem. Toegankelijke kennis over rechten en onderzoek
                naar hun werking horen voor ons bij elkaar: begrijpen wat je mag verwachten,
                zichtbaar maken waar het tekortschiet en nagaan wat er moet veranderen.
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
                en een klacht. Juist in die verhouding moet rechtsbescherming overeind blijven.
              </p>
              <p>
                Afhankelijkheid kan tegenspraak moeilijk maken. Iemand kan vrezen dat een klacht
                invloed heeft op de relatie met een hulpverlener, de ondersteuning of de woonplek.
                Ook kunnen kennis, dossierinformatie en beslissingsruimte ongelijk verdeeld zijn.
                We willen onderzoeken of de mogelijkheden om gehoord te worden in zulke omstandigheden
                werkelijk toegankelijk zijn.
              </p>
              <p>
                Daarbij nemen we zowel de ervaring van betrokkenen als de verantwoordelijkheid van
                professionals serieus. Bescherming, veiligheid en zelfbeschikking kunnen moeilijke
                afwegingen vragen. Dat maakt een duidelijke onderbouwing, ruimte voor tegenspraak
                en controle des te belangrijker. We beginnen met drie gebieden.
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
                De zorg is ons vertrekpunt binnen een bredere maatschappelijke vraag. Hoe we omgaan
                met mensen die afhankelijk zijn van beslissingen van anderen, laat zien hoe we macht,
                vrijheid en verantwoordelijkheid organiseren. De antwoorden zijn ook van betekenis
                buiten de zorg, waar mensen tegenover werkgevers, verhuurders, overheden of andere
                organisaties kunnen komen te staan.
              </p>
            </section>

            <section id="samenhang" aria-labelledby="connections-title" className={styles.chapter}>
              <p className={styles.chapterNumber}>03 / Het grotere geheel</p>
              <h2 id="connections-title">Verder kijken dan één situatie</h2>
              <p>
                Een ervaring ontstaat niet los van haar omgeving. Regels beïnvloeden beslissingen,
                beslissingen bepalen hoe ondersteuning wordt uitgevoerd en toezicht bepaalt of
                problemen worden opgemerkt. Zorg, wonen, bestuur en rechtspraak raken elkaar.
                Wij zien die samenhang als een reden om verbanden zorgvuldig te onderzoeken.
                Per situatie moet blijken welke verbindingen werkelijk van invloed zijn.
              </p>
              <h3 className={styles.subheading}>Wanneer informatie een eigen leven gaat leiden</h3>
              <p>
                Een beschrijving in een dossier kan meewegen in een volgend besluit. Als een
                interpretatie later als vaststaand feit wordt overgenomen, kan zij steeds meer
                invloed krijgen zonder opnieuw te zijn onderzocht. Daarom willen we terug naar
                de oorsprong: wat is waargenomen, door wie, in welke context en met welke onzekerheid?
                Ook de mogelijkheid om ontbrekende informatie aan te vullen of onjuistheden te
                betwisten hoort bij dat onderzoek.
              </p>
              <h3 className={styles.subheading}>Wanneer verantwoordelijkheid versnipperd raakt</h3>
              <p>
                Verschillende organisaties kunnen ieder een deel van een situatie behandelen,
                terwijl niemand zicht houdt op de volledige gevolgen. Een doorverwijzing kan
                voor een organisatie het einde van een taak zijn, terwijl het probleem voor de
                betrokken persoon blijft bestaan. We willen begrijpen waar de overdracht stokt,
                wie kan ingrijpen en of signalen de mensen bereiken die iets kunnen veranderen.
              </p>
              <p>
                Daarbij onderzoeken we ook de invloed van werkdruk, beschikbare middelen,
                organisatiebelangen en de ruimte die professionals krijgen om van een vastgelopen
                werkwijze af te wijken. Zulke omstandigheden kunnen gedrag helpen verklaren.
                De verantwoordelijkheid voor concrete keuzes blijft een afzonderlijke vraag.
              </p>
              <h3 className={styles.subheading}>Wanneer een klacht geen verandering bereikt</h3>
              <p>
                Een klachtenprocedure heeft voor ons pas betekenis wanneer zij tot een zorgvuldige
                beoordeling en, waar nodig, herstel kan leiden. Wie alleen de afhandeling bekijkt,
                kan missen wat de klacht over de dagelijkse praktijk laat zien. We willen nagaan
                of terugkerende signalen worden herkend, hoe ervan wordt geleerd en of verbeteringen
                ook merkbaar worden voor de mensen om wie het gaat.
              </p>
              <p>
                De Nationale ombudsman maakt voor overheidshandelen een relevant onderscheid:
                handelen volgens de regels is niet automatisch behoorlijk handelen. Ook de omgang
                met mensen en de gevolgen van een besluit verdienen aandacht. Die bredere blik
                op de werking van regels sluit aan bij de vragen die Aegora wil onderzoeken.
              </p>
              <a className={styles.sourceLink} href="https://www.nationaleombudsman.nl/professionals/behoorlijkheidswijzer/een-behoorlijke-overheid-is-belangrijk" target="_blank" rel="noreferrer">
                Achtergrond: behoorlijk overheidshandelen · Nationale ombudsman <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </section>

            <section id="werking" aria-labelledby="method-title" className={styles.chapter}>
              <p className={styles.chapterNumber}>04 / Onze werkwijze</p>
              <h2 id="method-title">De waarheid vraagt om meer dan één perspectief</h2>
              <p>
                Onze overtuiging is dat we dichter bij de waarheid komen door een onderwerp zo
                onafhankelijk mogelijk vanuit verschillende perspectieven te onderzoeken. Eerst
                begrijpen we die perspectieven op zichzelf. Daarna leggen we ze samen en vergelijken
                we wat overeenkomt, wat verschilt en wat nog niet verklaard is. Een gedeeld verhaal
                kan een belangrijk spoor zijn. De waarde ervan hangt af van de onderbouwing.
              </p>
              <p>
                Ieder perspectief verdient een zorgvuldige behandeling. Voor conclusies wegen
                we de kwaliteit, herkomst en controleerbaarheid van informatie. Een persoonlijke
                ervaring kan iets zichtbaar maken wat een dossier mist; een document kan een
                herinnering aanvullen of tegenspreken. Geen van beide krijgt vanzelf het laatste woord.
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
              <h3 className={styles.subheading}>Onafhankelijkheid moet zichtbaar zijn in het werk</h3>
              <p>
                Onafhankelijkheid vraagt om meer dan een naam of een belofte. Voor Aegora betekent
                het dat de onderzoeksvraag en de beschikbare informatie richting moeten geven,
                ook wanneer een uitkomst ongemakkelijk is voor onszelf of voor mensen met wie we
                ons verbonden voelen. Relevante belangen en beperkingen moeten inzichtelijk zijn.
                Kritiek op onze werkwijze moet mogelijk zijn en fouten moeten kunnen worden gecorrigeerd.
              </p>
              <h3 className={styles.subheading}>Van inzicht naar daadwerkelijke bescherming</h3>
              <p>
                We willen dat onderzoek duidelijk maakt welke bescherming ontbrak, waar een
                beslissing anders had kunnen verlopen en wie daar invloed op heeft. Daarmee
                willen we bijdragen aan begrijpelijke informatie, beter onderbouwde vragen,
                zichtbare verantwoordelijkheden en verbeteringen die op hun werking kunnen
                worden beoordeeld. Het doel is dat mensen sterker staan en dat dezelfde fouten
                minder ruimte krijgen om zich te herhalen.
              </p>
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
                Angst, boosheid of verwarring kunnen iets vertellen over de gevolgen van een
                situatie. Onderzoek moet vervolgens uitwijzen wat er is gebeurd en hoe dat te verklaren is.
              </p>
              <p>
                We willen een plek bieden waar je ons kunt ondersteunen door jouw gevoelens,
                ervaring of klacht te delen. Anoniem, als dat voor jou belangrijk is. Of juist
                onder je eigen naam, omdat je wilt dat die een keer wordt gehoord. Jij kiest
                wat je wilt delen en hoe je daarbij zichtbaar wilt zijn. Bij de verdere ontwikkeling
                willen we duidelijk maken wat er met informatie gebeurt en onderscheid maken tussen
                iets delen voor onderzoek en toestemming geven voor publicatie.
              </p>
              <p>
                Wat jou is aangedaan, kan ook een ander overkomen. Daarom zien wij het als een
                gezamenlijke verantwoordelijkheid om onze stem te laten horen, naar elkaar te
                luisteren en op te komen voor elkaars rechten. Die verantwoordelijkheid rust ook
                op wie ruimte, kennis of invloed heeft om iets met een signaal te doen. Niemand
                hoeft een persoonlijk verhaal openbaar te maken om bescherming te verdienen.
              </p>
              <p>
                Een ervaring serieus nemen begint met aandacht en krijgt betekenis door zorgvuldig
                vervolg. Daar willen we aan bouwen: een plek waar persoonlijke verhalen kunnen
                bijdragen aan gezamenlijk inzicht, en waar dat inzicht helpt om de vrijheid en
                rechtszekerheid van iedereen beter te beschermen.
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
