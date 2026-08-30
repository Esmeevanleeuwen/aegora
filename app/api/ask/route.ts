import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rightsCatalog } from "@/lib/rights-data";
import type { ApplicabilityStatus, Domain, RightsAnswer, RightItem } from "@/lib/types";

export const runtime = "nodejs";

const RequestSchema = z.object({
  question: z.string().trim().min(10).max(2500),
  context: z.object({
    situation: z.string().max(120).optional().default(""),
    ageGroup: z.string().max(60).optional().default(""),
    pronouns: z.string().max(60).optional().default(""),
    tags: z.array(z.string().max(80)).max(10).optional().default([]),
  }),
});

const AnswerSchema = z.object({
  summary: z.string(),
  status: z.enum([
    "bevestigd",
    "waarschijnlijk",
    "uitzondering-mogelijk",
    "meer-context-nodig",
    "menselijke-controle",
  ]),
  explanation: z.string(),
  assumptions: z.array(z.string()).max(5),
  rights: z.array(z.object({ id: z.string(), title: z.string() })).max(4),
  nextSteps: z.array(z.string()).max(5),
  sources: z.array(z.object({ title: z.string(), url: z.string().url() })).max(4),
  warning: z.string().nullable(),
});

function scoreRight(question: string, right: RightItem) {
  const text = question.toLowerCase();
  const keywordGroups: Record<string, string[]> = {
    "duidelijke-informatie-en-keuze": [
      "toestemming",
      "behandeling",
      "weigeren",
      "informatie",
      "medicijn",
    ],
    "inzage-en-kopie-dossier": ["dossier", "inzage", "kopie", "logging", "bekeken"],
    "privacy-medische-gegevens": [
      "gedeeld",
      "delen",
      "ouders",
      "privacy",
      "geheim",
      "informatie",
    ],
    "klacht-en-geschil-zorg": [
      "klacht",
      "klagen",
      "geschil",
      "fout",
      "niet gehoord",
    ],
    "onderhoud-huurwoning": [
      "huur",
      "verhuurder",
      "woning",
      "schimmel",
      "gebrek",
      "onderhoud",
      "reparatie",
    ],
    "wettelijke-vakantie": [
      "werk",
      "werkgever",
      "vakantie",
      "verlof",
      "contract",
      "uren",
    ],
    slachtofferrechten: [
      "slachtoffer",
      "aangifte",
      "politie",
      "bedreigd",
      "geweld",
      "bescherming",
      "strafbaar",
    ],
    "dossier-minderjarig-kind": [
      "kind",
      "minderjarig",
      "ouder",
      "voogd",
      "gezag",
      "jeugdhulp",
    ],
    "bezwaar-overheidsbesluit": [
      "overheid",
      "gemeente",
      "besluit",
      "bezwaar",
      "aanvraag",
      "uitkering",
      "vergunning",
    ],
  };

  return (keywordGroups[right.id] ?? []).reduce(
    (score, keyword) => score + (text.includes(keyword) ? 1 : 0),
    0,
  );
}

