import type { Domain, RightItem } from "./types";

export const domains: Array<{
  name: Domain;
  description: string;
  available: boolean;
}> = [
  { name: "Zorg & cliënt", description: "Behandeling, dossier, privacy en klachten", available: true },
  { name: "Wonen", description: "Huur, onderhoud, urgentie en opvang", available: true },
  { name: "Werk", description: "Contract, loon, ontslag en discriminatie", available: true },
  { name: "Veiligheid", description: "Aangifte, bescherming en slachtofferrechten", available: true },
  { name: "Familie", description: "Gezag, jeugdhulp, scheiding en vertegenwoordiging", available: true },
  { name: "Overheid", description: "Besluiten, aanvragen, bezwaar en termijnen", available: true },
];

export const rightsCatalog: RightItem[] = [
  {
    id: "duidelijke-informatie-en-keuze",
    domain: "Zorg & cliënt",
    title: "Duidelijke informatie en zelf beslissen",
    summary:
      "Je hebt recht op begrijpelijke informatie, overleg over je behandeling en de mogelijkheid om een behandeling te weigeren.",
    status: "bevestigd",
    conditions: ["Er is sprake van een medische behandeling of behandelvoorstel."],
    exceptions: [
      "Leeftijd, vertegenwoordiging, wilsbekwaamheid of een wettelijke dwanggrond kan de precieze beslisroute veranderen.",
    ],
    nextStep: "Vraag om de opties, gevolgen en alternatieven schriftelijk uit te leggen.",
    responsibleParty: "Je behandelaar of zorgaanbieder",
    deadline: "Vóórdat je instemt met de behandeling",
    evidence: "Behandelvoorstel, correspondentie en eigen gespreksnotities",
    escalationRoute: "Bespreek het met je behandelaar en vraag daarna de klachtenfunctionaris.",
    sourceTitle: "Rijksoverheid — rechten en plichten bij medische behandeling",
    sourceUrl:
      "https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/rechten-van-patient-en-privacy/rechten-bij-een-medische-behandeling/rechten-en-plichten-bij-medische-behandeling",
    sourceDate: "Gecontroleerd 30 augustus 2026",
  },
  {
    id: "inzage-en-kopie-dossier",
    domain: "Zorg & cliënt",
    title: "Inzage en kopie van je medisch dossier",
    summary:
      "Je mag je medisch dossier inzien, een kopie ontvangen en vragen wie het dossier heeft bekeken.",
    status: "bevestigd",
    conditions: ["Het verzoek gaat over gegevens die over jouzelf zijn vastgelegd."],
    exceptions: [
      "Delen die de privacy van een ander schaden kunnen worden afgeschermd; de zorgaanbieder moet dit uitleggen.",
    ],
    nextStep: "Vraag de zorgverlener om digitale inzage, een kopie en zo nodig de logging.",
    responsibleParty: "De zorgaanbieder die je dossier beheert",
    deadline: "Dien je verzoek schriftelijk in en bewaar een kopie",
    evidence: "Je inzageverzoek en de reactie van de zorgaanbieder",
    escalationRoute: "Herinner de zorgaanbieder en benader zo nodig de privacyfunctionaris of klachtenfunctionaris.",
    sourceTitle: "Rijksoverheid — medisch dossier inzien",
    sourceUrl:
      "https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/rechten-van-patient-en-privacy/uw-medisch-dossier/mag-ik-mijn-medisch-dossier-inzien",
    sourceDate: "Gecontroleerd 30 augustus 2026",
  },
  {
    id: "privacy-medische-gegevens",
    domain: "Zorg & cliënt",
    title: "Privacy en bescherming van medische gegevens",
    summary:
      "Medische gegevens zijn beschermd. De zorgverlener moet zorgvuldig omgaan met toegang en delen van informatie.",
    status: "waarschijnlijk",
    conditions: ["Het gaat om medische of gezondheidsgegevens binnen de zorg."],
    exceptions: [
      "Toestemming, een wettelijke plicht, vertegenwoordiging of een acute veiligheidssituatie kan de beoordeling veranderen.",
    ],
    nextStep: "Vraag welke informatie is gedeeld, met wie, met welk doel en op welke grond.",
    responsibleParty: "De zorgaanbieder die de gegevens heeft gedeeld",
    deadline: "Vraag dit zo snel mogelijk na ontdekking",
    evidence: "Berichten, toestemmingsformulieren en een overzicht van gedeelde gegevens",
    escalationRoute: "Vraag de privacyfunctionaris om onderzoek en gebruik daarna de klachtenroute.",
    sourceTitle: "Rijksoverheid — bescherming van medische gegevens",
    sourceUrl:
      "https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/digitale-gegevens-in-de-zorg/bescherming-van-medische-gegevens",
    sourceDate: "Gecontroleerd 30 augustus 2026",
  },
  {
    id: "klacht-en-geschil-zorg",
    domain: "Zorg & cliënt",
    title: "Klacht, klachtenfunctionaris en geschil",
    summary:
      "Je kunt een klacht bespreken en gratis hulp vragen van de klachtenfunctionaris van de zorgaanbieder.",
    status: "bevestigd",
    conditions: ["De zorgaanbieder valt onder de Nederlandse klachtenregels voor zorg."],
    exceptions: ["De juiste route kan verschillen per zorgvorm, instelling en soort klacht."],
    nextStep: "Vraag schriftelijk naar de klachtenfunctionaris en de aangesloten geschilleninstantie.",
    responsibleParty: "De zorgaanbieder en diens klachtenfunctionaris",
    deadline: "Controleer de klachtenregeling van de aanbieder",
    evidence: "Een tijdlijn, correspondentie en relevante dossierstukken",
    escalationRoute: "Klachtenfunctionaris → geschilleninstantie; laat bij twijfel de route controleren.",
    sourceTitle: "Rijksoverheid — Wet kwaliteit, klachten en geschillen zorg",
    sourceUrl:
      "https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/kwaliteit-van-de-zorg/wet-kwaliteit-klachten-en-geschillen-zorg",
    sourceDate: "Gecontroleerd 30 augustus 2026",
  },
  {
    id: "onderhoud-huurwoning",
    domain: "Wonen",
    title: "Groot onderhoud door de verhuurder",
    summary:
      "Groot onderhoud is normaal voor de verhuurder. Klein dagelijks onderhoud is meestal voor de huurder.",
    status: "bevestigd",
    conditions: ["Je huurt woonruimte en er is sprake van een gebrek of noodzakelijk onderhoud."],
    exceptions: [
      "Wie het onderhoud betaalt hangt af van het soort gebrek, de oorzaak en wat wettelijk als klein onderhoud geldt.",
    ],
    nextStep: "Meld het gebrek schriftelijk, vraag om herstel en bewaar foto's en correspondentie.",
    responsibleParty: "Je verhuurder",
    deadline: "Meld het gebrek zo snel mogelijk en geef een redelijke hersteltermijn",
    evidence: "Foto's, de gebrekenmelding, het huurcontract en reacties van de verhuurder",
    escalationRoute: "Controleer of de Huurcommissie, gemeente of kantonrechter de passende route is.",
    sourceTitle: "Rijksoverheid — onderhoud huurwoning",
    sourceUrl:
      "https://www.rijksoverheid.nl/vraag-en-antwoord/woning-huren/welke-kosten-zijn-voor-de-huurder-en-welke-voor-de-verhuurder",
    sourceDate: "Gecontroleerd 30 augustus 2026",
  },
  {
    id: "wettelijke-vakantie",
    domain: "Werk",
    title: "Wettelijke vakantiedagen",
    summary:
      "Als werknemer bouw je per jaar minimaal vier keer het aantal uren op dat je per week werkt.",
    status: "bevestigd",
    conditions: ["Je werkt op basis van een arbeidsovereenkomst."],
    exceptions: [
      "Bij een deel van het jaar of wisselende uren wordt de opbouw naar verhouding berekend. Een cao of contract kan extra dagen geven.",
    ],
    nextStep: "Vraag je werkgever om je actuele verlofsaldo en de toegepaste berekening.",
    responsibleParty: "Je werkgever",
    deadline: "Controleer op tijd wanneer wettelijke uren vervallen",
    evidence: "Arbeidsovereenkomst, cao, loonstroken en verlofoverzicht",
    escalationRoute: "Vraag eerst om correctie bij je werkgever en laat daarna je contract of cao controleren.",
    sourceTitle: "Rijksoverheid — wettelijke vakantiedagen",
    sourceUrl:
      "https://www.rijksoverheid.nl/vraag-en-antwoord/vakantiedagen-en-vakantiegeld/op-hoeveel-vakantiedagen-heb-ik-recht",
    sourceDate: "Gecontroleerd 30 augustus 2026",
  },
  {
    id: "slachtofferrechten",
    domain: "Veiligheid",
    title: "Informatie, aangifte, hulp en bescherming",
    summary:
      "Als slachtoffer heb je onder meer recht op informatie, aangifte, gratis hulp, bescherming en een goede behandeling.",
    status: "bevestigd",
    conditions: ["Je bent slachtoffer van een mogelijk strafbaar feit."],
    exceptions: [
      "Welke bescherming, bijstand of vervolgstap mogelijk is hangt af van het feit, de veiligheid en de strafprocedure.",
    ],
    nextStep: "Leg vast wat er gebeurde en vraag politie of Slachtofferhulp welke route en bescherming passen.",
    responsibleParty: "Politie, Openbaar Ministerie en betrokken slachtofferinstanties",
    deadline: "Wacht bij direct gevaar niet en bel 112",
    evidence: "Berichten, foto's, medische informatie, getuigen en een eigen tijdlijn",
    escalationRoute: "Aangifte of melding → informatie over de zaak → passende slachtofferhulp.",
    sourceTitle: "Politie — rechten van slachtoffers",
    sourceUrl: "https://www.politie.nl/informatie/als-slachtoffer-heeft-u-rechten.html",
    sourceDate: "Gecontroleerd 30 augustus 2026",
  },
  {
    id: "dossier-minderjarig-kind",
    domain: "Familie",
    title: "Medisch dossier van een minderjarig kind",
    summary:
      "Wie toestemming geeft en het dossier mag inzien verandert wanneer een kind 12 of 16 jaar wordt.",
    status: "uitzondering-mogelijk",
    conditions: ["Je bent ouder of voogd van een kind jonger dan 18 jaar dat medische zorg krijgt."],
    exceptions: [
      "Gezag, de leeftijd en het belang van het kind bepalen de precieze toegang. Vanaf 16 jaar hebben ouders niet automatisch inzage.",
    ],
    nextStep: "Vraag de zorgverlener welke leeftijds- en gezagsregel wordt toegepast en waarom.",
    responsibleParty: "De zorgverlener die het dossier beheert",
    deadline: "Controleer dit vóór een behandeling of dossierverzoek",
    evidence: "Gezagsgegevens, het verzoek en de schriftelijke reactie van de zorgverlener",
    escalationRoute: "Zorgverlener → privacy- of klachtenfunctionaris → passende klachtenroute.",
    sourceTitle: "Rijksoverheid — medisch dossier minderjarig kind",
    sourceUrl:
      "https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/rechten-van-patient-en-privacy/jongeren-en-het-medisch-dossier/medisch-dossier-minderjarige-kind-inzien",
    sourceDate: "Gecontroleerd 30 augustus 2026",
  },
  {
    id: "bezwaar-overheidsbesluit",
    domain: "Overheid",
    title: "Bezwaar tegen een overheidsbesluit",
    summary:
      "Tegen veel besluiten van een overheidsorganisatie kun je binnen zes weken bezwaar maken.",
    status: "waarschijnlijk",
    conditions: ["Je hebt een formeel besluit ontvangen waarin staat dat bezwaar mogelijk is."],
    exceptions: [
      "Niet tegen ieder bericht staat bezwaar open. De rechtsmiddelenclausule en bijzondere wet kunnen een andere route of termijn geven.",
    ],
    nextStep: "Controleer direct de datum, bezwaartermijn en instructies onderaan het besluit.",
    responsibleParty: "De overheidsorganisatie die het besluit nam",
    deadline: "Vaak binnen 6 weken na bekendmaking van het besluit",
    evidence: "Het volledige besluit, verzenddatum, aanvraag en relevante bewijsstukken",
    escalationRoute: "Bezwaar bij de organisatie → beslissing op bezwaar → eventueel beroep bij de rechter.",
    sourceTitle: "Rijksoverheid — bezwaar tegen een overheidsbesluit",
    sourceUrl:
      "https://www.rijksoverheid.nl/vraag-en-antwoord/bezwaar-en-beroep/bezwaar-tegen-beslissing-overheid",
    sourceDate: "Gecontroleerd 30 augustus 2026",
  },
];

export const statusLabels = {
  bevestigd: "Bevestigd toepasselijk",
  waarschijnlijk: "Waarschijnlijk toepasselijk",
  "uitzondering-mogelijk": "Uitzondering mogelijk",
  "meer-context-nodig": "Meer context nodig",
  "menselijke-controle": "Menselijke controle nodig",
} as const;
