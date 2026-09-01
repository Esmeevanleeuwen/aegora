import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { PublicRule } from "@/lib/public-rights-data";
import { getPublicRightsData } from "@/lib/public-rights-repository";
import type { ApplicabilityStatus, RightsAnswer } from "@/lib/types";

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

const stopWords = new Set([
  "de", "een", "het", "dat", "dit", "die", "wat", "waar", "wie", "hoe", "mijn", "zijn",
  "haar", "hun", "voor", "van", "met", "naar", "maar", "niet", "wel", "kan", "mag", "moet",
  "wordt", "heeft", "hebben", "over", "door", "zonder", "bij", "als", "ook", "nog", "er",
]);

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function scoreRight(question: string, right: PublicRule) {
  const tokens = normalize(question)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));
  const searchable = normalize([
    right.title,
    right.summary,
    right.appliesWhen,
    right.boundary,
    right.practicalNote,
    right.topic,
  ].join(" "));

  return tokens.reduce((score, token) => score + (searchable.includes(token) ? 1 : 0), 0);
}

function buildDemoAnswer(
  question: string,
  context: z.infer<typeof RequestSchema>["context"],
  rules: PublicRule[],
  roles: Array<{ id: string; label: string }>,
  situations: Array<{ slug: string; label: string }>,
): RightsAnswer {
  const contextRole = roles.find((role) =>
    normalize(context.situation).includes(normalize(role.label)),
  )?.id;
  const contextSituations = context.tags
    .map((tag) => situations.find((item) => item.slug === tag || item.label === tag)?.slug)
    .filter((value): value is string => Boolean(value));

  const candidates = rules.filter((right) => {
    const roleMatches = !contextRole
      || right.roles.includes(contextRole)
      || right.roles.includes("iedereen");
    const situationMatches = contextSituations.length === 0
      || contextSituations.some((slug) => right.situations.includes(slug));
    return roleMatches && situationMatches;
  });
  const ranked = candidates
    .map((right) => ({ right, score: scoreRight(question, right) }))
    .sort((a, b) => b.score - a.score);
  const directMatches = ranked.filter(({ score }) => score > 0).slice(0, 3).map(({ right }) => right);
  const relevant = directMatches.length > 0
    ? directMatches
    : contextRole || contextSituations.length > 0
      ? ranked.slice(0, 2).map(({ right }) => right)
      : [];
  const needsMoreContext = relevant.length === 0;
  const status: ApplicabilityStatus = needsMoreContext ? "meer-context-nodig" : "waarschijnlijk";

  return {
    summary: needsMoreContext
      ? "Er is meer informatie nodig om de juiste rechtenroute te kiezen."
      : "Er lijken algemene rechten relevant, maar de precieze toepassing hangt af van de feiten.",
    status,
    explanation:
      "De uitkomst gebruikt dezelfde gepubliceerde rechtenkaarten als de openbare bibliotheek. Formele regels, praktische grenzen en ontbrekende context blijven apart zichtbaar.",
    assumptions: [
      context.situation ? `Rol of situatie: ${context.situation}` : "De situatie speelt in Nederland.",
      ...(context.ageGroup ? [`Leeftijdsgroep: ${context.ageGroup}`] : []),
      ...(contextSituations.length ? [`Gekozen context: ${contextSituations.join(", ")}`] : []),
      "Er is nog geen persoonlijk document of besluit gecontroleerd.",
    ],
    rights: relevant.map(({ id, title }) => ({ id, title })),
    nextSteps: relevant.length > 0
      ? relevant.map((right) => right.nextStep).slice(0, 3)
      : ["Beschrijf wie erbij betrokken is, wat er gebeurde en of je een brief, besluit, contract of termijn hebt."],
    sources: relevant.map(({ sourceTitle, sourceUrl }) => ({
      title: sourceTitle,
      url: sourceUrl,
    })),
    warning:
      "Dit is algemene informatie en geen definitief juridisch oordeel. Bij direct gevaar, dwang of een lopende termijn is menselijke hulp nodig.",
    generatedBy: "demo",
  };
}

export async function POST(request: Request) {
  try {
    const body = RequestSchema.parse(await request.json());
    const catalog = await getPublicRightsData();
    const fallback = buildDemoAnswer(
      body.question,
      body.context,
      catalog.rules,
      catalog.roles,
      catalog.situations,
    );

    if (!process.env.AI_GATEWAY_API_KEY) {
      return NextResponse.json(fallback);
    }

    const sourceContext = catalog.rules.map((right) => ({
      id: right.id,
      title: right.title,
      summary: right.summary,
      appliesWhen: right.appliesWhen,
      boundary: right.boundary,
      practicalNote: right.practicalNote,
      nextStep: right.nextStep,
      situations: right.situations,
      sourceTitle: right.sourceTitle,
      sourceUrl: right.sourceUrl,
      sourceCheckedAt: right.sourceCheckedAt,
    }));

    const { output } = await generateText({
      model: "openai/gpt-5.6-sol",
      output: Output.object({ schema: AnswerSchema }),
      system: [
        "Je bent de gecontroleerde formuleringlaag van RECHT NU.",
        "Schrijf helder Nederlands en spreek de gebruiker alleen aan volgens de opgegeven aanspreekvorm.",
        "Gebruik uitsluitend rechten, grenzen, vervolgstappen en bron-URL's uit de meegegeven gepubliceerde catalogus.",
        "Maak steeds onderscheid tussen het formele recht en de praktische uitvoering.",
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
      { error: "Het antwoord kon niet veilig worden opgebouwd. Probeer het opnieuw." },
      { status: 500 },
    );
  }
}
