export type PublicRoleId =
  | "iedereen"
  | "client"
  | "psycholoog"
  | "zorgmedewerker"
  | "politieagent"
  | "werknemer"
  | "huurder"
  | "ouder";

export type PublicTopic = "Algemeen" | "Zorg" | "Werk" | "Wonen" | "Veiligheid" | "Kinderen";
export type RuleType = "recht" | "plicht" | "bevoegdheid" | "grens";

export type PublicRole = {
  id: PublicRoleId;
  label: string;
  description: string;
  icon: "users" | "heart" | "brain" | "stethoscope" | "badge" | "briefcase" | "home" | "family";
};

export type PublicRule = {
  id: string;
  roles: PublicRoleId[];
  topic: PublicTopic;
  type: RuleType;
  title: string;
  summary: string;
  appliesWhen: string;
  boundary: string;
  sourceTitle: string;
  sourceUrl: string;
};

export const publicRoles: PublicRole[] = [
  { id: "iedereen", label: "Iedereen", description: "Grondrechten en bescherming die niet van een beroep afhangen.", icon: "users" },
  { id: "client", label: "Cliënt of patiënt", description: "Behandeling, dossier, toestemming, privacy en klachten.", icon: "heart" },
  { id: "psycholoog", label: "Psycholoog", description: "Beroepsgeheim, professionele grenzen, veiligheid en tuchtrecht.", icon: "brain" },
  { id: "zorgmedewerker", label: "Zorgmedewerker", description: "Veilig werken, bekwaamheid, beroepsgeheim en verantwoordelijkheid.", icon: "stethoscope" },
  { id: "politieagent", label: "Politieagent", description: "Politietaak, bevoegdheden, grenzen en arbeidsveiligheid.", icon: "badge" },
  { id: "werknemer", label: "Werknemer", description: "Contract, loon, vakantie, veiligheid en gelijke behandeling.", icon: "briefcase" },
  { id: "huurder", label: "Huurder", description: "Huurcontract, onderhoud, servicekosten en huurbescherming.", icon: "home" },
  { id: "ouder", label: "Ouder of voogd", description: "Beslissen, informatie en vertegenwoordiging van een kind.", icon: "family" },
];

const equalTreatmentSource =
  "https://www.mensenrechten.nl/mensenrechten-voor-jou/discriminatie-en-gelijke-behandeling/wat-zegt-de-wet-over-discriminatie-en-gelijke-behandeling";
const patientRightsSource =
  "https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/rechten-van-patient-en-privacy/rechten-bij-een-medische-behandeling/rechten-en-plichten-bij-medische-behandeling";
const safeWorkSource =
  "https://www.arboportaal.nl/onderwerpen/rechten-plichten-werkenden/algemene-rechten--plichten-van-werkenden";

