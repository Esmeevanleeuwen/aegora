/** URL and history state stay independent of React and of the rights dataset. */
export type ExplorerNavigation = {
  q: string;
  kind: string;
  context: string;
  research: boolean;
  view: "list" | "network";
  select: string;
};

export type ExplorerHistory = {
  key: string;
  scroll: {list: number; detail: number; window: number};
};

const namespace = "aegoraExplorer";
const identifier = (value: string | null | undefined) =>
  value && /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$/.test(value) ? value : "";

export function parseExplorerNavigation(input: URLSearchParams | string, fallbackContext = "catalogus"): ExplorerNavigation {
  const params = typeof input === "string" ? new URLSearchParams(input) : input;
  return {
    q: (params.get("q") ?? "").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 120),
    kind: identifier(params.get("kind")),
    context: identifier(params.get("context")) || identifier(fallbackContext) || "catalogus",
    research: ["1", "true"].includes(params.get("research") ?? ""),
    view: params.get("view") === "network" ? "network" : "list",
    select: identifier(params.get("select")),
  };
}

export function serializeExplorerNavigation(state: ExplorerNavigation, base?: URLSearchParams): URLSearchParams {
  const params = new URLSearchParams(base);
  const clean = parseExplorerNavigation(new URLSearchParams({
    q: state.q, kind: state.kind, context: state.context,
    research: state.research ? "1" : "", view: state.view, select: state.select,
  }));
  for (const key of ["q", "kind", "context", "research", "view", "select"] as const) {
    const value = clean[key];
    if (key === "research") { if (value) params.set(key, "1"); else params.delete(key); }
    else if (key === "view" && value === "list") params.delete(key);
    else if (value) params.set(key, String(value));
    else params.delete(key);
  }
  return params;
}

export function explorerHref(state: ExplorerNavigation, pathname = "/rechten/verkennen", base?: URLSearchParams): string {
  const path = pathname.startsWith("/") && !pathname.startsWith("//") && !/[\\?#\u0000-\u001f\u007f]/.test(pathname)
    ? pathname : "/rechten/verkennen";
  const query = serializeExplorerNavigation(state, base).toString();
  return query ? `${path}?${query}` : path;
}

export function readExplorerHistory(state: unknown): ExplorerHistory | null {
  if (!state || typeof state !== "object" || Array.isArray(state)) return null;
  const record = (state as Record<string, unknown>)[namespace];
  if (!record || typeof record !== "object" || Array.isArray(record)) return null;
  const {key, scroll} = record as Partial<ExplorerHistory>;
  if (typeof key !== "string" || !/^[a-zA-Z0-9_.:-]{1,120}$/.test(key) || !scroll || typeof scroll !== "object") return null;
  const safe = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.min(value, 10000000) : 0;
  return {key, scroll: {list: safe(scroll.list), detail: safe(scroll.detail), window: safe(scroll.window)}};
}

export function withExplorerHistory(state: unknown, record: ExplorerHistory): Record<string, unknown> {
  const existing = state && typeof state === "object" && !Array.isArray(state) ? state : {};
  return {...existing, [namespace]: record};
}
