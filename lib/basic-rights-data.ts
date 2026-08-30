export type BasicRightId =
  | "religie"
  | "geslacht"
  | "ras"
  | "seksuele-gerichtheid"
  | "handicap"
  | "politieke-overtuiging"
  | "overige-gronden";

export type BasicRight = {
  id: BasicRightId;
  title: string;
  shortLabel: string;
  summary: string;
  protectedRights: string[];
  commonAreas: string[];
  boundary: string;
  sourceTitle: string;
  sourceUrl: string;
};

const collegeSource =
  "https://www.mensenrechten.nl/mensenrechten-voor-jou/discriminatie-en-gelijke-behandeling/wat-zegt-de-wet-over-discriminatie-en-gelijke-behandeling";

export const basicRights: BasicRight[] = [
  {
    id: "religie",
    title: "Religie en levensovertuiging",
    shortLabel: "Religie",
    summary: "Je mag een geloof of levensovertuiging hebben, veranderen, uiten of juist geen geloof hebben.",
    protectedRights: [
      "Gelijk behandeld worden ongeacht je geloof of levensovertuiging.",
      "Je overtuiging alleen of samen met anderen belijden.",
      "Niet gedwongen worden om een bepaalde overtuiging aan te nemen.",
    ],
    commonAreas: ["Werk", "Onderwijs", "Goederen en diensten", "Overheid"],
    boundary:
      "Een overtuiging geeft geen vrijstelling van iedere algemene wet. Beperkingen moeten wel een wettelijke basis en geldige reden hebben.",
    sourceTitle: "Grondwet — artikel 6",
    sourceUrl: "https://wetten.overheid.nl/BWBR0001840/#Hoofdstuk1_Artikel6",
  },
  {
    id: "geslacht",
    title: "Geslacht en gender",
    shortLabel: "Geslacht & gender",
    summary:
      "Je mag niet ongelijk worden behandeld vanwege geslacht. Hieronder vallen ook zwangerschap, genderidentiteit, genderexpressie en geslachtskenmerken.",
    protectedRights: [
      "Gelijke kansen en behandeling op het werk en in het onderwijs.",
      "Bescherming tegen discriminatie wegens zwangerschap of moederschap.",
      "Bescherming van transgender en intersekse personen binnen de gelijkebehandelingswetgeving.",
    ],
    commonAreas: ["Werk", "Onderwijs", "Zorg", "Goederen en diensten"],
    boundary:
      "Niet ieder verschil is verboden. Een wettelijke uitzondering moet specifiek, noodzakelijk en passend zijn.",
    sourceTitle: "College voor de Rechten van de Mens",
    sourceUrl: collegeSource,
  },
  {
    id: "ras",
    title: "Ras, huidskleur en afkomst",
    shortLabel: "Ras & afkomst",
    summary:
      "Iedereen is beschermd tegen onderscheid vanwege huidskleur, afkomst of etnische achtergrond. Dat geldt voor iedere huidskleur.",
    protectedRights: [
      "Gelijke toegang tot werk, onderwijs, wonen en dienstverlening.",
      "Niet worden afgewezen of benadeeld vanwege je afkomst of huidskleur.",
      "Bescherming tegen openbare groepsbelediging en aanzetten tot haat of discriminatie.",
    ],
    commonAreas: ["Werk", "Wonen", "Onderwijs", "Horeca en winkels"],
    boundary:
      "Kritiek op beleid of ideeën is niet automatisch discriminatie. De woorden, context en eventuele oproep tot uitsluiting zijn bepalend.",
    sourceTitle: "College voor de Rechten van de Mens",
    sourceUrl: collegeSource,
  },
  {
    id: "seksuele-gerichtheid",
    title: "Seksuele gerichtheid",
    shortLabel: "Seksuele gerichtheid",
    summary:
      "Je mag niet anders worden behandeld omdat je bijvoorbeeld hetero, homo, lesbisch of biseksueel bent.",
    protectedRights: [
      "Gelijke behandeling bij werk, onderwijs en dienstverlening.",
      "Je relatie of gerichtheid niet hoeven verbergen om gelijk behandeld te worden.",
      "Bescherming tegen groepsbelediging en aanzetten tot haat of discriminatie.",
    ],
    commonAreas: ["Werk", "Onderwijs", "Wonen", "Goederen en diensten"],
    boundary:
      "Een ander mag een mening of geloofsovertuiging hebben, maar mag je daardoor niet verboden uitsluiten of ongelijk behandelen.",
    sourceTitle: "Artikel 1 van de Grondwet",
    sourceUrl: "https://www.rijksoverheid.nl/documenten/videos/2023/07/07/uitlegvideo-artikel-1-grondwet",
  },
  {
    id: "handicap",
    title: "Handicap of chronische ziekte",
    shortLabel: "Handicap",
    summary:
      "Je hebt recht op gelijke behandeling en in veel situaties op een doeltreffende aanpassing die deelname mogelijk maakt.",
    protectedRights: [
      "Geen uitsluiting alleen vanwege een handicap of chronische ziekte.",
      "Een noodzakelijke en geschikte aanpassing kunnen vragen.",
      "Toegankelijke deelname aan onder meer werk, onderwijs en diensten.",
    ],
    commonAreas: ["Werk", "Onderwijs", "Wonen", "Openbaar vervoer", "Diensten"],
    boundary:
      "Een aanpassing kan worden geweigerd wanneer zij voor de andere partij aantoonbaar onevenredig belastend is.",
    sourceTitle: "College voor de Rechten van de Mens",
    sourceUrl: collegeSource,
  },
  {
    id: "politieke-overtuiging",
    title: "Politieke overtuiging",
    shortLabel: "Politiek",
    summary:
      "Je politieke overtuiging is beschermd. Je mag een mening vormen, uiten en deelnemen aan de democratie.",
    protectedRights: [
      "Gelijk behandeld worden ongeacht je politieke overtuiging.",
      "Je mening uiten, informatie ontvangen en je organiseren.",
      "Stemmen en deelnemen aan politieke organisaties binnen de wet.",
    ],
    commonAreas: ["Werk", "Overheid", "Verenigingen", "Openbaar debat"],
    boundary:
      "Vrijheid van meningsuiting beschermt niet tegen regels over bedreiging, smaad, opruiing of aanzetten tot haat, geweld en discriminatie.",
    sourceTitle: "Rijksoverheid — vrijheid van meningsuiting",
    sourceUrl:
      "https://www.rijksoverheid.nl/themas/overheid-en-democratie/media-en-publieke-omroep/persvrijheid-bewaken",
  },
  {
    id: "overige-gronden",
    title: "Andere beschermde kenmerken",
    shortLabel: "Meer gronden",
    summary:
      "De wet beschermt ook onder meer nationaliteit, leeftijd, burgerlijke staat, arbeidsduur en het soort arbeidscontract.",
    protectedRights: [
      "Niet zonder geldige reden anders behandeld worden vanwege een beschermd kenmerk.",
      "Een klacht kunnen indienen en om uitleg of een oordeel kunnen vragen.",
      "Bescherming tegen benadeling omdat je een discriminatieklacht hebt ingediend.",
    ],
    commonAreas: ["Vooral werk", "Onderwijs", "Goederen en diensten"],
    boundary:
      "Niet iedere grond geldt op ieder terrein. Leeftijd is bijvoorbeeld vooral wettelijk geregeld bij werk en beroepsonderwijs.",
    sourceTitle: "College — wat is discriminatie?",
    sourceUrl:
      "https://www.mensenrechten.nl/mensenrechten-voor-jou/discriminatie-en-gelijke-behandeling/wat-is-discriminatie",
  },
];