export const publicRules: PublicRule[] = [
  {
    id: "gelijke-behandeling",
    roles: ["iedereen"],
    topic: "Algemeen",
    type: "recht",
    title: "Gelijke behandeling",
    summary: "Iedereen in Nederland moet in gelijke gevallen gelijk worden behandeld.",
    appliesWhen: "Bij contact met overheid, werk, onderwijs en veel vormen van dienstverlening.",
    boundary: "Niet ieder verschil is discriminatie. Het verschil moet samenhangen met een beschermde grond en mag niet wettelijk gerechtvaardigd zijn.",
    sourceTitle: "College voor de Rechten van de Mens",
    sourceUrl: equalTreatmentSource,
  },
  {
    id: "vrijheid-meningsuiting",
    roles: ["iedereen"],
    topic: "Algemeen",
    type: "recht",
    title: "Vrijheid van meningsuiting",
    summary: "Je mag informatie en ideeën ontvangen, delen en bekritiseren, ook wanneer een mening schuurt.",
    appliesWhen: "Mondeling, schriftelijk, tijdens demonstraties en online.",
    boundary: "Bedreiging, smaad, opruiing en aanzetten tot haat, geweld of discriminatie kunnen strafbaar zijn.",
    sourceTitle: "Rijksoverheid — vrijheid van meningsuiting",
    sourceUrl: "https://www.rijksoverheid.nl/themas/overheid-en-democratie/media-en-publieke-omroep/persvrijheid-bewaken",
  },
  {
    id: "privacy",
    roles: ["iedereen"],
    topic: "Algemeen",
    type: "recht",
    title: "Privacy en bescherming van gegevens",
    summary: "Persoonsgegevens mogen niet zonder doel, grondslag en passende bescherming worden gebruikt.",
    appliesWhen: "Wanneer een organisatie gegevens over jou verzamelt, bewaart, gebruikt of deelt.",
    boundary: "Een organisatie kan gegevens soms zonder toestemming verwerken als daarvoor een andere geldige wettelijke grondslag bestaat.",
    sourceTitle: "Autoriteit Persoonsgegevens — basis AVG",
    sourceUrl: "https://www.autoriteitpersoonsgegevens.nl/themas/basis-avg/avg-algemeen",
  },
  {
    id: "patient-informatie-keuze",
    roles: ["client"],
    topic: "Zorg",
    type: "recht",
    title: "Informatie, overleg en zelf beslissen",
    summary: "Je hebt recht op begrijpelijke informatie, overleg en de mogelijkheid een behandeling te weigeren.",
    appliesWhen: "Bij een medische behandeling of behandelvoorstel.",
    boundary: "Leeftijd, vertegenwoordiging, wilsbekwaamheid en verplichte zorg kunnen de beslisroute veranderen.",
    sourceTitle: "Rijksoverheid — rechten bij behandeling",
    sourceUrl: patientRightsSource,
  },
  {
    id: "patient-dossier",
    roles: ["client"],
    topic: "Zorg",
    type: "recht",
    title: "Inzage en kopie van je dossier",
    summary: "Je mag je medisch dossier inzien, een kopie vragen en feitelijke fouten laten aanpassen.",
    appliesWhen: "Voor medische gegevens die over jouzelf zijn vastgelegd.",
    boundary: "Informatie die de privacy van een ander schaadt kan worden afgeschermd. De zorgverlener moet dit kunnen uitleggen.",
    sourceTitle: "Rijksoverheid — rechten bij behandeling",
    sourceUrl: patientRightsSource,
  },
  {
    id: "patient-klacht",
    roles: ["client"],
    topic: "Zorg",
    type: "recht",
    title: "Klacht en klachtenfunctionaris",
    summary: "Je kunt een klacht bespreken en gratis ondersteuning vragen van de klachtenfunctionaris van de zorgaanbieder.",
    appliesWhen: "Als je ontevreden bent over zorg, informatie, bejegening of de afhandeling van een probleem.",
    boundary: "De juiste vervolgroute verschilt per zorgvorm en kan via een geschilleninstantie of het tuchtrecht lopen.",
    sourceTitle: "Rijksoverheid — klachten over zorg",
    sourceUrl: "https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/kwaliteit-van-de-zorg/wet-kwaliteit-klachten-en-geschillen-zorg",
  },
  {
    id: "beroepsgeheim-zorg",
    roles: ["psycholoog", "zorgmedewerker"],
    topic: "Zorg",
    type: "plicht",
    title: "Beroepsgeheim en vertrouwelijkheid",
    summary: "Informatie over een cliënt hoort vertrouwelijk te blijven en mag niet zomaar worden gedeeld.",
    appliesWhen: "Bij informatie die je door je behandel- of zorgrelatie over een cliënt kent.",
    boundary: "Een uitzondering vereist een concrete grond en zorgvuldige afweging. Alleen algemene zorgen noemen is niet genoeg.",
    sourceTitle: "Tuchtcolleges — beroepsgeheim in de ggz",
    sourceUrl: "https://www.tuchtcollege-gezondheidszorg.nl/actueel/nieuws/2026/07/24/vier-van-de-zes-klachten-over-schending-beroepsgeheim-in-ggz-instelling-gegrond",
  },
  {
    id: "veilig-werken-zorg",
    roles: ["psycholoog", "zorgmedewerker", "politieagent", "werknemer"],
    topic: "Werk",
    type: "recht",
    title: "Veilige en gezonde werkplek",
    summary: "Je werkgever moet maatregelen nemen tegen onveilig werk, agressie, geweld en andere arbeidsrisico’s.",
    appliesWhen: "Tijdens je werk, ook bij contact met cliënten, patiënten of burgers.",
    boundary: "Je hebt ook een eigen verantwoordelijkheid om instructies en beschermingsmaatregelen te gebruiken en risico’s te melden.",
    sourceTitle: "Arboportaal — rechten en plichten werkenden",
    sourceUrl: safeWorkSource,
  },
  {
    id: "psycholoog-titel-tucht",
    roles: ["psycholoog"],
    topic: "Zorg",
    type: "grens",
    title: "Titel, registratie en tuchtrecht",
    summary: "Niet iedere psycholoog heeft dezelfde wettelijke registratie of valt onder dezelfde tuchtrechtelijke route.",
    appliesWhen: "Onder meer bij de beschermde titel gezondheidszorgpsycholoog en andere BIG-geregistreerde beroepen.",
    boundary: "Controleer altijd de precieze beroepstitel en registratie voordat je bevoegdheden of een klachtprocedure bepaalt.",
    sourceTitle: "BIG-register — zorgberoepen en registratie",
    sourceUrl: "https://www.bigregister.nl/over-het-big-register/voor-zorgconsumenten",
  },
  {
    id: "zorg-tucht-verweer",
    roles: ["psycholoog", "zorgmedewerker"],
    topic: "Zorg",
    type: "recht",
    title: "Verweer voeren bij een tuchtklacht",
    summary: "Een beklaagde BIG-zorgverlener ontvangt de klacht en kan zelf of met ondersteuning schriftelijk verweer voeren.",
    appliesWhen: "Wanneer tegen jou een klacht is ingediend bij een Regionaal Tuchtcollege.",
    boundary: "Deze procedure geldt alleen voor zorgverleners en handelingen die onder het wettelijk tuchtrecht vallen.",
    sourceTitle: "Tuchtcolleges — ik ben beklaagde",
    sourceUrl: "https://www.tuchtcollege-gezondheidszorg.nl/ik-ben-beklaagde",
  },
  {
    id: "zorg-bevoegd-bekwaam",
    roles: ["zorgmedewerker"],
    topic: "Zorg",
    type: "grens",
    title: "Bevoegd én bekwaam handelen",
    summary: "Voor voorbehouden handelingen zijn bevoegdheid, bekwaamheid en zo nodig opdracht, toezicht en tussenkomst nodig.",
    appliesWhen: "Wanneer je een voorbehouden medische handeling uitvoert of laat uitvoeren.",
    boundary: "Een functie of opdracht alleen maakt iemand niet automatisch bekwaam. Handel niet wanneer de noodzakelijke kennis of vaardigheid ontbreekt.",
    sourceTitle: "BIG-register — bevoegd en bekwaam",
    sourceUrl: "https://www.bigregister.nl/herregistratie/vragen-en-antwoorden",
  },
  {
    id: "politie-taak",
    roles: ["politieagent"],
    topic: "Veiligheid",
    type: "plicht",
    title: "Beschermen, begrenzen en hulp verlenen",
    summary: "De politie handhaaft de rechtsorde en verleent hulp aan mensen die deze nodig hebben.",
    appliesWhen: "Binnen de wettelijke politietaak en onder gezag van de bevoegde autoriteit.",
    boundary: "De brede politietaak is geen onbeperkte bevoegdheid en garandeert niet in iedere situatie een bepaalde uitkomst.",
    sourceTitle: "Politie — kerntaken",
    sourceUrl: "https://www.politie.nl/informatie/kerntaken-politie.html",
  },
  {
    id: "politie-bevoegdheden",
    roles: ["politieagent"],
    topic: "Veiligheid",
    type: "bevoegdheid",
    title: "Wettelijke politiebevoegdheden",
    summary: "Agenten kunnen onder voorwaarden onder meer identiteit controleren, staandehouden, aanhouden en geweld gebruiken.",
    appliesWhen: "Alleen wanneer een specifieke wettelijke bevoegdheid op de concrete situatie van toepassing is.",
    boundary: "Noodzaak, proportionaliteit, subsidiariteit, instructies en verslaglegging begrenzen het gebruik van bevoegdheden.",
    sourceTitle: "Politie — bevoegdheden",
    sourceUrl: "https://www.politie.nl/informatie/bevoegdheden-van-de-politie.html",
  },
  {
    id: "arbeidscontract-basis",
    roles: ["werknemer", "psycholoog", "zorgmedewerker", "politieagent"],
    topic: "Werk",
    type: "recht",
    title: "Contract, loon, werktijd en vakantie",
    summary: "Werkenden worden beschermd door regels over onder meer loon, vakantie, werktijden, rust en ontslag.",
    appliesWhen: "Wanneer je werkt op basis van een arbeidsovereenkomst; cao-regels kunnen aanvullend gelden.",
    boundary: "De precieze rechten hangen af van contractvorm, cao, sector en omstandigheden zoals ziekte of verlof.",
    sourceTitle: "Rijksoverheid — regels arbeidsovereenkomst",
    sourceUrl: "https://www.rijksoverheid.nl/vraag-en-antwoord/arbeidsovereenkomst-en-cao/waaraan-moet-mijn-werkgever-zich-houden-bij-een-arbeidsovereenkomst",
  },
  {
    id: "huurder-contract",
    roles: ["huurder"],
    topic: "Wonen",
    type: "recht",
    title: "Schriftelijk huurcontract en goed verhuurderschap",
    summary: "Een verhuurder moet een schriftelijke huurovereenkomst opstellen en informeren over rechten en plichten.",
    appliesWhen: "Bij verhuur van woonruimte in Nederland.",
    boundary: "Welke huurprijs- en procedurebescherming geldt, hangt onder meer af van het soort woning en contract.",
    sourceTitle: "Rijksoverheid — rechten en plichten huurder",
    sourceUrl: "https://www.rijksoverheid.nl/vraag-en-antwoord/woning-huren/welke-rechten-en-plichten-heb-ik-als-huurder",
  },
  {
    id: "huurder-onderhoud",
    roles: ["huurder"],
    topic: "Wonen",
    type: "recht",
    title: "Groot onderhoud door verhuurder",
    summary: "Groot onderhoud is in beginsel voor de verhuurder; klein dagelijks onderhoud meestal voor de huurder.",
    appliesWhen: "Bij gebreken of noodzakelijk onderhoud aan een huurwoning.",
    boundary: "Meld gebreken schriftelijk en volg de juiste route voordat je kosten inhoudt of zelf werkzaamheden laat uitvoeren.",
    sourceTitle: "Rijksoverheid — onderhoud huurwoning",
    sourceUrl: "https://www.rijksoverheid.nl/vraag-en-antwoord/woning-huren/welke-kosten-zijn-voor-de-huurder-en-welke-voor-de-verhuurder",
  },
  {
    id: "huurder-opzegging",
    roles: ["huurder"],
    topic: "Wonen",
    type: "recht",
    title: "Bescherming tegen zomaar opzeggen",
    summary: "Een verhuurder mag de huur niet zonder geldige reden beëindigen.",
    appliesWhen: "Wanneer de verhuurder een woonhuurovereenkomst wil opzeggen.",
    boundary: "Bij bijvoorbeeld ernstige huurachterstand of ander tekortschieten kan beëindiging wel mogelijk zijn; bezwaar en rechterlijke toetsing kunnen een rol spelen.",
    sourceTitle: "Rijksoverheid — verhuurder zegt huur op",
    sourceUrl: "https://www.rijksoverheid.nl/vraag-en-antwoord/woning-huren/verhuurder-zegt-huur-op-woning",
  },
  {
    id: "ouder-medisch-dossier-kind",
    roles: ["ouder"],
    topic: "Kinderen",
    type: "recht",
    title: "Medisch dossier van een minderjarig kind",
    summary: "Inzage en toestemming veranderen met de leeftijd van het kind.",
    appliesWhen: "Bij medische behandeling van een kind jonger dan 18 jaar.",
    boundary: "Tot 12 jaar beslissen ouders; tussen 12 en 16 meestal samen; vanaf 16 beslist het kind in beginsel zelf en is ouderlijke inzage niet automatisch toegestaan.",
    sourceTitle: "Rijksoverheid — dossier minderjarig kind",
    sourceUrl: "https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/rechten-van-patient-en-privacy/jongeren-en-het-medisch-dossier/medisch-dossier-minderjarige-kind-inzien",
  },
];

export const publicTopics: Array<"Alles" | PublicTopic> = [
  "Alles",
  "Algemeen",
  "Zorg",
  "Werk",
  "Wonen",
  "Veiligheid",
  "Kinderen",
];
