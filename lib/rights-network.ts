import { basicRights } from "./basic-rights-data";
import { publicRules as defaultPublicRules, type PublicRule } from "./public-rights-data";
import { rightsCatalog } from "./rights-data";
import { rightsAliases, rightsNetworkCombinations, rightsNetworkEdges } from "./rights-network-data";

export type RightsNode = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  topic: string;
  kind: "recht" | "plicht" | "bevoegdheid" | "grens";
  sourceUrl: string;
  sourceTitle: string;
  sourceCheckedAt: string | null;
  appliesWhen: string;
  boundary: string;
  nextStep: string;
  practicalNote: string;
  roles: string[];
  situations: string[];
  tags: string[];
  origin: "public" | "basic" | "catalog";
};

export type RightsEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  relation: "related" | "context" | "procedure" | "protection";
  label: string;
  explanation: string;
  priority: number;
};

export type RightsCombination = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  nodeIds: string[];
  featured: boolean;
  priority: number;
  openCount: number;
  tags: string[];
};

export type RightsGraph = {
  nodes: RightsNode[];
  edges: RightsEdge[];
  combinations: RightsCombination[];
  dataSource: "database" | "catalog";
};

const catalogContext: Record<string, { roles: string[]; situations: string[] }> = {
  "privacy-medische-gegevens": { roles: ["client", "zorgmedewerker", "psycholoog"], situations: ["informatie-gedeeld", "klacht-of-geschil"] },
  "wettelijke-vakantie": { roles: ["werknemer"], situations: ["besluit-of-contract", "lopende-termijn"] },
  slachtofferrechten: { roles: ["iedereen"], situations: ["acuut-gevaar", "klacht-of-geschil"] },
  "bezwaar-overheidsbesluit": { roles: ["iedereen"], situations: ["besluit-of-contract", "lopende-termijn", "klacht-of-geschil"] },
};

const catalogTopics: Record<string, string> = {
  "Zorg & cliënt": "Zorg",
  Familie: "Kinderen",
};

const unique = (values: string[]) => [...new Set(values)];
const compareId = (left: string, right: string) => left < right ? -1 : left > right ? 1 : 0;

