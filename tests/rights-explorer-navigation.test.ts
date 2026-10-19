import assert from "node:assert/strict";
import {after, test} from "node:test";
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {createRequire} from "node:module";
import ts from "typescript";

// Exercise the actual helper with the existing TypeScript compiler. The test
// itself runs through Node's built-in TS stripping; no test framework is needed.
const directory = mkdtempSync(join(tmpdir(), "aegora-explorer-navigation-"));
const source = readFileSync(resolve(import.meta.dirname, "../lib/rights-explorer-navigation.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020},
});
writeFileSync(join(directory, "navigation.cjs"), compiled.outputText);
after(() => rmSync(directory, {recursive: true, force: true}));
const require = createRequire(import.meta.url);
const navigation = require(join(directory, "navigation.cjs")) as typeof import("../lib/rights-explorer-navigation");
const {parseExplorerNavigation, serializeExplorerNavigation, explorerHref, readExplorerHistory, withExplorerHistory} = navigation;
type Navigation = ReturnType<typeof parseExplorerNavigation>;

function state(overrides: Partial<Navigation> = {}): Navigation {
  return {...parseExplorerNavigation(""), ...overrides};
}

test("opening an empty URL starts in the catalog without enabling research", () => {
  assert.deepEqual(parseExplorerNavigation(""), {
    q: "", kind: "", context: "catalogus", research: false, view: "list", select: "",
  });
});

test("URL round trips preserve the selected item, context, filters and view", () => {
  const initial = state({
    q: " privacy & lichamelijke integriteit ", kind: "safeguard", context: "CTX_CLOSED_YOUTH_2024",
    research: true, view: "network", select: "S_REVIEW",
  });
  assert.deepEqual(parseExplorerNavigation(serializeExplorerNavigation(initial)), initial);
  assert.deepEqual(parseExplorerNavigation(serializeExplorerNavigation(parseExplorerNavigation(serializeExplorerNavigation(initial)))), initial);
});

test("query typing preserves spaces but strips controls and bounds URL size", () => {
  const q = `  gezondheid\u0000\n\r\t\u007f${"x".repeat(300)}`;
  const parsed = parseExplorerNavigation(new URLSearchParams({q}));
  assert.ok(parsed.q.startsWith("  gezondheid"));
  assert.ok(!/[\u0000-\u001f\u007f]/.test(parsed.q));
  assert.equal(parsed.q.length, 120);
});

test("identifiers are bounded and malformed identifiers cannot become filters", () => {
  const parsed = parseExplorerNavigation(new URLSearchParams({
    context: "javascript:alert(1)", select: "../private", kind: "<script>",
  }), "CTX_SAFE");
  assert.equal(parsed.context, "CTX_SAFE");
  assert.equal(parsed.select, "");
  assert.equal(parsed.kind, "");
  assert.equal(parseExplorerNavigation(new URLSearchParams({select: "x".repeat(121)})).select, "");
  assert.equal(parseExplorerNavigation(new URLSearchParams({select: "x".repeat(120)})).select.length, 120);
  assert.equal(parseExplorerNavigation("context=/unsafe", "//unsafe").context, "catalogus");
});

test("research requires an explicit recognized opt-in value", () => {
  for (const value of ["", "0", "false", "yes", "2", "TRUE"]) {
    assert.equal(parseExplorerNavigation(new URLSearchParams({research: value})).research, false, value);
  }
  for (const value of ["1", "true"]) {
    assert.equal(parseExplorerNavigation(new URLSearchParams({research: value})).research, true, value);
  }
});

test("serializing a public state removes stale research and selected-item parameters", () => {
  const original = new URLSearchParams("research=1&select=OLD&view=network&q=old&utm_source=shared");
  const next = serializeExplorerNavigation(state(), original);
  assert.equal(next.has("research"), false);
  assert.equal(next.has("select"), false);
  assert.equal(next.has("view"), false);
  assert.equal(next.has("q"), false);
  assert.equal(next.get("utm_source"), "shared");
  assert.equal(original.get("research"), "1", "serialization must not mutate the current location");
});

