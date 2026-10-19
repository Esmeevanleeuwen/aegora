import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

// Use the project's TypeScript compiler without adding a test runtime dependency.
const temporaryDirectory = mkdtempSync(join(tmpdir(), "aegora-rights-network-"));
const repositoryRoot = resolve(import.meta.dirname, "../..");
for (const name of ["basic-rights-data", "public-rights-data", "rights-data", "rights-network-data", "rights-network"]) {
  const source = readFileSync(join(repositoryRoot, "lib", `${name}.ts`), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  writeFileSync(join(temporaryDirectory, `${name}.js`), output.outputText);
}
after(() => rmSync(temporaryDirectory, { recursive: true, force: true }));

const require = createRequire(import.meta.url);
const {
  buildRightsGraph, localRightsGraph, resolveRightId, getRelatedRights,
  getSuggestedCombinations, combineRights,
} = require(join(temporaryDirectory, "rights-network.js"));
const { publicRules } = require(join(temporaryDirectory, "public-rights-data.js"));
const { basicRights } = require(join(temporaryDirectory, "basic-rights-data.js"));
const { rightsCatalog } = require(join(temporaryDirectory, "rights-data.js"));
const { rightsAliases } = require(join(temporaryDirectory, "rights-network-data.js"));
const graph = localRightsGraph;

test("every existing right has a stable reachable ID and keeps its original source", () => {
  const ids = new Set(graph.nodes.map((node) => node.id));
  assert.equal(ids.size, graph.nodes.length);
  const originalUrls = new Set([...publicRules, ...basicRights, ...rightsCatalog].map((right) => right.sourceUrl));
  for (const node of graph.nodes) {
    assert.equal(node.slug, node.id);
    assert.ok(originalUrls.has(node.sourceUrl), `Unknown source for ${node.id}`);
    assert.ok(node.title && node.summary && node.boundary && node.sourceTitle);
  }
  for (const rule of publicRules) {
    assert.equal(resolveRightId(graph, rule.id), rule.id);
    const node = graph.nodes.find((node) => node.id === rule.id);
    for (const field of ["summary", "boundary", "appliesWhen", "practicalNote", "nextStep", "sourceUrl", "sourceTitle", "sourceCheckedAt"]) {
      assert.deepEqual(node[field], rule[field], `${rule.id}: ${field} changed`);
    }
  }
  for (const right of basicRights) {
    const canonical = `basis-${right.id}`;
    for (const alias of [right.id, canonical, `basic-${right.id}`]) assert.equal(resolveRightId(graph, alias), canonical);
    const node = graph.nodes.find((node) => node.id === canonical);
    for (const field of ["title", "summary", "boundary", "sourceUrl", "sourceTitle"]) assert.equal(node[field], right[field]);
  }
  for (const right of rightsCatalog) {
    const canonical = rightsAliases[right.id] ?? right.id;
    for (const alias of [right.id, `catalog-${right.id}`, `recht-${right.id}`]) {
      assert.equal(resolveRightId(graph, alias), canonical, alias);
    }
    assert.ok(ids.has(canonical));
  }
});

test("the graph has no missing targets, self links, duplicate pairs or isolated rights", () => {
  const ids = new Set(graph.nodes.map((node) => node.id));
  const pairs = new Set();
  const edgeIds = new Set();
  const connected = new Set();
  for (const edge of graph.edges) {
    assert.ok(ids.has(edge.sourceId) && ids.has(edge.targetId));
    assert.notEqual(edge.sourceId, edge.targetId);
    const pair = [edge.sourceId, edge.targetId].sort().join("--");
    assert.ok(!pairs.has(pair), `Duplicate pair ${pair}`);
    assert.ok(!edgeIds.has(edge.id));
    assert.ok(edge.label && edge.explanation);
    assert.ok(edge.priority >= 0 && edge.priority <= 100);
    pairs.add(pair);
    edgeIds.add(edge.id);
    connected.add(edge.sourceId);
    connected.add(edge.targetId);
  }
  for (const id of ids) assert.ok(connected.has(id), `Isolated right ${id}`);
  assert.ok(graph.edges.length < graph.nodes.length * 2, "Network should remain sparse rather than all-to-all");
});

test("every local right belongs to one connected network", () => {
  const reached = new Set([graph.nodes[0].id]);
  const queue = [graph.nodes[0].id];
  while (queue.length > 0) {
    for (const { node } of getRelatedRights(graph, queue.shift())) {
      if (reached.has(node.id)) continue;
      reached.add(node.id);
      queue.push(node.id);
    }
  }
  assert.deepEqual([...reached].sort(), graph.nodes.map((node) => node.id).sort());
});

test("saved combinations are connected through real links and have no invented popularity", () => {
  assert.equal(graph.combinations.length, 8);
  for (const combination of graph.combinations) {
    assert.equal(combination.openCount, 0);
    assert.equal(new Set(combination.nodeIds).size, combination.nodeIds.length);
    const selection = combineRights(graph, combination.nodeIds);
    assert.deepEqual(selection.nodeIds, combination.nodeIds);
    const reached = new Set([combination.nodeIds[0]]);
    let previousSize;
    do {
      previousSize = reached.size;
      for (const edge of selection.edges) {
        if (reached.has(edge.sourceId)) reached.add(edge.targetId);
        if (reached.has(edge.targetId)) reached.add(edge.sourceId);
      }
    } while (reached.size !== previousSize);
    assert.equal(reached.size, combination.nodeIds.length, `Disconnected combination ${combination.id}`);
    for (const edge of selection.edges) assert.ok(graph.edges.includes(edge));
  }
});

test("recommendations are repeatable and only point to directly stored relationships", () => {
  const first = getRelatedRights(graph, "inzage-en-kopie-dossier", ["privacy"]);
  assert.deepEqual(first, getRelatedRights(graph, "patient-dossier", ["privacy"]));
  assert.deepEqual(first, getRelatedRights(graph, "patient-dossier", ["privacy"]));
  assert.ok(first.length > 0);
  assert.equal(new Set(first.map(({ node }) => node.id)).size, first.length);
  for (const item of first) {
    assert.ok(graph.edges.includes(item.edge));
    assert.ok([item.edge.sourceId, item.edge.targetId].includes("patient-dossier"));
    assert.ok([item.edge.sourceId, item.edge.targetId].includes(item.node.id));
  }
  const suggestions = getSuggestedCombinations(graph, ["patient-informatie-keuze", "patient-klacht"]);
  assert.equal(suggestions[0].id, "zorg-informatie-dossier-klacht");
  assert.deepEqual(suggestions, getSuggestedCombinations(graph, ["patient-klacht", "patient-informatie-keuze"]));
  for (const combination of suggestions) assert.ok(graph.combinations.includes(combination));
});

test("each saved combination ranks a meaningful overlap ahead of unrelated routes without changing usage", () => {
  for (const combination of graph.combinations) {
    const selectedIds = combination.nodeIds.slice(0, 2);
    const suggestions = getSuggestedCombinations(graph, selectedIds);
    assert.equal(suggestions[0].id, combination.id, `Expected best overlap for ${combination.id}`);
    for (const suggestion of suggestions) {
      const hasOverlap = suggestion.nodeIds.some((id) => selectedIds.includes(id));
      const hasSavedConnection = graph.edges.some((edge) => (
        selectedIds.includes(edge.sourceId) && suggestion.nodeIds.includes(edge.targetId)
      ) || (
        selectedIds.includes(edge.targetId) && suggestion.nodeIds.includes(edge.sourceId)
      ));
      assert.ok(hasOverlap || hasSavedConnection, `${suggestion.id} has no explained relation to selection`);
      assert.equal(suggestion.openCount, 0);
    }
    assert.deepEqual(suggestions, getSuggestedCombinations(graph, [...selectedIds].reverse()));
  }
  for (const combination of graph.combinations) assert.equal(combination.openCount, 0);
});

test("invalid IDs and aliases cannot create phantom nodes, edges or selections", () => {
  assert.equal(resolveRightId(graph, "missing-right"), null);
  assert.equal(resolveRightId(graph, ""), null);
  assert.deepEqual(getRelatedRights(graph, "missing-right"), []);
  const custom = combineRights(graph, ["privacy", "missing-right", "privacy", "catalog-inzage-en-kopie-dossier", "patient-dossier"]);
  assert.deepEqual(custom.nodeIds, ["privacy", "patient-dossier"]);
  assert.deepEqual(custom.edges, []);
  assert.deepEqual(getSuggestedCombinations(graph, ["missing-right"]), getSuggestedCombinations(graph, []));
  assert.deepEqual(combineRights(graph, ["missing-right"]).nodeIds, []);
  const disconnected = { ...graph.combinations[0], id: "disconnected", nodeIds: ["privacy", "wettelijke-vakantie"] };
  const duplicates = { ...graph.combinations[0], id: "duplicates", nodeIds: ["privacy", "privacy"] };
  const malformedGraph = { ...graph, combinations: [...graph.combinations, disconnected, duplicates] };
  assert.ok(!getSuggestedCombinations(malformedGraph, ["privacy"]).some((combination) => ["disconnected", "duplicates"].includes(combination.id)));
});

test("partial database catalogues retain local links and connect new rules with one explained route", () => {
  const changed = { ...publicRules[0], title: "Published database title" };
  const extra = { ...publicRules[0], id: "new-published-rule", title: "New published rule", topic: "Nieuw onderwerp" };
  const secondExtra = { ...extra, id: "another-published-rule", title: "Another published rule" };
  const extended = buildRightsGraph([changed, extra, secondExtra]);
  assert.equal(extended.nodes.length, graph.nodes.length + 2);
  assert.equal(extended.nodes.find((node) => node.id === changed.id).title, changed.title);
  assert.equal(extended.nodes.find((node) => node.id === extra.id).sourceUrl, extra.sourceUrl);
  const newLinks = extended.edges.filter((edge) => edge.sourceId === extra.id);
  assert.equal(newLinks.length, 1);
  assert.equal(newLinks[0].relation, "context");
  assert.match(newLinks[0].explanation, /leesroute/i);
  assert.ok(getRelatedRights(extended, extra.id).some(({ node }) => node.id === "gelijke-behandeling"));
  assert.ok(getRelatedRights(extended, secondExtra.id).some(({ node }) => node.id === extra.id));
  assert.equal(graph.nodes.find((node) => node.id === changed.id).title, publicRules[0].title, "Build must not mutate the default graph");
});
