import type { Domain, RightItem } from "./types";

export const domains: Array<{
  name: Domain;
  description: string;
  available: boolean;
}> = [
  { name: "Zorg & cliënt", description: "Behandeling, dossier, privacy en klachten", available: true },
  { name: "Wonen", description: "Huur, onderhoud, urgentie en opvang", available: false },
  { name: "Werk", description: "Contract, loon, ontslag en discriminatie", available: false },
  { name: "Veiligheid", description: "Aangifte, bescherming en slachtofferrechten", available: false },
  { name: "Familie", description: "Gezag, jeugdhulp, scheiding en vertegenwoordiging", available: false },
  { name: "Overheid", description: "Besluiten, aanvragen, bezwaar en termijnen", available: false },
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
    sourceTitle: "Rijksoverheid — Wet kwaliteit, klachten en geschillen zorg",
    sourceUrl:
      "https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/kwaliteit-van-de-zorg/wet-kwaliteit-klachten-en-geschillen-zorg",
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