function demoAnswer(
  question: string,
  context: z.infer<typeof RequestSchema>["context"],
): RightsAnswer {
  const ranked = rightsCatalog
    .map((right) => ({ right, score: scoreRight(question, right) }))
    .sort((a, b) => b.score - a.score);

  const selected = ranked.filter(({ score }) => score > 0).slice(0, 3).map(({ right }) => right);
  const situationDomains: Array<[RegExp, Domain]> = [
    [/cliënt|patiënt|zorg/i, "Zorg & cliënt"],
    [/werknemer|werkzoekende|professional|organisatie/i, "Werk"],
    [/huurder|woningzoekende/i, "Wonen"],
    [/ouder|voogd|familie/i, "Familie"],
    [/slachtoffer|betrokkene/i, "Veiligheid"],
    [/overheid|politie/i, "Overheid"],
  ];
  const situationDomain = situationDomains.find(([pattern]) => pattern.test(context.situation))?.[1];
  const contextMatches = situationDomain
    ? rightsCatalog.filter((right) => right.domain === situationDomain).slice(0, 2)
    : [];
  const relevant = selected.length > 0 ? selected : contextMatches;
  const missingAge = relevant.some((right) => right.id === "dossier-minderjarig-kind") && !context.ageGroup;
  const needsMoreContext = relevant.length === 0 || missingAge;
  const status: ApplicabilityStatus = needsMoreContext ? "meer-context-nodig" : "waarschijnlijk";

  return {
    summary: missingAge
      ? "Je leeftijd kan hier bepalen welke regels precies gelden."
      : relevant.length > 0
        ? "Er lijken één of meer algemene rechten relevant, maar de precieze toepassing hangt af van je situatie."
        : "Er is meer informatie nodig om het juiste rechtsgebied te kiezen.",
    status,
    explanation:
      "De uitkomst is opgebouwd uit gepubliceerde rechtenkaarten. Het platform laat een regel pas als definitief zien wanneer de noodzakelijke context en een actuele bron beschikbaar zijn.",
    assumptions: [
      context.situation ? `Rol of situatie: ${context.situation}` : "De situatie speelt in Nederland.",
      ...(context.ageGroup ? [`Leeftijdsgroep: ${context.ageGroup}`] : []),
      "Er is nog geen dossier of besluit gecontroleerd.",
    ],
    rights: relevant.map(({ id, title }) => ({ id, title })),
    nextSteps: relevant.length > 0
      ? relevant.map((right) => right.nextStep).slice(0, 3)
      : ["Beschrijf wie erbij betrokken is en of het gaat om zorg, wonen, werk, veiligheid, familie of de overheid."],
    sources: relevant.map(({ sourceTitle, sourceUrl }) => ({
      title: sourceTitle,
      url: sourceUrl,
    })),
    warning:
      "Dit is algemene informatie en geen definitief juridisch oordeel. Bij dwang, acuut gevaar of een lopende termijn is menselijke hulp nodig.",
    generatedBy: "demo",
  };
}

export async function POST(request: Request) {
  try {
    const body = RequestSchema.parse(await request.json());
    const fallback = demoAnswer(body.question, body.context);

    if (!process.env.AI_GATEWAY_API_KEY) {
      return NextResponse.json(fallback);
    }

    const sourceContext = rightsCatalog.map((right) => ({
      id: right.id,
      title: right.title,
      summary: right.summary,
      conditions: right.conditions,
      exceptions: right.exceptions,
      nextStep: right.nextStep,
      sourceTitle: right.sourceTitle,
      sourceUrl: right.sourceUrl,
    }));

    const { output } = await generateText({
      model: "openai/gpt-5.6-sol",
      output: Output.object({ schema: AnswerSchema }),
      system: [
        "Je bent de gecontroleerde formuleringlaag van AEGORA.",
        "Schrijf helder Nederlands en spreek de gebruiker alleen aan volgens de opgegeven aanspreekvorm.",
        "Gebruik uitsluitend rechten, uitzonderingen en bron-URL's uit de meegegeven catalogus.",
        "Presenteer geen definitief juridisch oordeel wanneer feiten ontbreken.",
        "Zet aannames expliciet in assumptions en kies meer-context-nodig bij een materieel ontbrekend feit.",
        "Noem ras, genderidentiteit of juridisch geslacht alleen wanneer dit aantoonbaar relevant is voor de vraag.",
        "Geef maximaal drie concrete vervolgstappen en verzin nooit een termijn.",
      ].join("\n"),
      prompt: JSON.stringify({
        question: body.question,
        userContext: body.context,
        allowedRightsCatalog: sourceContext,
      }),
    });

    return NextResponse.json({ ...output, generatedBy: "ai" } satisfies RightsAnswer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "De vraag of context is niet volledig of te lang." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Het antwoord kon niet veilig worden opgebouwd. Probeer het opnieuw.",
      },
      { status: 500 },
    );
  }
}
