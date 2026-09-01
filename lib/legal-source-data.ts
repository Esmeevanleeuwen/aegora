export type LegalRouteId =
  | "ggz-confidentiality"
  | "ggz-compulsory-care"
  | "ggz-crisis-procedure"
  | "ggz-complaint-support";

export type LegalSourceChunk = {
  chunkKey: string;
  routeId: LegalRouteId;
  routeLabel: string;
  heading: string;
  content: string;
  sourceLocator: string;
  sourceTitle: string;
  sourceUrl: string;
  sourcePublisher: string;
  sourceCheckedAt: string;
  relevance: number;
};

export type LegalRouteQuestion = {
  id: string;
  routeId: LegalRouteId;
  question: string;
  whyItMatters: string;
  options: string[];
  position: number;
};

export const legalRouteLabels: Record<LegalRouteId, string> = {
  "ggz-confidentiality": "Beroepsgeheim en informatie delen",
  "ggz-compulsory-care": "Verplichte zorg en medicatie",
  "ggz-crisis-procedure": "Crisismaatregel en spoed",
  "ggz-complaint-support": "Klacht, PVP en tijdelijke stop",
};

const sources = {
  nip: {
    title: "NIP Beroepscode voor psychologen 2024",
    url: "https://nip.nl/wp-content/uploads/pdfs/NIP_beroepscode_maart_2024_def.pdf",
    publisher: "Nederlands Instituut van Psychologen",
  },
  wvggz: {
    title: "Wet verplichte geestelijke gezondheidszorg",
    url: "https://www.dwangindezorg.nl/wvggz",
    publisher: "Informatiepunt Dwang in de zorg",
  },
  crisis: {
    title: "Crisismaatregel binnen de Wvggz",
    url: "https://www.dwangindezorg.nl/wvggz/crisismaatregel",
    publisher: "Informatiepunt Dwang in de zorg",
  },
  complaint: {
    title: "Klachtrecht binnen de Wvggz",
    url: "https://www.dwangindezorg.nl/wvggz/patientenrecht/klachtrecht",
    publisher: "Informatiepunt Dwang in de zorg",
  },
};

function chunk(
  chunkKey: string,
  routeId: LegalRouteId,
  heading: string,
  content: string,
  sourceLocator: string,
  source: (typeof sources)[keyof typeof sources],
): LegalSourceChunk {
  return {
    chunkKey,
    routeId,
    routeLabel: legalRouteLabels[routeId],
    heading,
    content,
    sourceLocator,
    sourceTitle: source.title,
    sourceUrl: source.url,
    sourcePublisher: source.publisher,
    sourceCheckedAt: "2026-09-01T00:00:00+00:00",
    relevance: 0,
  };
}

export const localLegalSourceChunks: LegalSourceChunk[] = [
  chunk("nip-confidentiality-main", "ggz-confidentiality", "Hoofdregel: vertrouwelijkheid", "Een psycholoog bewaart geheimhouding over wat door de professionele relatie bekend is. Voor het delen van cliëntinformatie is in beginsel gerichte toestemming of een andere geldige grond nodig.", "Artikel 70", sources.nip),
  chunk("nip-conflict-of-duties", "ggz-confidentiality", "Doorbreken bij een conflict van plichten", "Doorbreking van het beroepsgeheim kan alleen na een zorgvuldige afweging, wanneer dit de enige of laatste manier is om direct gevaar te voorkomen. De cliënt wordt zo mogelijk geïnformeerd en er wordt niet meer gedeeld dan noodzakelijk.", "Artikelen 74 tot en met 76", sources.nip),
  chunk("nip-direct-care-team", "ggz-confidentiality", "Delen met rechtstreeks betrokken professionals", "Met professionals die rechtstreeks bij dezelfde opdracht of behandeling zijn betrokken kan noodzakelijke informatie onder voorwaarden worden gedeeld. De cliënt wordt daar vooraf over geïnformeerd en de informatie blijft beperkt tot wat nodig is.", "Artikel 82", sources.nip),
  chunk("wvggz-decision-required", "ggz-compulsory-care", "Verplichte zorg vraagt een formele grond", "Verplichte zorg wordt niet enkel door een behandelaar of crisisdienst opgelegd. Daarvoor is een zorgmachtiging van de rechter of een crisismaatregel van de burgemeester nodig, behoudens strikt begrensde tijdelijke zorg tijdens de voorbereiding van een crisismaatregel.", "Overzicht Wvggz", sources.wvggz),
  chunk("wvggz-substantive-criteria", "ggz-compulsory-care", "Voorwaarden voor verplichte zorg", "Verplichte zorg is pas aan de orde als er door een psychische stoornis ernstig nadeel dreigt, vrijwillige zorg niet mogelijk is en de maatregel evenredig, naar verwachting effectief en zo weinig ingrijpend mogelijk is.", "Uitgangspunten Wvggz", sources.wvggz),
  chunk("wvggz-medication-scope", "ggz-compulsory-care", "Medicatie als vorm van verplichte zorg", "Medicatie kan een vorm van verplichte zorg zijn, maar alleen binnen de toepasselijke formele maatregel en de daarin toegestane zorg. Een behandeladvies of druk om in te stemmen is niet automatisch dezelfde juridische situatie als feitelijke gedwongen toediening.", "Vormen van verplichte zorg", sources.wvggz),
  chunk("wvggz-crisis-decision", "ggz-crisis-procedure", "Wie beslist over een crisismaatregel", "Bij acuut dreigend ernstig nadeel kan de burgemeester een crisismaatregel nemen. Daarvoor onderzoekt een onafhankelijke psychiater de betrokkene en stelt deze een medische verklaring op.", "Besluit en medische verklaring", sources.crisis),
  chunk("wvggz-crisis-temporary-care", "ggz-crisis-procedure", "Tijdelijke verplichte zorg vóór het besluit", "In spoed kan tijdens de voorbereiding tijdelijk verplichte zorg worden toegepast. Die mogelijkheid is kort en wettelijk begrensd; daarna moet er een formeel besluit of een andere geldige grond zijn.", "Voorafgaand aan de crisismaatregel", sources.crisis),
  chunk("wvggz-complaint-pvp", "ggz-complaint-support", "Klacht en ondersteuning door een PVP", "Een cliënt kan over beslissingen rond verplichte zorg klagen bij een onafhankelijke klachtencommissie en gratis hulp vragen aan een patiëntenvertrouwenspersoon (PVP).", "Klachtrecht", sources.complaint),
  chunk("wvggz-complaint-suspension", "ggz-complaint-support", "Klacht stopt zorg niet automatisch", "Een klacht stopt de verplichte zorg niet vanzelf. Bij de klachtencommissie kan wel worden gevraagd de bestreden beslissing tijdelijk te schorsen terwijl de klacht wordt behandeld.", "Schorsingsverzoek", sources.complaint),
];

