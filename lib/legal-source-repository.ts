import "server-only";

import { z } from "zod";
import {
  localLegalRouteQuestions,
  localLegalSourceChunks,
  type LegalRouteId,
  type LegalRouteQuestion,
  type LegalSourceChunk,
} from "./legal-source-data";

const chunkRowsSchema = z.array(z.object({
  chunk_key: z.string().min(1),
  route_id: z.string().min(1),
  route_label: z.string().min(1),
  heading: z.string().min(1),
  content: z.string().min(1),
  source_locator: z.string().min(1),
  source_title: z.string().min(1),
  source_url: z.string().url(),
  source_publisher: z.string().min(1),
  source_checked_at: z.string(),
  relevance: z.number(),
}));

const questionRowsSchema = z.array(z.object({
  id: z.string().min(1),
  route_id: z.string().min(1),
  question: z.string().min(1),
  why_it_matters: z.string().min(1),
  options: z.array(z.string()),
  position: z.number(),
}));

export type LegalSourceBundle = {
  chunks: LegalSourceChunk[];
  questions: LegalRouteQuestion[];
  dataSource: "supabase" | "local";
};

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function getLocalBundle(routeIds: LegalRouteId[]): LegalSourceBundle {
  return {
    chunks: localLegalSourceChunks.filter((chunk) => routeIds.includes(chunk.routeId)),
    questions: localLegalRouteQuestions.filter((question) => routeIds.includes(question.routeId)),
    dataSource: "local",
  };
}

export async function getLegalSourceBundle(
  question: string,
  routeIds: LegalRouteId[],
): Promise<LegalSourceBundle> {
  if (routeIds.length === 0) return { chunks: [], questions: [], dataSource: "local" };
  const config = getSupabaseConfig();
  if (!config) return getLocalBundle(routeIds);

  const headers = {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    "Content-Type": "application/json",
  };
  const routeFilter = encodeURIComponent(`in.(${routeIds.join(",")})`);

  try {
    const [chunkResponse, questionResponse] = await Promise.all([
      fetch(`${config.url}/rest/v1/rpc/aegora_search_source_chunks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ p_query: question, p_route_ids: routeIds, p_limit: 16 }),
        cache: "no-store",
      }),
      fetch(`${config.url}/rest/v1/aegora_route_questions?select=id,route_id,question,why_it_matters,options,position&route_id=${routeFilter}&is_active=eq.true&order=position.asc`, {
        headers,
        cache: "no-store",
      }),
    ]);

    if (!chunkResponse.ok || !questionResponse.ok) {
      throw new Error(`Supabase-bronnen gaven status ${chunkResponse.status}/${questionResponse.status}.`);
    }

    const [chunkRows, questionRows] = await Promise.all([
      chunkResponse.json().then((rows) => chunkRowsSchema.parse(rows)),
      questionResponse.json().then((rows) => questionRowsSchema.parse(rows)),
    ]);

    if (chunkRows.length === 0) return getLocalBundle(routeIds);

    return {
      chunks: chunkRows.map((row) => ({
        chunkKey: row.chunk_key,
        routeId: row.route_id as LegalRouteId,
        routeLabel: row.route_label,
        heading: row.heading,
        content: row.content,
        sourceLocator: row.source_locator,
        sourceTitle: row.source_title,
        sourceUrl: row.source_url,
        sourcePublisher: row.source_publisher,
        sourceCheckedAt: row.source_checked_at,
        relevance: row.relevance,
      })),
      questions: questionRows.map((row) => ({
        id: row.id,
        routeId: row.route_id as LegalRouteId,
        question: row.question,
        whyItMatters: row.why_it_matters,
        options: row.options,
        position: row.position,
      })),
      dataSource: "supabase",
    };
  } catch (error) {
    console.error(
      "GGZ-bronpassages konden niet uit Supabase worden gelezen.",
      error instanceof Error ? error.message : "Onbekende fout.",
    );
    return getLocalBundle(routeIds);
  }
}
