import "server-only";

import { createHash } from "node:crypto";
import researchSnapshot from "./rights-explorer-snapshot.json";
import { getRightsGraph } from "./rights-network-repository";
import { resolveRightId, type RightsGraph, type RightsNode } from "./rights-network";
import type {
  ExplorerContext, ExplorerDetail, ExplorerIndex, ExplorerItem, ExplorerNeighbors,
  ExplorerNormGroup, ExplorerProof, ExplorerQuery, ExplorerReason, ExplorerSource,
} from "./rights-explorer-model";

type Row = Record<string, unknown>;
export type ResearchSnapshot = {
  schemaVersion: string;
  activeAssertionIds: string[];
  publicAssertionIds: string[];
  tables: Record<string, Row[]>;
  revision: string;
  exportedAt: string;
};
type Claim = { id: string; relationId: string; subjectId: string; objectId: string; code: string;
  kind: string; contextId: string; statement: string; limitations: string; sourceRow?: Row };

const CATALOG = "catalogus";
const SUPPORTED = new Set(["normative", "reported_mechanism", "inspection_finding"]);
const labels: Record<string, string> = {
  right: "Recht", safeguard: "Waarborg", action: "Handeling", channel: "Toegang",
  process: "Proces", outcome: "Uitkomst", role: "Verantwoordelijke", variable: "Onderzoeksvariabele",
  recht: "Recht", plicht: "Plicht", bevoegdheid: "Bevoegdheid", grens: "Grens",
  normative: "Wettelijke bronvereiste", reported_mechanism: "Gerapporteerd mechanisme",
  inspection_finding: "Inspectiebevinding", analytic_design: "Analytische koppeling",
  analytic_hypothesis: "Onderzoekshypothese", derived_hypothesis: "Afgeleide hypothese",
  structural_derivation: "Structurele afleiding", mathematical_bound: "Statistische grens",
  navigation: "Leesroute", catalog_summary: "Catalogusuitleg",
};
const relationLabels: Record<string, string> = {
  requires: "Vereist beoordeling van", protects: "Beschermt volgens de analyse",
  may_impair: "Kan de waarborg raken", may_affect: "Kan het recht raken",
  may_limit_channel: "Kan toegang beperken", enables: "Biedt toegang tot",
  may_weaken_protection: "Mogelijke invloed op bescherming", shares_safeguard: "Deelt een waarborg",
  does_not_establish: "Toont de waarborg niet aan", may_reduce_visibility: "Kan zichtbaarheid verminderen",
};
const text = (row: Row | undefined, key: string): string => typeof row?.[key] === "string" ? row[key] as string : "";
const unique = <T,>(values: T[]): T[] => [...new Set(values)];
const mapRows = (rows: Row[], key: string) => new Map(rows.map((row) => [text(row, key), row]));
const kindLabel = (kind: string) => labels[kind] ?? kind;

export class ExplorerError extends Error {
  constructor(message: string, public readonly status = 404) { super(message); }
}

export function safeSourceUrl(value: string): string | null {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, stable(v)]));
  return value;
}

function latestReviews(rows: Row[], key: string): Map<string, string> {
  const latest = new Map<string, Row>();
  for (const row of rows) {
    const old = latest.get(text(row, key));
    if (!old || `${text(row, "reviewed_at")}|${text(row, "review_id")}` > `${text(old, "reviewed_at")}|${text(old, "review_id")}`) latest.set(text(row, key), row);
  }
  return new Map([...latest].map(([id, row]) => [id, text(row, "decision")]));
}

