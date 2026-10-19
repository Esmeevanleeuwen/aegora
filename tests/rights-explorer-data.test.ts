import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import type { RightsGraph } from "../lib/rights-network";
import type { ResearchSnapshot } from "../lib/rights-explorer-repository";

// Use the installed compiler and Node's test runner; no new runtime dependency.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const cache = new Map<string, Record<string, unknown>>();
function load(file: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  if (cache.has(file) && !Object.keys(overrides).length) return cache.get(file)!;
  const compiled = { exports: {} as Record<string, unknown> };
  const code = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
  } }).outputText;
  const loadDependency = (id: string): unknown => {
    if (Object.hasOwn(overrides, id)) return overrides[id];
    if (id === "server-only") return {};
    if (id === "./rights-network-repository") return { getRightsGraph: async () => graph };
    if (id.endsWith(".json")) return JSON.parse(readFileSync(resolve(dirname(file), id), "utf8"));
    if (id.startsWith(".")) return load(resolve(dirname(file), `${id}.ts`));
    return require(id);
  };
  new Function("require", "module", "exports", code)(loadDependency, compiled, compiled.exports);
  if (!Object.keys(overrides).length) cache.set(file, compiled.exports);
  return compiled.exports;
}
const network = load(resolve(root, "lib/rights-network.ts"));
const graph = network.localRightsGraph as RightsGraph;
const repository = load(resolve(root, "lib/rights-explorer-repository.ts")) as unknown as typeof import("../lib/rights-explorer-repository");
const snapshot = JSON.parse(readFileSync(resolve(root, "lib/rights-explorer-snapshot.json"), "utf8")) as ResearchSnapshot;
const make = (data = structuredClone(snapshot)) => repository.createExplorerReader(graph, data);
const closed = { context: "CTX_NL_CLOSED_2024" };
const closedResearch = { ...closed, research: true };

test("catalog index is compact, unique, and has no research data or proof graph", () => {
  const result = make().index();
  assert.equal(result.context.id, "catalogus");
  assert.equal(result.items.length, graph.nodes.length);
  assert.equal(new Set(result.items.map((item) => item.id)).size, result.items.length);
  assert.ok(!("tables" in result) && !("edges" in result));
  assert.ok(result.items.every((item) => !("sources" in item) && !("proofs" in item)));
  assert.ok(JSON.stringify(result).length < 65_000);
});

test("unknown explicit contexts and cross-context IDs fail without fallback", () => {
  const reader = make();
  assert.throws(() => reader.index({ context: "missing" }), /context/);
  assert.throws(() => reader.detail(graph.nodes[0].id, closed), /context/);
  assert.throws(() => reader.detail("A_PHONE"), /context/);
  const foreign = snapshot.tables.assertion.find((r) => r.context_id === "CTX_ZIKOS_RESPONSES" && r.claim_kind === "reported_mechanism")!;
  assert.throws(() => reader.proof(foreign.assertion_id as string, closedResearch), /context/);
});

test("research is explicit, typed, and confined to one context", () => {
  const reader = make();
  const ordinary = reader.detail("A_PHONE", closed);
  assert.ok(ordinary.relations.every((bundle) => bundle.reasons.every((reason) => reason.kind === "normative")));
  const research = reader.detail("S_PROPORTION", closedResearch);
  assert.ok(research.relations.some((b) => b.reasons.some((r) => r.kind === "analytic_design")));
  for (const bundle of research.relations) for (const reason of bundle.reasons) assert.equal(reason.contextId, closed.context);
  assert.ok(!reader.index(closed).items.some((i) => i.id === "R_LIBERTY"));
  assert.ok(reader.index(closedResearch).items.some((i) => i.id === "R_LIBERTY"));
});

