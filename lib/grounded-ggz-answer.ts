import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";
import type { PublicRule } from "./public-rights-data";
import {
  legalRouteLabels,
  type LegalRouteId,
  type LegalRouteQuestion,
  type LegalSourceChunk,
} from "./legal-source-data";
import type { RightsAnswer } from "./types";

type GroundedContext = {
  situation: string;
  ageGroup: string;
  pronouns: string;
  tags: string[];
  followUpAnswers: Record<string, string>;
};

const GeneratedAnswerSchema = z.object({
  summary: z.string(),
  status: z.enum(["waarschijnlijk", "uitzondering-mogelijk", "meer-context-nodig", "menselijke-controle"]),
  explanation: z.string(),
  assumptions: z.array(z.string()).max(6),
  legalTracks: z.array(z.object({
    routeId: z.string(),
    conclusion: z.string(),
    explanation: z.string(),
    sourceChunkKeys: z.array(z.string()).max(4),
  })).max(4),
  nextSteps: z.array(z.string()).max(5),
  warning: z.string().nullable(),
});

const rightIdsByRoute: Record<LegalRouteId, string[]> = {
  "ggz-confidentiality": ["beroepsgeheim-zorg", "privacy"],
  "ggz-compulsory-care": ["wvggz-verplichte-zorg", "patient-informatie-keuze"],
  "ggz-crisis-procedure": ["wvggz-crisismaatregel"],
  "ggz-complaint-support": ["wvggz-klacht-pvp", "patient-klacht"],
};

function answeredInQuestion(questionId: string, question: string) {
  const value = question.toLocaleLowerCase("nl-NL");
  if (questionId === "ggz-formal-basis") return value.includes("crisismaatregel") || value.includes("zorgmachtiging");
  if (questionId === "ggz-medication-status") return value.includes("tegen mijn wil toegediend") || value.includes("injectie tegen mijn wil");
  if (questionId === "ggz-written-decision") return value.includes("beschikking ontvangen") || value.includes("schriftelijke beslissing");
  return false;
}

function getPendingQuestions(
  questions: LegalRouteQuestion[],
  question: string,
  answers: Record<string, string>,
) {
  return questions
    .filter((item) => !answers[item.id] && !answeredInQuestion(item.id, question))
    .sort((a, b) => a.position - b.position)
    .map(({ id, question: text, whyItMatters, options }) => ({
      id,
      question: text,
      whyItMatters,
      options,
    }));
}

function chunksForRoute(chunks: LegalSourceChunk[], routeId: LegalRouteId) {
  return chunks.filter((chunk) => chunk.routeId === routeId);
}

function fallbackConclusion(routeId: LegalRouteId, answers: Record<string, string>) {
  if (routeId === "ggz-confidentiality") {
    return "Contact met de crisisdienst zonder toestemming kan soms toegestaan zijn, maar alleen op een concrete grond en met zo weinig mogelijk informatie.";
  }
  if (routeId === "ggz-compulsory-care") {
    const basis = answers["ggz-formal-basis"];
    if (basis === "Alleen een behandelafspraak of waarschuwing") {
      return "Je noemt geen crisismaatregel of zorgmachtiging. Alleen een behandelafspraak of waarschuwing maakt medicatie niet automatisch juridisch verplicht.";
    }
    return "Contact met de crisisdienst maakt medicatie niet automatisch verplicht; daarvoor moet duidelijk zijn welke formele Wvggz-maatregel geldt en welke zorg die toestaat.";
  }
  if (routeId === "ggz-crisis-procedure") {
    return "Een crisisdienst kan onderzoeken en adviseren, maar een crisismaatregel is een formeel besluit met een medische verklaring en rechtsbescherming.";
  }
  return "Bij verplichte zorg kun je gratis hulp vragen van een PVP en over bepaalde beslissingen klagen; een klacht stopt de zorg niet vanzelf.";
}