/** Pure, bounded read model. Only the server imports the actual snapshot. */
export function createExplorerReader(graph: RightsGraph, snapshot: ResearchSnapshot) {
  const rows = (table: string) => snapshot.tables[table] ?? [];
  const concepts = mapRows(rows("concept"), "concept_id");
  const sources = mapRows(rows("source"), "source_id");
  const assertions = mapRows(rows("assertion"), "assertion_id");
  const relations = mapRows(rows("relation"), "relation_id");
  const types = mapRows(rows("relation_type"), "relation_type_id");
  const rules = mapRows(rows("rule"), "rule_id");
  const norms = mapRows(rows("norm"), "norm_id");
  const applications = mapRows(rows("norm_application"), "application_id");
  const sets = mapRows(rows("norm_set"), "set_id");
  const fragments = mapRows(rows("source_fragment"), "fragment_id");
  const definitions = mapRows(rows("condition_definition"), "condition_id");
  const modules = new Map(rows("module_manifest").map((r) => [text(r, "module_id"), text(r, "state")]));
  const activeModules = new Set([...modules].filter(([, state]) => state === "active").map(([id]) => id));
  // A disabled dependency makes the dependent content unavailable as well.
  for (let changed = true; changed;) {
    changed = false;
    for (const dep of rows("module_dependency")) if (activeModules.has(text(dep, "module_id")) && !activeModules.has(text(dep, "requires_module_id"))) {
      activeModules.delete(text(dep, "module_id")); changed = true;
    }
  }
  const ownerActive = (row: Row | undefined) => !!row && (!text(row, "owner_module_id") || activeModules.has(text(row, "owner_module_id")));
  const sourceReviews = latestReviews(rows("source_review"), "source_id");
  const assertionReviews = latestReviews(rows("assertion_review"), "assertion_id");
  const sourceActive = (id: string) => ownerActive(sources.get(id)) && (!sourceReviews.has(id) || sourceReviews.get(id) === "active");
  const evidenceFor = (id: string) => rows("assertion_evidence").filter((r) => text(r, "assertion_id") === id);
  const activeIds = new Set(snapshot.activeAssertionIds.filter((id) => {
    const assertion = assertions.get(id);
    return ownerActive(assertion) && !["withdrawn", "disputed"].includes(text(assertion, "status"))
      && (!assertionReviews.has(id) || assertionReviews.get(id) === "active")
      && evidenceFor(id).every((r) => sourceActive(text(r, "source_id")));
  }));
  for (const projection of rows("norm_projection")) {
    const norm = norms.get(text(projection, "norm_id"));
    const app = applications.get(text(projection, "application_id"));
    const set = sets.get(text(app, "set_id"));
    const member = rows("norm_set_member").find((r) => text(r, "set_id") === text(app, "set_id") && text(r, "norm_id") === text(norm, "norm_id"));
    if (![projection, norm, app, set, member, fragments.get(text(norm, "fragment_id"))].every(ownerActive)) activeIds.delete(text(projection, "assertion_id"));
    for (const exception of rows("norm_exception").filter((e) => text(e, "norm_id") === text(norm, "norm_id"))) {
      const fragment = fragments.get(text(exception, "source_fragment_id"));
      if (!ownerActive(exception) || !ownerActive(fragment) || !sourceActive(text(fragment, "source_id"))) activeIds.delete(text(projection, "assertion_id"));
    }
  }
  for (let changed = true; changed;) {
    changed = false;
    for (const derivation of rows("derivation")) {
      const id = text(derivation, "conclusion_assertion_id");
      const premises = rows("derivation_premise").filter((r) => text(r, "derivation_id") === text(derivation, "derivation_id"));
      if (activeIds.has(id) && (!ownerActive(rules.get(text(derivation, "rule_id"))) || premises.some((p) => !activeIds.has(text(p, "premise_assertion_id"))
        || text(assertions.get(text(p, "premise_assertion_id")), "context_id") !== text(assertions.get(id), "context_id")))) {
        activeIds.delete(id); changed = true;
      }
    }
  }
  const publicIds = new Set(snapshot.publicAssertionIds.filter((id) => activeIds.has(id) && SUPPORTED.has(text(assertions.get(id), "claim_kind")) && text(assertions.get(id), "status") === "source_linked"));
  const revision = createHash("sha256").update(JSON.stringify(stable({ graph, schema: snapshot.schemaVersion,
    tables: snapshot.tables, active: snapshot.activeAssertionIds, public: snapshot.publicAssertionIds }))).digest("hex").slice(0, 24);
  const catalogNodes = new Map(graph.nodes.map((n) => [n.id, n]));
  const contextRows = rows("context").filter(ownerActive);
  const contexts: ExplorerContext[] = [{ id: CATALOG, label: "Rechtencatalogus", kind: "catalog", snapshot: null,
    description: "Algemene uitleg en leesroutes. Controleer de oorspronkelijke bron en de voorwaarden voor jouw situatie." },
  ...contextRows.map((r) => ({ id: text(r, "context_id"), label: text(r, "label"), kind: "research" as const,
    description: text(r, "definition"), snapshot: unique(rows("norm_application").filter((a) => text(a, "context_id") === text(r, "context_id")).map((a) => text(a, "legal_snapshot"))).filter(Boolean).join(" · ") || null }))];

  function scope(query: ExplorerQuery = {}) {
    const context = contexts.find((c) => c.id === (query.context ?? CATALOG));
    if (!context) throw new ExplorerError("Deze context bestaat niet of is niet beschikbaar.");
    const research = query.research === true;
    const claims: Claim[] = context.kind === "catalog" ? graph.edges.map((e) => ({
      id: `nav:${e.id}`, relationId: e.id, subjectId: e.sourceId, objectId: e.targetId,
      code: e.label, kind: "navigation", contextId: CATALOG, statement: e.explanation,
      limitations: "Een leesroute stelt geen gezamenlijke juridische toepasselijkheid vast.",
    })) : [...(research ? activeIds : publicIds)].flatMap((id) => {
      const a = assertions.get(id)!;
      if (text(a, "context_id") !== context.id) return [];
      const relation = relations.get(text(a, "relation_id"));
      if (!relation || !concepts.has(text(relation, "subject_id")) || !concepts.has(text(relation, "object_id"))) return [];
      return [{ id, relationId: text(a, "relation_id"), subjectId: text(relation, "subject_id"), objectId: text(relation, "object_id"),
        code: text(types.get(text(relation, "relation_type_id")), "code"), kind: text(a, "claim_kind"), contextId: context.id,
        statement: text(a, "statement"), limitations: text(a, "limitations"), sourceRow: a }];
    });
    const ids = context.kind === "catalog" ? [...catalogNodes.keys()] : unique(claims.flatMap((c) => [c.subjectId, c.objectId]));
    const items = ids.map((id): ExplorerItem => {
      const node = catalogNodes.get(id);
      const concept = concepts.get(id);
      const related = claims.filter((c) => c.subjectId === id || c.objectId === id);
      const kind = context.kind === "catalog" ? node!.kind : text(concept, "kind");
      return { id, title: context.kind === "catalog" ? node!.title : text(concept, "label"),
        summary: context.kind === "catalog" ? node!.summary : text(concept, "definition"), kind, kindLabel: kindLabel(kind),
        topic: context.kind === "catalog" ? node!.topic : "Zorgonderzoek",
        relationCount: unique(related.map((c) => c.subjectId === id ? c.objectId : c.subjectId)).length, claimCount: related.length };
    }).sort((a, b) => a.title.localeCompare(b.title, "nl"));
    return { context, research, claims, items, byId: new Map(items.map((i) => [i.id, i])) };
  }

  function source(id: string, locator: string | null = null): ExplorerSource | null {
    const row = sources.get(id);
    return !row || !sourceActive(id) ? null : { id, title: text(row, "title"), url: safeSourceUrl(text(row, "uri")), locator,
      version: text(row, "version_label") || null, limitations: text(row, "limitations") || null };
  }
  function claimSources(id: string) {
    return evidenceFor(id).map((r) => source(text(r, "source_id"), text(r, "locator") || null)).filter((s): s is ExplorerSource => s !== null);
  }
  function catalogSource(node: RightsNode): ExplorerSource {
    return { id: `catalog:${node.id}`, title: node.sourceTitle, url: safeSourceUrl(node.sourceUrl), locator: null,
      version: node.sourceCheckedAt ? `Bron gecontroleerd op ${node.sourceCheckedAt}` : null, limitations: node.boundary || null };
  }
  function conditionText(id: string): string[] {
    if (!id) return ["De voorwaarden zijn nog niet als afzonderlijke toets uitgewerkt. Lees de volledige bron."];
    const row = definitions.get(id);
    if (!ownerActive(row)) return ["Deze voorwaarde is niet beschikbaar voor beoordeling."];
    return ["Deze norm bevat afzonderlijk vastgelegde voorwaarden. Beoordeling vereist controle van de bron en de feiten."];
  }
  function index(query: ExplorerQuery = {}): ExplorerIndex {
    const { context, research, items } = scope(query);
    return { revision, contexts, context, research, items };
  }
  function detail(id: string, query: ExplorerQuery = {}): ExplorerDetail {
    const state = scope(query);
    if (state.context.kind === "catalog") id = resolveRightId(graph, id) ?? id;
    const item = state.byId.get(id);
    if (!item) throw new ExplorerError("Dit onderdeel is niet beschikbaar binnen de gekozen context.");
    const direct = state.claims.filter((c) => c.subjectId === id || c.objectId === id);
    const bundles = new Map<string, { incoming: boolean; outgoing: boolean; reasons: ExplorerReason[] }>();
    for (const claim of direct) {
      const neighbor = claim.subjectId === id ? claim.objectId : claim.subjectId;
      const bundle = bundles.get(neighbor) ?? { incoming: false, outgoing: false, reasons: [] };
      bundle.incoming ||= claim.objectId === id; bundle.outgoing ||= claim.subjectId === id;
      bundle.reasons.push({ id: claim.id, label: relationLabels[claim.code] ?? claim.code, kind: claim.kind,
        kindLabel: kindLabel(claim.kind), statement: claim.statement, contextId: claim.contextId,
        sourceIds: unique(claimSources(claim.id).map((s) => s.id)) });
      bundles.set(neighbor, bundle);
    }
    const node = state.context.kind === "catalog" ? catalogNodes.get(id) : undefined;
    const normGroups = new Map<string, ExplorerNormGroup>();
    for (const claim of direct.filter((c) => c.kind === "normative")) {
      const projection = rows("norm_projection").find((p) => text(p, "assertion_id") === claim.id);
      if (!projection) continue;
      const norm = norms.get(text(projection, "norm_id"))!;
      const app = applications.get(text(projection, "application_id"))!;
      const set = sets.get(text(app, "set_id"))!;
      // Equal shared rules may be grouped; distinct applicability/periods may not.
      const groupId = [text(set, "set_id"), text(app, "legal_snapshot"), text(app, "scope_condition_id"), text(app, "valid_from"), text(app, "valid_to")].join(":");
      const group = normGroups.get(groupId) ?? { id: groupId, title: text(set, "label"), snapshot: text(app, "legal_snapshot"),
        scope: [state.context.description, ...conditionText(text(app, "scope_condition_id")),
          ...(text(app, "valid_from") ? [`Vastgelegde bronperiode begint op ${text(app, "valid_from")}.`] : []),
          ...(text(app, "valid_to") ? [`De vastgelegde bronperiode eindigt op ${text(app, "valid_to")}.`] : [])],
        limitations: [text(set, "limitations")], requirements: [] };
      const subjectScope = `Deze bronbeschrijving is gekoppeld aan: ${text(concepts.get(text(app, "subject_id")), "label")}.`;
      if (!group.scope.includes(subjectScope)) group.scope.push(subjectScope);
      if (!group.requirements.some((r) => r.id === text(norm, "norm_id"))) group.requirements.push({ id: text(norm, "norm_id"),
        title: text(concepts.get(text(norm, "safeguard_id")), "label"), conditions: conditionText(text(norm, "requirement_condition_id")),
        exceptions: rows("norm_exception").filter((e) => text(e, "norm_id") === text(norm, "norm_id")).map((e) =>
          `${text(e, "effect") === "exclude_requirement" ? "Mogelijke uitzondering" : "Mogelijke aanpassing"}: ${conditionText(text(e, "condition_id")).join(" ")}`),
        sources: claimSources(claim.id) });
      normGroups.set(groupId, group);
    }
    const allSources = node ? [catalogSource(node)] : direct.flatMap((c) => claimSources(c.id));
    const proofs = direct.map((c) => ({ id: c.id, label: relationLabels[c.code] ?? c.code, kind: c.kind }));
    if (node) proofs.unshift({ id: `catalog:${node.id}`, label: "Oorspronkelijke bron", kind: "catalog_summary" });
    return { revision, context: state.context, research: state.research, item, description: item.summary,
      conditions: node ? [node.appliesWhen].filter(Boolean) : unique([...normGroups.values()].flatMap((g) => g.scope)),
      exceptions: node ? [node.boundary].filter(Boolean) : unique(direct.map((c) => c.limitations).filter(Boolean)),
      normGroups: [...normGroups.values()], relations: [...bundles].map(([neighbor, b]) => ({ item: state.byId.get(neighbor)!,
        direction: b.incoming && b.outgoing ? "both" : b.incoming ? "incoming" : "outgoing", reasons: b.reasons })),
      sources: [...new Map(allSources.map((s) => [`${s.id}:${s.locator}`, s])).values()], proofs };
  }
  function proof(id: string, query: ExplorerQuery = {}): ExplorerProof {
    const state = scope(query);
    if (state.context.kind === "catalog" && id.startsWith("catalog:")) {
      const node = catalogNodes.get(id.slice("catalog:".length));
      if (!node) throw new ExplorerError("Deze bron bestaat niet.");
      return { revision, context: state.context, research: state.research, id, truncated: false, steps: [{ id,
        kind: "catalog_summary", kindLabel: kindLabel("catalog_summary"), statement: node.summary, limitations: node.boundary,
        sources: [catalogSource(node)], premiseIds: [], rule: null }] };
    }
    const selected = state.claims.find((c) => c.id === id);
    if (!selected) throw new ExplorerError("Dit bewijs is niet beschikbaar binnen de gekozen context en onderzoeksstand.");
    const claimMap = new Map(state.claims.map((c) => [c.id, c]));
    const queue = [id], visited = new Set<string>();
    const steps: ExplorerProof["steps"] = [];
    while (queue.length && steps.length < 32) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const claim = claimMap.get(current);
      if (!claim) continue;
      const derivation = rows("derivation").find((d) => text(d, "conclusion_assertion_id") === current);
      const rule = derivation ? rules.get(text(derivation, "rule_id")) : undefined;
      const premiseIds = derivation ? rows("derivation_premise").filter((p) => text(p, "derivation_id") === text(derivation, "derivation_id"))
        .map((p) => text(p, "premise_assertion_id")).filter((p) => claimMap.has(p)) : [];
      queue.push(...premiseIds.filter((p) => !visited.has(p)));
      const navSources = claim.kind === "navigation" ? [catalogNodes.get(claim.subjectId), catalogNodes.get(claim.objectId)].filter((n): n is RightsNode => !!n).map(catalogSource) : [];
      steps.push({ id: current, kind: claim.kind, kindLabel: kindLabel(claim.kind), statement: claim.statement,
        limitations: claim.limitations, sources: [...claimSources(current), ...navSources], premiseIds,
        rule: rule ? { id: text(rule, "rule_id"), description: text(rule, "description") } : null });
    }
    return { revision, context: state.context, research: state.research, id, steps, truncated: queue.some((p) => !visited.has(p)) };
  }
  function neighbors(id: string, query: ExplorerQuery = {}, requestedLimit = 8): ExplorerNeighbors {
    const state = scope(query);
    if (state.context.kind === "catalog") id = resolveRightId(graph, id) ?? id;
    const focus = state.byId.get(id);
    if (!focus) throw new ExplorerError("Dit onderdeel is niet beschikbaar binnen de gekozen context.");
    const limit = Math.min(12, Math.max(1, Math.trunc(Number.isFinite(requestedLimit) ? requestedLimit : 8)));
    const direct = state.claims.filter((c) => c.subjectId === id || c.objectId === id);
    const neighborIds = unique(direct.map((c) => c.subjectId === id ? c.objectId : c.subjectId)).slice(0, limit);
    const selected = new Set([id, ...neighborIds]);
    const edges = new Map<string, ExplorerNeighbors["edges"][number]>();
    for (const claim of direct) if (selected.has(claim.subjectId) && selected.has(claim.objectId)) {
      const key = `${claim.relationId}:${claim.kind}`;
      const edge = edges.get(key) ?? { id: key, sourceId: claim.subjectId, targetId: claim.objectId,
        label: relationLabels[claim.code] ?? claim.code, kind: claim.kind, contextId: claim.contextId, assertionIds: [] };
      edge.assertionIds.push(claim.id); edges.set(key, edge);
    }
    return { revision, context: state.context, research: state.research, focusId: id,
      nodes: [focus, ...neighborIds.map((n) => state.byId.get(n)!)], edges: [...edges.values()] };
  }
  return { revision, index, detail, proof, neighbors };
}

let current: ReturnType<typeof createExplorerReader> | undefined;
let currentKey = "";
async function reader() {
  const graph = await getRightsGraph();
  const key = createHash("sha256").update(JSON.stringify(graph)).update(researchSnapshot.revision).digest("hex");
  if (!current || currentKey !== key) { current = createExplorerReader(graph, researchSnapshot); currentKey = key; }
  return current;
}

export const getExplorerIndex = async (query: ExplorerQuery = {}) => (await reader()).index(query);
export const getExplorerDetail = async (id: string, query: ExplorerQuery = {}) => (await reader()).detail(id, query);
export const getExplorerProof = async (id: string, query: ExplorerQuery = {}) => (await reader()).proof(id, query);
export const getExplorerNeighbors = async (id: string, query: ExplorerQuery = {}, limit = 8) => (await reader()).neighbors(id, query, limit);