/** Merge published rules without dropping existing catalog entries when a DB is incomplete. */
export function buildRightsGraph(publicRules: PublicRule[] = defaultPublicRules): RightsGraph {
  const rules = new Map(defaultPublicRules.map((rule) => [rule.id, rule]));
  for (const rule of publicRules) rules.set(rule.id, rule);

  const nodes: RightsNode[] = [...rules.values()].map((rule) => ({
    id: rule.id,
    slug: rule.id,
    title: rule.title,
    summary: rule.summary,
    topic: rule.topic,
    kind: rule.type,
    sourceUrl: rule.sourceUrl,
    sourceTitle: rule.sourceTitle,
    sourceCheckedAt: rule.sourceCheckedAt,
    appliesWhen: rule.appliesWhen,
    boundary: rule.boundary,
    nextStep: rule.nextStep,
    practicalNote: rule.practicalNote,
    roles: [...rule.roles],
    situations: [...rule.situations],
    tags: unique([rule.topic, ...rule.situations]),
    origin: "public",
  }));

  for (const right of basicRights) {
    nodes.push({
      id: `basis-${right.id}`,
      slug: `basis-${right.id}`,
      title: right.title,
      summary: right.summary,
      topic: "Grondrechten",
      kind: "recht",
      sourceUrl: right.sourceUrl,
      sourceTitle: right.sourceTitle,
      sourceCheckedAt: null,
      appliesWhen: right.commonAreas.join(" · "),
      boundary: right.boundary,
      nextStep: "Lees de voorwaarden en de oorspronkelijke bron; leg vast welke behandeling of beslissing je wilt onderzoeken.",
      practicalNote: right.protectedRights.join(" "),
      roles: ["iedereen"],
      situations: ["klacht-of-geschil"],
      tags: unique(["Grondrechten", "Gelijke behandeling", ...right.commonAreas]),
      origin: "basic",
    });
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  for (const right of rightsCatalog) {
    const canonicalId = rightsAliases[right.id] ?? right.id;
    if (nodeIds.has(canonicalId)) continue;
    const topic = catalogTopics[right.domain] ?? right.domain;
    const context = catalogContext[right.id];
    nodes.push({
      id: canonicalId,
      slug: canonicalId,
      title: right.title,
      summary: right.summary,
      topic,
      kind: "recht",
      sourceUrl: right.sourceUrl,
      sourceTitle: right.sourceTitle,
      sourceCheckedAt: null,
      appliesWhen: right.conditions.join(" "),
      boundary: right.exceptions.join(" "),
      nextStep: right.nextStep,
      practicalNote: [right.responsibleParty, right.deadline, right.escalationRoute].join(" · "),
      roles: [...(context?.roles ?? ["iedereen"])],
      situations: [...(context?.situations ?? [])],
      tags: [topic, right.domain],
      origin: "catalog",
    });
    nodeIds.add(canonicalId);
  }

  const edges = rightsNetworkEdges
    .filter((edge) => nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId))
    .map((edge) => ({ ...edge }));

  // Future published rules get one contextual reading route, never a dense
  // all-to-all set of assumed legal relationships. Editors can replace this link.
  const connected = new Set(edges.flatMap((edge) => [edge.sourceId, edge.targetId]));
  for (const node of nodes) {
    if (connected.has(node.id)) continue;
    const neighbor = nodes.find((candidate) => candidate.id !== node.id && connected.has(candidate.id) && candidate.topic === node.topic)
      ?? nodes.find((candidate) => candidate.id === "gelijke-behandeling" && candidate.id !== node.id);
    if (!neighbor) continue;
    const sameTopic = node.topic === neighbor.topic;
    edges.push({
      id: `${node.id}--${neighbor.id}`,
      sourceId: node.id,
      targetId: neighbor.id,
      relation: "context",
      label: sameTopic ? "Verder binnen dit onderwerp" : "Algemene achtergrond",
      explanation: sameTopic
        ? `Beide artikelen staan onder ${node.topic}. Deze leesroute biedt context en betekent niet dat de regels in dezelfde situatie gelden.`
        : "Lees als algemene achtergrond ook de uitleg over gelijke behandeling. Deze leesroute zegt niets over de toepasselijkheid of juridische samenhang van de regels.",
      priority: 30,
    });
    connected.add(node.id);
    connected.add(neighbor.id);
  }

  return {
    nodes,
    edges,
    combinations: rightsNetworkCombinations.map((combination) => ({
      ...combination,
      nodeIds: [...combination.nodeIds],
      tags: [...combination.tags],
    })),
    dataSource: "catalog",
  };
}

/** Accept existing links from each catalogue as well as canonical network URLs. */
export function resolveRightId(graph: RightsGraph, idOrAlias: string): string | null {
  const ids = new Set(graph.nodes.map((node) => node.id));
  const input = idOrAlias.trim();
  if (ids.has(input)) return input;
  if (ids.has(rightsAliases[input])) return rightsAliases[input];
  if (basicRights.some((right) => right.id === input) && ids.has(`basis-${input}`)) return `basis-${input}`;

  for (const prefix of ["catalog-", "public-", "recht-", "basic-", "basis-"]) {
    if (!input.startsWith(prefix)) continue;
    const unprefixed = input.slice(prefix.length);
    if (ids.has(unprefixed)) return unprefixed;
    if (ids.has(rightsAliases[unprefixed])) return rightsAliases[unprefixed];
    if (basicRights.some((right) => right.id === unprefixed) && ids.has(`basis-${unprefixed}`)) return `basis-${unprefixed}`;
  }
  return null;
}

function normalizedIds(graph: RightsGraph, ids: string[]) {
  return unique(ids.map((id) => resolveRightId(graph, id)).filter((id): id is string => id !== null));
}