function buildFallbackTracks(routeIds: LegalRouteId[], chunks: LegalSourceChunk[], answers: Record<string, string>) {
  return routeIds.map((routeId) => {
    const routeChunks = chunksForRoute(chunks, routeId);
    return {
      id: routeId,
      title: legalRouteLabels[routeId],
      conclusion: fallbackConclusion(routeId, answers),
      explanation: routeChunks.map((chunk) => chunk.content).join(" "),
      sourceChunkKeys: routeChunks.map((chunk) => chunk.chunkKey).slice(0, 3),
    };
  });
}

function buildSources(tracks: NonNullable<RightsAnswer["legalTracks"]>, chunks: LegalSourceChunk[]) {
  const allowed = new Map(chunks.map((chunk) => [chunk.chunkKey, chunk]));
  const seen = new Set<string>();
  return tracks.flatMap((track) => track.sourceChunkKeys).flatMap((chunkKey) => {
    const chunk = allowed.get(chunkKey);
    if (!chunk || seen.has(chunkKey)) return [];
    seen.add(chunkKey);
    return [{
      title: chunk.sourceTitle,
      url: chunk.sourceUrl,
      locator: chunk.sourceLocator,
      chunkKey,
    }];
  });
}

function selectRights(routeIds: LegalRouteId[], rules: PublicRule[]) {
  const selectedIds = new Set(routeIds.flatMap((routeId) => rightIdsByRoute[routeId]));
  return rules
    .filter((right) => selectedIds.has(right.id))
    .map(({ id, title }) => ({ id, title }));
}

function buildFallbackAnswer(
  routeIds: LegalRouteId[],
  chunks: LegalSourceChunk[],
  pendingQuestions: ReturnType<typeof getPendingQuestions>,
  context: GroundedContext,
  rules: PublicRule[],
  sourceData: "supabase" | "local",
): RightsAnswer {
  const tracks = buildFallbackTracks(routeIds, chunks, context.followUpAnswers);
  return {
    summary: pendingQuestions.length > 0
      ? "Je vraag bevat twee verschillende juridische kwesties; enkele feiten bepalen wat precies geldt."
      : "De bronregels zijn toegepast op de aanvullende informatie die je hebt gegeven.",
    status: pendingQuestions.length > 0 ? "meer-context-nodig" : "waarschijnlijk",
    explanation: "RECHT NU beoordeelt het delen van informatie en de mogelijke verplichte medicatie apart. De uitkomst hieronder gebruikt alleen de getoonde, vooraf gecontroleerde bronpassages.",
    assumptions: [
      "De situatie speelt in Nederland.",
      ...(context.ageGroup ? [`Leeftijdsgroep: ${context.ageGroup}`] : []),
      "Het daadwerkelijke besluit, dossier en zorgplan zijn niet gecontroleerd.",
    ],
    rights: selectRights(routeIds, rules),
    legalTracks: tracks,
    clarifyingQuestions: pendingQuestions,
    nextSteps: [
      "Vraag schriftelijk welke informatie is gedeeld, met wie en op welke grond.",
      "Vraag of er een crisismaatregel of zorgmachtiging geldt en om een kopie van de beslissing.",
      "Vraag welke vorm van verplichte zorg precies is toegestaan en neem zo nodig contact op met een PVP.",
    ],
    sources: buildSources(tracks, chunks),
    sourceGrounded: true,
    sourceData,
    warning: "Dit is juridische informatie, geen medisch advies. Stop of verander medicatie niet op eigen initiatief. Bij direct gevaar: bel 112 of neem direct contact op met een zorgprofessional.",
    generatedBy: "demo",
  };
}