export const localLegalRouteQuestions: LegalRouteQuestion[] = [
  { id: "ggz-formal-basis", routeId: "ggz-compulsory-care", question: "Welke formele maatregel is genoemd of aan je gegeven?", whyItMatters: "Zonder crisismaatregel of zorgmachtiging is niet duidelijk op welke grond de zorg verplicht zou zijn.", options: ["Crisismaatregel", "Zorgmachtiging", "Alleen een behandelafspraak of waarschuwing", "Ik weet het niet"], position: 10 },
  { id: "ggz-medication-status", routeId: "ggz-compulsory-care", question: "Wat gebeurt er op dit moment met de medicatie?", whyItMatters: "Een behandeladvies, druk om akkoord te gaan en feitelijke toediening tegen je wil zijn juridisch verschillende situaties.", options: ["Alleen voorgesteld", "Ik heb onder druk ingestemd", "Wordt tegen mijn wil toegediend", "Ik weet het niet"], position: 20 },
  { id: "ggz-written-decision", routeId: "ggz-crisis-procedure", question: "Heb je een schriftelijke beslissing of beschikking ontvangen?", whyItMatters: "Het document laat zien wie heeft beslist, welke vorm van verplichte zorg is toegestaan en welke route of termijn geldt.", options: ["Ja", "Nee", "Ik weet het niet"], position: 10 },
  { id: "ggz-shared-information", routeId: "ggz-confidentiality", question: "Weet je welke informatie met de crisisdienst is gedeeld?", whyItMatters: "De noodzaak en omvang van de gedeelde informatie zijn belangrijk voor de beoordeling van het beroepsgeheim.", options: ["Ja, precies", "Alleen gedeeltelijk", "Nee"], position: 10 },
  { id: "ggz-danger-reason", routeId: "ggz-confidentiality", question: "Welke concrete reden voor direct gevaar of ernstig nadeel is aan je uitgelegd?", whyItMatters: "Een algemene zorg is niet hetzelfde als een concreet en direct risico dat doorbreking of verplichte zorg kan dragen.", options: ["Er is een concrete reden genoemd", "Er is alleen algemene zorg genoemd", "Er is niets uitgelegd", "Ik weet het niet"], position: 20 },
];

function hasAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

export function selectLegalRouteIds(question: string, contextText = ""): LegalRouteId[] {
  const value = `${question} ${contextText}`.toLocaleLowerCase("nl-NL");
  const isGgz = hasAny(value, ["psycholoog", "psychiater", "ggz", "crisisdienst", "crisismaatregel", "zorgmachtiging", "verplichte zorg", "medicatie", "beroepsgeheim"]);
  if (!isGgz) return [];

  const routes: LegalRouteId[] = [];
  if (hasAny(value, ["psycholoog", "crisisdienst", "informatie", "gedeeld", "contact opgenomen", "toestemming", "beroepsgeheim"])) routes.push("ggz-confidentiality");
  if (hasAny(value, ["medicatie", "verplicht", "dwang", "tegen mijn wil", "zorgmachtiging", "weigeren"])) routes.push("ggz-compulsory-care");
  if (hasAny(value, ["crisis", "crisisdienst", "crisismaatregel", "spoed", "burgemeester"])) routes.push("ggz-crisis-procedure");
  if (routes.length > 0) routes.push("ggz-complaint-support");

  return [...new Set(routes)];
}