function neighbors(graph: RightsGraph, id: string) {
  return graph.edges.flatMap((edge) => edge.sourceId === id ? [edge.targetId] : edge.targetId === id ? [edge.sourceId] : []);
}

function isConnectedCombination(graph: RightsGraph, nodeIds: string[]) {
  const selected = new Set(nodeIds);
  if (selected.size < 2 || selected.size !== nodeIds.length) return false;
  const reached = new Set([nodeIds[0]]);
  const pending = [nodeIds[0]];
  while (pending.length > 0) {
    const id = pending.pop()!;
    for (const neighborId of neighbors(graph, id)) {
      if (selected.has(neighborId) && !reached.has(neighborId)) {
        reached.add(neighborId);
        pending.push(neighborId);
      }
    }
  }
  return reached.size === selected.size;
}

/** Only stored, direct relations can create a related-right recommendation. */
export function getRelatedRights(graph: RightsGraph, id: string, selectedIds: string[] = []): Array<{ node: RightsNode; edge: RightsEdge; score: number }> {
  const canonicalId = resolveRightId(graph, id);
  if (!canonicalId) return [];
  const selected = new Set(normalizedIds(graph, selectedIds));
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const related = new Map<string, { node: RightsNode; edge: RightsEdge; score: number }>();

  for (const edge of graph.edges) {
    const otherId: string | null = edge.sourceId === canonicalId ? edge.targetId : edge.targetId === canonicalId ? edge.sourceId : null;
    if (!otherId || otherId === canonicalId) continue;
    const node = nodesById.get(otherId);
    if (!node) continue;
    const selectedConnections = neighbors(graph, otherId).filter((neighborId) => selected.has(neighborId)).length;
    const score = edge.priority + selectedConnections * 25;
    const previous = related.get(otherId);
    if (!previous || score > previous.score || (score === previous.score && compareId(edge.id, previous.edge.id) < 0)) {
      related.set(otherId, { node, edge, score });
    }
  }

  return [...related.values()].sort((left, right) => right.score - left.score || compareId(left.node.id, right.node.id));
}

/** Rank saved combinations using overlap, real connections and recorded usage. */
export function getSuggestedCombinations(graph: RightsGraph, selectedIds: string[]): RightsCombination[] {
  const selected = new Set(normalizedIds(graph, selectedIds));
  const validIds = new Set(graph.nodes.map((node) => node.id));
  const linkedIds = new Set([...selected].flatMap((id) => neighbors(graph, id)));

  return graph.combinations
    .filter((combination) => combination.nodeIds.every((id) => validIds.has(id)) && isConnectedCombination(graph, combination.nodeIds))
    .map((combination) => {
      const overlap = combination.nodeIds.filter((id) => selected.has(id)).length;
      const linked = combination.nodeIds.filter((id) => !selected.has(id) && linkedIds.has(id)).length;
      const usage = Number.isFinite(combination.openCount) ? Math.max(0, combination.openCount) : 0;
      const coverage = overlap / combination.nodeIds.length;
      const score = overlap * 1000 + coverage * 500 + linked * 50 + combination.priority + (combination.featured ? 20 : 0) + Math.log2(usage + 1) * 10;
      return { combination, overlap, linked, score };
    })
    .filter(({ combination, overlap, linked }) => selected.size === 0 ? combination.featured : overlap > 0 || linked > 0)
    .sort((left, right) => right.score - left.score || compareId(left.combination.id, right.combination.id))
    .map(({ combination }) => combination);
}

/** A custom selection is a view over existing nodes and links; it adds no claims. */
export function combineRights(graph: RightsGraph, nodeIds: string[]): { nodeIds: string[]; edges: RightsEdge[]; suggestions: RightsCombination[] } {
  const selection = normalizedIds(graph, nodeIds);
  const selected = new Set(selection);
  return {
    nodeIds: selection,
    edges: graph.edges.filter((edge) => selected.has(edge.sourceId) && selected.has(edge.targetId)),
    suggestions: getSuggestedCombinations(graph, selection),
  };
}

export const localRightsGraph: RightsGraph = buildRightsGraph();