export async function buildGroundedGgzAnswer(input: {
  question: string;
  context: GroundedContext;
  routeIds: LegalRouteId[];
  chunks: LegalSourceChunk[];
  questions: LegalRouteQuestion[];
  rules: PublicRule[];
  sourceData: "supabase" | "local";
}): Promise<RightsAnswer> {
  const pendingQuestions = getPendingQuestions(input.questions, input.question, input.context.followUpAnswers);
  const fallback = buildFallbackAnswer(
    input.routeIds,
    input.chunks,
    pendingQuestions,
    input.context,
    input.rules,
    input.sourceData,
  );
  if (!process.env.AI_GATEWAY_API_KEY || input.chunks.length === 0) return fallback;

  try {
    const { output } = await generateText({
      model: "openai/gpt-5.6-sol",
      output: Output.object({ schema: GeneratedAnswerSchema }),
      system: [
        "Je bent de brongebonden juridische formuleringlaag van RECHT NU.",
        "Gebruik uitsluitend feiten en juridische regels uit allowedEvidence. Gebruik geen internet, trainingskennis of niet-getoonde rechtsregels.",
        "Behandel beroepsgeheim en verplichte zorg als afzonderlijke juridische sporen.",
        "Verwijs in ieder spoor alleen naar bestaande chunkKey-waarden uit allowedEvidence.",
        "Als een conclusie niet door een bronpassage wordt gedragen, formuleer haar niet.",
        "Maak duidelijk welk ontbrekend feit de uitkomst kan veranderen en geef geen definitief oordeel over documenten die niet zijn gezien.",
        "Geef nooit medisch advies en adviseer nooit om medicatie zelfstandig te stoppen of te veranderen.",
        "Schrijf rustig, concreet Nederlands. Gebruik maximaal vijf praktische vervolgstappen en verzin geen termijnen.",
      ].join("\n"),
      prompt: JSON.stringify({
        question: input.question,
        userContext: input.context,
        selectedRoutes: input.routeIds.map((id) => ({ id, label: legalRouteLabels[id] })),
        followUpAnswers: input.context.followUpAnswers,
        stillMissing: pendingQuestions,
        allowedEvidence: input.chunks.map((chunk) => ({
          chunkKey: chunk.chunkKey,
          routeId: chunk.routeId,
          heading: chunk.heading,
          locator: chunk.sourceLocator,
          content: chunk.content,
        })),
      }),
    });

    const allowedChunks = new Map(input.chunks.map((chunk) => [chunk.chunkKey, chunk]));
    const generatedByRoute = new Map(output.legalTracks.map((track) => [track.routeId, track]));
    const tracks = input.routeIds.map((routeId) => {
      const generated = generatedByRoute.get(routeId);
      const validKeys = generated?.sourceChunkKeys.filter((key) => allowedChunks.get(key)?.routeId === routeId) ?? [];
      const routeChunks = chunksForRoute(input.chunks, routeId);
      return {
        id: routeId,
        title: legalRouteLabels[routeId],
        conclusion: generated?.conclusion ?? fallbackConclusion(routeId, input.context.followUpAnswers),
        explanation: generated?.explanation ?? routeChunks.map((chunk) => chunk.content).join(" "),
        sourceChunkKeys: validKeys.length > 0 ? validKeys : routeChunks.map((chunk) => chunk.chunkKey).slice(0, 3),
      };
    });

    return {
      summary: output.summary,
      status: pendingQuestions.length > 0 ? "meer-context-nodig" : output.status,
      explanation: output.explanation,
      assumptions: output.assumptions,
      rights: selectRights(input.routeIds, input.rules),
      legalTracks: tracks,
      clarifyingQuestions: pendingQuestions,
      nextSteps: output.nextSteps,
      sources: buildSources(tracks, input.chunks),
      sourceGrounded: true,
      sourceData: input.sourceData,
      warning: output.warning ?? fallback.warning,
      generatedBy: "ai",
    };
  } catch (error) {
    console.error(
      "Brongebonden AI-antwoord viel terug op de gecontroleerde template.",
      error instanceof Error ? error.message : "Onbekende fout.",
    );
    return fallback;
  }
}
