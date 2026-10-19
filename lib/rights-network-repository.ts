import "server-only";

import { cache } from "react";
import { z } from "zod";
import { getPublicRightsData } from "./public-rights-repository";
import {
  buildRightsGraph,
  resolveRightId,
  type RightsCombination,
  type RightsEdge,
  type RightsGraph,
} from "./rights-network";

const linkRowSchema = z.object({
  source_id: z.string().trim().min(1).max(160),
  target_id: z.string().trim().min(1).max(160),
  relation: z.enum(["related", "context", "procedure", "protection"]),
  label: z.string().trim().min(1).max(160),
  explanation: z.string().trim().min(1).max(2000),
  priority: z.number().int().min(0).max(100),
});

const combinationRowSchema = z.object({
  id: z.string().trim().min(1).max(160),
  slug: z.string().max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(2000),
  node_ids: z.array(z.string().min(1).max(160)).min(2).max(12),
  featured: z.boolean(),
  priority: z.number().int().min(0).max(100),
  open_count: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  tags: z.array(z.string().trim().min(1).max(100)).max(12),
});

function getPublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

// The graph is navigable from both ends. A stable pair key lets editorial rows
// override the equivalent catalog link without rendering two identical routes.
function edgeKey(edge: Pick<RightsEdge, "sourceId" | "targetId" | "relation">) {
  return `${[edge.sourceId, edge.targetId].sort().join("::")}::${edge.relation}`;
}

function readLinks(graph: RightsGraph, input: unknown): RightsEdge[] {
  const rows = z.array(linkRowSchema).max(2000).parse(input);
  return rows.flatMap((row) => {
    const sourceId = resolveRightId(graph, row.source_id);
    const targetId = resolveRightId(graph, row.target_id);
    if (!sourceId || !targetId || sourceId === targetId) return [];
    const edge = {
      sourceId,
      targetId,
      relation: row.relation,
      label: row.label,
      explanation: row.explanation,
      priority: row.priority,
    };
    return [{ ...edge, id: `saved-${edgeKey(edge)}` }];
  });
}

function readCombinations(graph: RightsGraph, input: unknown): RightsCombination[] {
  const rows = z.array(combinationRowSchema).max(500).parse(input);
  return rows.flatMap((row) => {
    const nodeIds = [...new Set(row.node_ids.map((id) => resolveRightId(graph, id)))];
    // Do not silently change the meaning of a saved combination by removing a
    // missing article. Editors should repair that combination before publication.
    if (nodeIds.includes(null) || nodeIds.length < 2) return [];
    const validIds = nodeIds as string[];
    const selected = new Set(validIds);
    const reached = new Set([validIds[0]]);
    const queue = [validIds[0]];
    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      for (const edge of graph.edges) {
        const neighbor = edge.sourceId === current ? edge.targetId : edge.targetId === current ? edge.sourceId : null;
        if (!neighbor || !selected.has(neighbor) || reached.has(neighbor)) continue;
        reached.add(neighbor);
        queue.push(neighbor);
      }
    }
    if (reached.size !== selected.size) return [];
    return [{
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      nodeIds: validIds,
      featured: row.featured,
      priority: row.priority,
      openCount: row.open_count,
      tags: [...new Set(row.tags)],
    }];
  });
}

/**
 * The legal catalog supplies all article text and source URLs. Optional public
 * database rows only add or override published navigation metadata. The checked,
 * source-controlled catalog remains usable if the database is unavailable.
 */
export const getRightsGraph = cache(async (): Promise<RightsGraph> => {
  const catalog = getPublicRightsData();
  const config = getPublicConfig();
  if (!config) return buildRightsGraph((await catalog).rules);

  const request = async (path: string) => {
    const response = await fetch(`${config.url}/rest/v1/${path}`, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
      next: { revalidate: 3600, tags: ["rights-network"] },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error(`Rechtennetwerk: Data API status ${response.status}.`);
    return response.json() as Promise<unknown>;
  };

  // A missing optional table should not discard successful data from the other.
  // Start metadata alongside the catalog so an unavailable project costs one
  // bounded wait, instead of consecutive timeouts on every server-rendered page.
  const [data, responses] = await Promise.all([
    catalog,
    Promise.allSettled([
      request("aegora_right_links?select=source_id,target_id,relation,label,explanation,priority&is_published=eq.true&order=priority.desc,source_id.asc,target_id.asc&limit=2000"),
      request("aegora_right_combinations?select=id,slug,title,summary,node_ids,featured,priority,open_count,tags&is_published=eq.true&order=priority.desc,id.asc&limit=500"),
    ]),
  ]);
  const graph = buildRightsGraph(data.rules);

  let savedEdges: RightsEdge[] = [];
  let savedCombinations: RightsCombination[] = [];
  if (responses[0].status === "fulfilled") {
    try { savedEdges = readLinks(graph, responses[0].value); } catch { /* Keep the catalog if metadata is malformed. */ }
  }
  const edges = new Map(graph.edges.map((edge) => [edgeKey(edge), edge]));
  for (const edge of savedEdges) edges.set(edgeKey(edge), edge);
  const connectedGraph = { ...graph, edges: [...edges.values()] };
  if (responses[1].status === "fulfilled") {
    try { savedCombinations = readCombinations(connectedGraph, responses[1].value); } catch { /* Keep the catalog if metadata is malformed. */ }
  }
  if (savedEdges.length === 0 && savedCombinations.length === 0) return graph;

  const combinations = new Map(graph.combinations.map((item) => [item.slug, item]));
  for (const combination of savedCombinations) combinations.set(combination.slug, combination);

  return {
    ...graph,
    edges: [...edges.values()],
    combinations: [...combinations.values()],
    dataSource: "database",
  };
});
