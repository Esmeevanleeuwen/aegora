import type { RightsCombination, RightsEdge } from "./rights-network";

/** Different catalogues may describe the same right; links use one stable ID. */
export const rightsAliases: Record<string, string> = {
  "duidelijke-informatie-en-keuze": "patient-informatie-keuze",
  "inzage-en-kopie-dossier": "patient-dossier",
  "klacht-en-geschil-zorg": "patient-klacht",
  "onderhoud-huurwoning": "huurder-onderhoud",
  "dossier-minderjarig-kind": "ouder-medisch-dossier-kind",
};

type EditorialLink = Omit<RightsEdge, "id">;

// These are editorial reading routes, not assertions that two rules always apply
// together. Keep every relation explicit so recommendation code needs no guesswork.
const editorialLinks: EditorialLink[] = [
  {
    sourceId: "patient-informatie-keuze", targetId: "patient-dossier", relation: "related",
    label: "Van uitleg naar vastlegging", priority: 100,
    explanation: "Lees naast informatie en beslissen ook wat in het dossier is vastgelegd. De voorwaarden van ieder onderdeel blijven afzonderlijk gelden.",
  },
  {
    sourceId: "patient-informatie-keuze", targetId: "patient-klacht", relation: "procedure",
    label: "Uitleg of keuze betwisten", priority: 90,
    explanation: "De klachtenroute is een vervolgartikel wanneer je vragen hebt over informatie, overleg of een behandelkeuze. Welke route past, vraagt eigen beoordeling.",
  },
  {
    sourceId: "gelijke-behandeling", targetId: "patient-informatie-keuze", relation: "context",
    label: "Gelijke behandeling en zorg", priority: 70,
    explanation: "Lees naast informatie en behandelkeuze ook het algemene kader van gelijke behandeling. Deze leesroute beoordeelt niet of een verschil in zorg verboden is.",
  },
  {
    sourceId: "patient-dossier", targetId: "patient-klacht", relation: "procedure",
    label: "Dossier en klachtenroute", priority: 95,
    explanation: "Deze leesroute brengt dossierinformatie en de uitleg over klachten samen. Een dossierstuk bewijst op zichzelf niet dat een klacht gegrond is.",
  },
  {
    sourceId: "privacy", targetId: "privacy-medische-gegevens", relation: "context",
    label: "Privacy in de zorg", priority: 100,
    explanation: "Ga van algemene gegevensbescherming naar de specifieke uitleg over medische gegevens. Controleer de grondslag en uitzonderingen per onderdeel.",
  },
  {
    sourceId: "privacy-medische-gegevens", targetId: "beroepsgeheim-zorg", relation: "protection",
    label: "Gegevens en geheimhouding", priority: 100,
    explanation: "Lees de bescherming van medische gegevens naast de professionele geheimhoudingsplicht. Dit zijn verschillende invalshoeken op het omgaan met informatie.",
  },
  {
    sourceId: "privacy-medische-gegevens", targetId: "patient-dossier", relation: "related",
    label: "Welke informatie is vastgelegd?", priority: 95,
    explanation: "Bij vragen over medische gegevens kan de uitleg over inzage helpen om het dossier te begrijpen. De verbinding geeft geen automatische toegang tot alle gegevens.",
  },
  {
    sourceId: "privacy-medische-gegevens", targetId: "patient-klacht", relation: "procedure",
    label: "Een vraag over gegevens bespreken", priority: 85,
    explanation: "Deze route verwijst van een privacyvraag naar de algemene uitleg over klachten in de zorg. De juiste privacy- of klachtenroute hangt van de situatie af.",
  },
  {
    sourceId: "beroepsgeheim-zorg", targetId: "patient-dossier", relation: "related",
    label: "Vertrouwelijkheid en dossier", priority: 90,
    explanation: "De dossieruitleg en geheimhoudingsplicht belichten dezelfde informatie vanuit patiënt en professional. Lees de grenzen van beide onderdelen apart.",
  },
  {
    sourceId: "ouder-medisch-dossier-kind", targetId: "patient-dossier", relation: "context",
    label: "Leeftijd en dossierinzage", priority: 100,
    explanation: "De algemene dossieruitleg krijgt een aparte context bij minderjarigen. Het artikel over kinderen beschrijft waarom leeftijd en gezag moeten worden gecontroleerd.",
  },
  {
    sourceId: "ouder-medisch-dossier-kind", targetId: "patient-informatie-keuze", relation: "context",
    label: "Wie krijgt uitleg en beslist?", priority: 95,
    explanation: "Lees de uitleg over informatie en keuze samen met de leeftijds- en gezagscontext bij een kind. De verbinding bepaalt niet wie in een concreet geval beslist.",
  },
  {
    sourceId: "ouder-medisch-dossier-kind", targetId: "privacy-medische-gegevens", relation: "protection",
    label: "Privacy rond een kind", priority: 90,
    explanation: "Deze leesroute combineert de uitleg over medische privacy met de specifieke voorwaarden voor een minderjarig kind.",
  },
  {
    sourceId: "psycholoog-titel-tucht", targetId: "zorg-bevoegd-bekwaam", relation: "context",
    label: "Registratie en handelen", priority: 90,
    explanation: "Beroepstitel, registratie en de voorwaarden voor een concrete handeling zijn verschillende vragen. Deze artikelen helpen die naast elkaar te onderzoeken.",
  },
  {
    sourceId: "psycholoog-titel-tucht", targetId: "zorg-tucht-verweer", relation: "procedure",
    label: "De tuchtrechtelijke route", priority: 100,
    explanation: "De uitleg over registratie helpt de context van de tuchtprocedure te begrijpen. Een verbinding betekent niet dat iedere psycholoog onder die procedure valt.",
  },
  {
    sourceId: "psycholoog-titel-tucht", targetId: "patient-klacht", relation: "procedure",
    label: "Een passende klachtenroute", priority: 95,
    explanation: "Vergelijk de algemene klachtenroute met de uitleg over beroepstitel en registratie. Die context helpt om verschillende procedures uit elkaar te houden.",
  },
  {
    sourceId: "zorg-bevoegd-bekwaam", targetId: "patient-informatie-keuze", relation: "protection",
    label: "Handelen en behandelkeuze", priority: 80,
    explanation: "Deze artikelen bieden twee invalshoeken: de voorwaarden voor professioneel handelen en de informatie en keuze van de patiënt. Het ene vervangt het andere niet.",
  },
  {
    sourceId: "zorg-tucht-verweer", targetId: "beroepsgeheim-zorg", relation: "context",
    label: "Informatie in een procedure", priority: 80,
    explanation: "Lees de algemene uitleg over beroepsgeheim ook bij een tuchtprocedure. Deze link stelt niet vast welke informatie in een concrete procedure gedeeld mag worden.",
  },
  {
    sourceId: "gelijke-behandeling", targetId: "basis-religie", relation: "protection",
    label: "Religie en gelijke behandeling", priority: 90,
    explanation: "Bekijk naast de algemene uitleg over gelijke behandeling het afzonderlijke grondrecht rond religie en levensovertuiging.",
  },
  {
    sourceId: "gelijke-behandeling", targetId: "basis-geslacht", relation: "protection",
    label: "Geslacht als beschermd kenmerk", priority: 90,
    explanation: "Dit onderdeel werkt de algemene uitleg over gelijke behandeling uit rond geslacht en gender, met eigen grenzen en toepassingsgebieden.",
  },
  {
    sourceId: "gelijke-behandeling", targetId: "basis-ras", relation: "protection",
    label: "Afkomst als beschermd kenmerk", priority: 90,
    explanation: "Dit onderdeel biedt nadere uitleg over afkomst en huidskleur binnen het thema gelijke behandeling. De concrete context blijft bepalend.",
  },
  {
    sourceId: "gelijke-behandeling", targetId: "basis-seksuele-gerichtheid", relation: "protection",
    label: "Gerichtheid en gelijke behandeling", priority: 90,
    explanation: "Lees de algemene gelijkebehandelingsuitleg naast het onderdeel over seksuele gerichtheid en de daar beschreven voorwaarden.",
  },
  {
    sourceId: "gelijke-behandeling", targetId: "basis-handicap", relation: "protection",
    label: "Handicap en toegankelijkheid", priority: 95,
    explanation: "Het onderdeel over handicap en chronische ziekte verdiept de algemene uitleg over gelijke behandeling en beschrijft ook aanpassingen en grenzen.",
  },
  {
    sourceId: "gelijke-behandeling", targetId: "basis-politieke-overtuiging", relation: "protection",
    label: "Overtuiging en gelijke behandeling", priority: 85,
    explanation: "Deze route verbindt algemene gelijkebehandelingsuitleg met het afzonderlijke onderdeel over politieke overtuiging.",
  },
  {
    sourceId: "gelijke-behandeling", targetId: "basis-overige-gronden", relation: "protection",
    label: "Andere beschermde kenmerken", priority: 85,
    explanation: "Lees verder over andere beschermde kenmerken en de terreinen waarop de betreffende regels gelden.",
  },
  {
    sourceId: "vrijheid-meningsuiting", targetId: "basis-politieke-overtuiging", relation: "context",
    label: "Overtuiging en uiting", priority: 95,
    explanation: "Een politieke overtuiging en het uiten van een mening zijn verwante onderwerpen met eigen juridische grenzen. Deze route laat beide artikelen naast elkaar lezen.",
  },
  {
    sourceId: "vrijheid-meningsuiting", targetId: "basis-religie", relation: "context",
    label: "Een overtuiging uiten", priority: 80,
    explanation: "Bekijk de uitleg over meningsuiting naast religie en levensovertuiging. De verbinding laat verschillende grondrechten zien zonder een belangenafweging te beslissen.",
  },
  {
    sourceId: "arbeidscontract-basis", targetId: "wettelijke-vakantie", relation: "context",
    label: "Vakantie binnen het contract", priority: 100,
    explanation: "Het vakantieartikel verdiept één onderdeel uit de bredere uitleg over contract, loon en werktijd. Controleer ook de eigen contract- en cao-context.",
  },
  {
    sourceId: "arbeidscontract-basis", targetId: "veilig-werken-zorg", relation: "related",
    label: "Arbeidsvoorwaarden en werkplek", priority: 90,
    explanation: "Lees arbeidsvoorwaarden naast de uitleg over een veilige werkplek. De artikelen behandelen verschillende onderdelen van werken in loondienst.",
  },
  {
    sourceId: "arbeidscontract-basis", targetId: "gelijke-behandeling", relation: "protection",
    label: "Gelijke behandeling op het werk", priority: 80,
    explanation: "De algemene gelijkebehandelingsuitleg kan als achtergrond bij de arbeidsartikelen worden gelezen. Dit bepaalt niet of een concreet arbeidsverschil verboden is.",
  },
  {
    sourceId: "huurder-contract", targetId: "huurder-onderhoud", relation: "context",
    label: "Contract en onderhoud", priority: 100,
    explanation: "Bekijk de algemene huurcontractuitleg naast de specifieke uitleg over onderhoud en het melden van gebreken.",
  },
  {
    sourceId: "huurder-contract", targetId: "huurder-opzegging", relation: "protection",
    label: "Contract en beëindiging", priority: 100,
    explanation: "De uitleg over het huurcontract vormt context bij het artikel over opzegging. Contractsoort en omstandigheden moeten afzonderlijk worden nagegaan.",
  },
  {
    sourceId: "huurder-contract", targetId: "gelijke-behandeling", relation: "context",
    label: "Gelijke behandeling bij wonen", priority: 70,
    explanation: "Deze route biedt naast de huurartikelen algemene achtergrond over gelijke behandeling. Niet ieder huurgeschil is een discriminatiekwestie.",
  },
  {
    sourceId: "huurder-contract", targetId: "bezwaar-overheidsbesluit", relation: "procedure",
    label: "Een besluit of een huurgeschil?", priority: 65,
    explanation: "Vergelijk bij vragen rond wonen de huurroute met de uitleg over een overheidsbesluit. Een verhuurdersbrief is niet automatisch een besluit waartegen bezwaar openstaat.",
  },
  {
    sourceId: "politie-taak", targetId: "politie-bevoegdheden", relation: "context",
    label: "Taak en wettelijke grenzen", priority: 100,
    explanation: "Lees de algemene politietaak naast de voorwaarden en grenzen van specifieke politiebevoegdheden. Een taak geeft op zichzelf geen onbeperkte bevoegdheid.",
  },
  {
    sourceId: "politie-taak", targetId: "slachtofferrechten", relation: "protection",
    label: "Politie en slachtofferinformatie", priority: 100,
    explanation: "Deze route brengt de uitleg over de politietaak samen met de informatie voor slachtoffers. De benodigde hulp of bescherming hangt van de situatie af.",
  },
  {
    sourceId: "politie-bevoegdheden", targetId: "privacy", relation: "context",
    label: "Bevoegdheden en gegevens", priority: 70,
    explanation: "Bekijk bij informatieverwerking ook de algemene privacyuitleg. Voor politiegegevens kunnen specifieke regels gelden; deze algemene link beoordeelt die niet.",
  },
  {
    sourceId: "bezwaar-overheidsbesluit", targetId: "gelijke-behandeling", relation: "context",
    label: "Een besluit en gelijke behandeling", priority: 70,
    explanation: "Naast de formele bezwaarroute kun je de algemene uitleg over gelijke behandeling lezen. De koppeling zegt niets over de geldigheid of uitkomst van een bezwaar.",
  },
];