test("unknown query parameters and repeated values survive explorer navigation", () => {
  const base = new URLSearchParams("utm_source=one&utm_source=two&campaign=justice");
  const next = serializeExplorerNavigation(state({select: "R_PRIVACY"}), base);
  assert.deepEqual(next.getAll("utm_source"), ["one", "two"]);
  assert.equal(next.get("campaign"), "justice");
  assert.equal(next.get("select"), "R_PRIVACY");
});

test("share links stay on the explorer route and encode search text as data", () => {
  const initial = state({q: "a & research=1 #", select: "R_PRIVACY"});
  const href = explorerHref(initial);
  const url = new URL(href, "https://www.aegora.nl");
  assert.equal(url.origin, "https://www.aegora.nl");
  assert.equal(url.pathname, "/rechten/verkennen");
  assert.equal(url.searchParams.get("q"), initial.q);
  assert.equal(url.searchParams.has("research"), false);
  assert.equal(url.hash, "");
});

test("unsafe pathnames cannot turn a share link into cross-origin navigation", () => {
  for (const pathname of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/rechten?research=1", "/rechten#fragment", "/rechten\n", "/rechten\u007f"]) {
    const url = new URL(explorerHref(state(), pathname), "https://www.aegora.nl");
    assert.equal(url.origin, "https://www.aegora.nl", pathname);
    assert.equal(url.pathname, "/rechten/verkennen", pathname);
  }
});

test("history writes preserve Next router metadata and leave the prior entry untouched", () => {
  const tree = {segment: "rechten"};
  const prior = {__NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: tree, unrelated: "preserved"};
  const record = {key: "catalogus:R_PRIVACY", scroll: {list: 140, detail: 260, window: 80}};
  const next = withExplorerHistory(prior, record);
  assert.equal(next.__NA, true);
  assert.equal(next.__PRIVATE_NEXTJS_INTERNALS_TREE, tree);
  assert.equal(next.unrelated, "preserved");
  assert.deepEqual(readExplorerHistory(next), record);
  assert.equal(Object.hasOwn(prior, "aegoraExplorer"), false);
});

test("each history entry retains its own selection key and scroll positions", () => {
  const firstRecord = {key: "catalogus:R_PRIVACY", scroll: {list: 10, detail: 20, window: 30}};
  const first = withExplorerHistory({__NA: true}, firstRecord);
  const secondRecord = {key: "CTX_CLOSED:R_INTEGRITY", scroll: {list: 60, detail: 70, window: 80}};
  const second = withExplorerHistory(first, secondRecord);
  assert.deepEqual(readExplorerHistory(first), firstRecord);
  assert.deepEqual(readExplorerHistory(second), secondRecord);
});

test("foreign and malformed history entries are ignored safely", () => {
  for (const entry of [null, undefined, 1, "foreign", [], {}, {aegoraExplorer: []}, {aegoraExplorer: {key: "bad key", scroll: {}}}, {aegoraExplorer: {key: "x".repeat(121), scroll: {}}}]) {
    assert.equal(readExplorerHistory(entry), null);
  }
  assert.deepEqual(readExplorerHistory(withExplorerHistory([], {key: "safe", scroll: {list: 0, detail: 0, window: 0}})), {
    key: "safe", scroll: {list: 0, detail: 0, window: 0},
  });
});

test("restoring scroll positions never returns negative, infinite or unbounded values", () => {
  const malformed = {aegoraExplorer: {key: "safe", scroll: {list: -50, detail: Number.POSITIVE_INFINITY, window: 1e20}}};
  assert.deepEqual(readExplorerHistory(malformed), {
    key: "safe", scroll: {list: 0, detail: 0, window: 10000000},
  });
  assert.deepEqual(readExplorerHistory({aegoraExplorer: {key: "safe", scroll: {list: "500", detail: Number.NaN, window: null}}}), {
    key: "safe", scroll: {list: 0, detail: 0, window: 0},
  });
});
