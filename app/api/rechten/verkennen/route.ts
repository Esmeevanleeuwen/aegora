import { createHash } from "node:crypto";
import {
  ExplorerError, getExplorerDetail, getExplorerIndex, getExplorerNeighbors, getExplorerProof,
} from "@/lib/rights-explorer-repository";

/** Every request checks the current revision; no stale response is served. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const part = url.searchParams.get("part") ?? "index";
  const context = url.searchParams.get("context") ?? undefined;
  const researchParam = url.searchParams.get("research");
  const id = url.searchParams.get("id") ?? "";
  const headers: Record<string, string> = {
    "Cache-Control": "private, no-cache, must-revalidate",
    "Vary": "Accept-Encoding",
    "X-Content-Type-Options": "nosniff",
  };
  if (!["index", "detail", "proof", "neighbors"].includes(part)
      || (researchParam !== null && !["true", "false", "1", "0"].includes(researchParam))
      || (context !== undefined && (!context || context.length > 160))
      || (part !== "index" && (!id || id.length > 240))) {
    return Response.json({ error: "Ongeldige aanvraag voor de rechtenverkenner." }, { status: 400, headers });
  }
  const query = { context, research: researchParam === "true" || researchParam === "1" };
  const limitParam = url.searchParams.get("limit");
  if (limitParam !== null && (!/^\d+$/.test(limitParam) || Number(limitParam) < 1 || Number(limitParam) > 12)) {
    return Response.json({ error: "Kies één tot twaalf verbindingen." }, { status: 400, headers });
  }
  try {
    const payload = part === "index" ? await getExplorerIndex(query)
      : part === "detail" ? await getExplorerDetail(id, query)
      : part === "proof" ? await getExplorerProof(id, query)
      : await getExplorerNeighbors(id, query, limitParam === null ? 8 : Number(limitParam));
    const etag = `"${createHash("sha256").update(JSON.stringify({ revision: payload.revision, part,
      context: payload.context.id, research: query.research, id, limit: limitParam ?? "8" })).digest("hex").slice(0, 28)}"`;
    headers.ETag = etag;
    headers["X-Rights-Revision"] = payload.revision;
    const matched = request.headers.get("if-none-match")?.split(",").some((value) => value.trim().replace(/^W\//, "") === etag);
    if (matched) return new Response(null, { status: 304, headers });
    return Response.json(payload, { headers });
  } catch (error) {
    if (error instanceof ExplorerError) return Response.json({ error: error.message }, { status: error.status, headers });
    console.error("Rechtenverkenner: gegevens konden niet worden gelezen.", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "De gegevens zijn tijdelijk niet beschikbaar." }, { status: 503, headers });
  }
}