export const rightsNetworkEdges: RightsEdge[] = editorialLinks.map((link) => ({
  ...link,
  id: `${link.sourceId}--${link.targetId}`,
}));

/** Featured is an editorial choice. openCount starts at zero; no popularity is invented. */
export const rightsNetworkCombinations: RightsCombination[] = [
  {
    id: "zorg-informatie-dossier-klacht", slug: "zorg-informatie-dossier-klacht",
    title: "Uitleg, dossier en een klacht", summary: "Lees hoe behandelkeuze, dossierinformatie en de klachtenroute zich tot elkaar verhouden.",
    nodeIds: ["patient-informatie-keuze", "patient-dossier", "patient-klacht"],
    featured: true, priority: 100, openCount: 0, tags: ["Zorg", "Dossier", "Klachten"],
  },
  {
    id: "privacy-en-beroepsgeheim", slug: "privacy-en-beroepsgeheim",
    title: "Privacy en beroepsgeheim", summary: "Verbind algemene privacy, medische gegevens, geheimhouding en je dossier.",
    nodeIds: ["privacy", "privacy-medische-gegevens", "beroepsgeheim-zorg", "patient-dossier"],
    featured: true, priority: 95, openCount: 0, tags: ["Zorg", "Privacy", "Gegevens"],
  },
  {
    id: "kind-informatie-en-privacy", slug: "kind-informatie-en-privacy",
    title: "Een kind, informatie en privacy", summary: "Bekijk de algemene zorguitleg samen met de bijzondere context van leeftijd en gezag.",
    nodeIds: ["ouder-medisch-dossier-kind", "patient-informatie-keuze", "patient-dossier", "privacy-medische-gegevens"],
    featured: true, priority: 90, openCount: 0, tags: ["Kinderen", "Zorg", "Privacy"],
  },
  {
    id: "zorg-registratie-en-procedure", slug: "zorg-registratie-en-procedure",
    title: "Registratie, handelen en klachten", summary: "Onderzoek de samenhang tussen beroepstitel, bekwaamheid en verschillende klachtenprocedures.",
    nodeIds: ["psycholoog-titel-tucht", "zorg-bevoegd-bekwaam", "patient-klacht", "zorg-tucht-verweer"],
    featured: true, priority: 85, openCount: 0, tags: ["Zorg", "Professional", "Klachten"],
  },
  {
    id: "gelijke-behandeling-en-overtuiging", slug: "gelijke-behandeling-en-overtuiging",
    title: "Gelijke behandeling en overtuiging", summary: "Lees algemene bescherming naast religie, politieke overtuiging en meningsuiting.",
    nodeIds: ["gelijke-behandeling", "basis-religie", "basis-politieke-overtuiging", "vrijheid-meningsuiting"],
    featured: true, priority: 80, openCount: 0, tags: ["Grondrechten", "Gelijke behandeling", "Overtuiging"],
  },
  {
    id: "werken-voorwaarden-en-veiligheid", slug: "werken-voorwaarden-en-veiligheid",
    title: "Werken, verlof en veiligheid", summary: "Bekijk arbeidsvoorwaarden, wettelijke vakantie en een veilige werkplek in één leesroute.",
    nodeIds: ["arbeidscontract-basis", "wettelijke-vakantie", "veilig-werken-zorg", "gelijke-behandeling"],
    featured: true, priority: 75, openCount: 0, tags: ["Werk", "Contract", "Veiligheid"],
  },
  {
    id: "wonen-contract-en-bescherming", slug: "wonen-contract-en-bescherming",
    title: "Wonen, onderhoud en opzegging", summary: "Verbind je huurcontract met de uitleg over onderhoud en bescherming bij opzegging.",
    nodeIds: ["huurder-contract", "huurder-onderhoud", "huurder-opzegging"],
    featured: true, priority: 70, openCount: 0, tags: ["Wonen", "Contract", "Onderhoud"],
  },
  {
    id: "politie-bescherming-en-grenzen", slug: "politie-bescherming-en-grenzen",
    title: "Politie, bescherming en grenzen", summary: "Lees slachtofferinformatie naast de politietaak en de grenzen van bevoegdheden.",
    nodeIds: ["politie-taak", "politie-bevoegdheden", "slachtofferrechten"],
    featured: true, priority: 65, openCount: 0, tags: ["Veiligheid", "Politie", "Bescherming"],
  },
];