test("detail bundles concepts and one shared normset, while proofs stay lazy", () => {
  const detail = make().detail("A_PHONE", closedResearch);
  assert.equal(new Set(detail.relations.map((b) => b.item.id)).size, detail.relations.length);
  assert.equal(detail.normGroups.length, 1);
  assert.equal(detail.normGroups[0].requirements.length, 7);
  assert.equal(detail.normGroups[0].snapshot, "2024-01-01");
  assert.ok(detail.normGroups[0].scope.length && detail.normGroups[0].limitations.length);
  assert.ok(detail.proofs.length);
  assert.ok(detail.proofs.every((proof) => Object.keys(proof).sort().join() === "id,kind,label"));
  assert.ok(!("steps" in detail) && !("nodes" in detail));
  assert.ok(detail.sources.every((source) => source.url === null || /^https?:\/\//.test(source.url)));
});

test("proof endpoint returns the actual same-context premises and rule only on demand", () => {
  const reader = make();
  const claim = snapshot.tables.assertion.find((r) => r.context_id === "CTX_ZIKOS_RESPONSES" && r.claim_kind === "derived_hypothesis")!;
  const query = { context: "CTX_ZIKOS_RESPONSES", research: true };
  assert.throws(() => reader.proof(claim.assertion_id as string, { ...query, research: false }), /onderzoeksstand/);
  const proof = reader.proof(claim.assertion_id as string, query);
  assert.ok(proof.steps.length >= 3 && proof.steps.length <= 32);
  assert.ok(proof.steps[0].rule && proof.steps[0].premiseIds.length === 2);
  assert.ok(proof.steps.every((step) => snapshot.tables.assertion.find((a) => a.assertion_id === step.id)?.context_id === query.context));
});

test("neighbors return a bounded local expansion with unique nodes and typed reasons", () => {
  const reader = make();
  const normal = reader.neighbors("S_WRITTEN", closedResearch);
  const largest = reader.neighbors("S_WRITTEN", closedResearch, 500);
  assert.ok(normal.nodes.length <= 9 && largest.nodes.length <= 13);
  assert.equal(new Set(largest.nodes.map((n) => n.id)).size, largest.nodes.length);
  assert.equal(new Set(largest.edges.map((e) => e.id)).size, largest.edges.length);
  assert.ok(largest.edges.every((e) => e.contextId === closed.context && (e.sourceId === "S_WRITTEN" || e.targetId === "S_WRITTEN")));
});

test("withdrawn sources and modules remove claims and dependent proofs, and change revision", () => {
  const base = make();
  const changed = structuredClone(snapshot);
  changed.tables.source_review.push({ review_id: "test-review", source_id: "SRC_LAW", decision: "withdrawn", reason: "test fixture", reviewed_at: "2099-01-01" });
  const withdrawn = make(changed);
  assert.notEqual(base.revision, withdrawn.revision);
  assert.equal(withdrawn.index(closed).items.length, 0);
  assert.throws(() => withdrawn.detail("A_PHONE", closed), /context/);
  const disabled = structuredClone(snapshot);
  const release = disabled.tables.module_manifest.find((m) => m.module_id === "law.closed_youth_2024")!;
  release.state = "disabled";
  const unavailable = make(disabled);
  assert.notEqual(base.revision, unavailable.revision);
  assert.throws(() => unavailable.index(closed), /context/);
});

test("catalog changes affect revision and legacy IDs resolve without cross-context aliases", () => {
  const changed = structuredClone(graph);
  changed.nodes[0].summary += " Test change.";
  assert.notEqual(make().revision, repository.createExplorerReader(changed, snapshot).revision);
  const existing = graph.nodes[0].id;
  assert.equal(make().detail(`public-${existing}`).item.id, existing);
});

test("withdrawing an exception source also removes the affected requirements", () => {
  const data = structuredClone(snapshot);
  const norm = data.tables.norm[0];
  data.tables.source_fragment.push({ fragment_id: "test-exception-fragment", source_id: "SRC_DECREE", locator: "synthetic test", owner_module_id: "law.closed_youth_2024" });
  data.tables.norm_exception.push({ exception_id: "test-exception", norm_id: norm.norm_id, condition_id: "test-condition",
    source_fragment_id: "test-exception-fragment", effect: "exclude_requirement", owner_module_id: "law.closed_youth_2024" });
  const before = make(data).detail("A_PHONE", closed);
  assert.equal(before.normGroups[0].requirements.length, 7);
  data.tables.source_review.push({ review_id: "exception-review", source_id: "SRC_DECREE", decision: "needs_review", reason: "test", reviewed_at: "2099-01-01" });
  const after = make(data).detail("A_PHONE", closed);
  assert.equal(after.normGroups[0].requirements.length, 6);
  assert.ok(!after.normGroups[0].requirements.some((r) => r.id === norm.norm_id));
});

test("different applicability periods stay separate when shared norms are grouped", () => {
  const data = structuredClone(snapshot);
  const app = data.tables.norm_application[0];
  app.valid_to = "2024-12-31";
  const detail = make(data).detail("S_WRITTEN", closed);
  assert.equal(detail.normGroups.length, 2);
  assert.ok(detail.normGroups.some((group) => group.scope.some((line) => line.includes("2024-12-31"))));
  const subjects = detail.normGroups.flatMap((group) => group.scope.filter((line) => line.startsWith("Deze bronbeschrijving")));
  assert.equal(subjects.length, 6);
});

test("unsafe protocols never become clickable sources", () => {
  assert.equal(repository.safeSourceUrl("javascript:alert(1)"), null);
  assert.equal(repository.safeSourceUrl("data:text/html,test"), null);
  assert.equal(repository.safeSourceUrl("file:///etc/passwd"), null);
  assert.equal(repository.safeSourceUrl("https://example.org/a"), "https://example.org/a");
});

test("API validates parts, returns revision ETags, and revalidates before 304", async () => {
  let reader = make();
  const route = load(resolve(root, "app/api/rechten/verkennen/route.ts"), {
    "@/lib/rights-explorer-repository": { ...repository,
      getExplorerIndex: async (q: Parameters<typeof reader.index>[0]) => reader.index(q),
      getExplorerDetail: async (id: string, q: Parameters<typeof reader.detail>[1]) => reader.detail(id, q),
      getExplorerProof: async (id: string, q: Parameters<typeof reader.proof>[1]) => reader.proof(id, q),
      getExplorerNeighbors: async (id: string, q: Parameters<typeof reader.neighbors>[1], limit: number) => reader.neighbors(id, q, limit) },
  }) as unknown as { GET(request: Request): Promise<Response> };
  const url = "https://example.org/api/rechten/verkennen?part=index&context=CTX_NL_CLOSED_2024";
  const first = await route.GET(new Request(url));
  assert.equal(first.status, 200);
  assert.ok(first.headers.get("cache-control")?.includes("must-revalidate"));
  assert.ok(!first.headers.get("cache-control")?.includes("stale"));
  const etag = first.headers.get("etag")!;
  const cached = await route.GET(new Request(url, { headers: { "If-None-Match": etag } }));
  assert.equal(cached.status, 304);
  const changed = structuredClone(snapshot);
  changed.tables.source_review.push({ review_id: "api-review", source_id: "SRC_LAW", decision: "withdrawn", reason: "test fixture", reviewed_at: "2099-01-01" });
  reader = make(changed);
  const fresh = await route.GET(new Request(url, { headers: { "If-None-Match": etag } }));
  assert.equal(fresh.status, 200);
  assert.notEqual(fresh.headers.get("etag"), etag);
  assert.deepEqual((await fresh.json()).items, []);
  assert.equal((await route.GET(new Request(`${url}&limit=13`))).status, 400);
  assert.equal((await route.GET(new Request("https://example.org/api/rechten/verkennen?context=unknown"))).status, 404);
});
