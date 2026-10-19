"use client";

import Link from "next/link";
import {ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, ChevronRight, Copy, FileText, FlaskConical, GitBranch, Info, Layers3, Link2, List, LoaderCircle, Network, RefreshCw, Scale, Search, ShieldCheck, SlidersHorizontal, X} from "lucide-react";
import {useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type CSSProperties} from "react";
import type {ExplorerContext, ExplorerDetail, ExplorerIndex, ExplorerNeighbors, ExplorerProof, ExplorerSource} from "@/lib/rights-explorer-model";
import {explorerHref, parseExplorerNavigation, readExplorerHistory, withExplorerHistory, type ExplorerHistory, type ExplorerNavigation} from "@/lib/rights-explorer-navigation";
import styles from "./rights-workspace.module.css";

type Resource = {revision: string};
type Remote<T> = {key: string; data?: T; error?: string; loading: boolean};
type RequestQuery = {context: string; research: boolean; id?: string};
type CacheEntry = {etag: string; revision: string; value: Resource; bytes: number};
const responseCache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 24;
const MAX_CACHE_BYTES = 2 * 1024 * 1024;
let cacheRevision = "";
const connectionLabels: Record<string, string> = {
  navigation: "Leesroute", normative: "Juridische norm", inspection_finding: "Inspectiebevinding",
  reported_mechanism: "Gerapporteerd verband", analytic_design: "Analytische koppeling",
  analytic_hypothesis: "Hypothese", derived_hypothesis: "Afgeleide hypothese",
  structural_derivation: "Structurele afleiding", mathematical_bound: "Wiskundige grens",
};

function requestKey(part: string, query: RequestQuery) {
  return new URLSearchParams({part, context: query.context, research: query.research ? "1" : "0", ...(query.id ? {id: query.id} : {})}).toString();
}

async function loadResource<T extends Resource>(key: string, signal: AbortSignal): Promise<T> {
  const cached = responseCache.get(key);
  const response = await fetch(`/api/rechten/verkennen?${key}`, {
    signal, cache: "no-store", headers: cached ? {"If-None-Match": cached.etag} : {},
  });
  // A cache entry is displayed only after the server confirms its current revision.
  if (response.status === 304 && cached) return cached.value as T;
  if (!response.ok) throw new Error(response.status === 404 ? "Dit onderdeel is niet beschikbaar binnen deze context." : "Laden is niet gelukt. Probeer het opnieuw.");
  const text = await response.text();
  let value: T;
  try { value = JSON.parse(text) as T; } catch { throw new Error("De gegevens konden niet worden gelezen."); }
  if (!value || typeof value.revision !== "string") throw new Error("De gegevens konden niet worden gelezen.");
  if (cacheRevision && cacheRevision !== value.revision) responseCache.clear();
  cacheRevision = value.revision;
  const etag = response.headers.get("ETag");
  if (etag && text.length * 2 <= MAX_CACHE_BYTES) {
    responseCache.delete(key);
    responseCache.set(key, {etag, revision: value.revision, value, bytes: text.length * 2});
    let bytes = [...responseCache.values()].reduce((sum, entry) => sum + entry.bytes, 0);
    while (responseCache.size > MAX_CACHE_ENTRIES || bytes > MAX_CACHE_BYTES) {
      const oldest = responseCache.keys().next().value;
      if (!oldest) break;
      bytes -= responseCache.get(oldest)!.bytes;
      responseCache.delete(oldest);
    }
  }
  return value;
}

function useResource<T extends Resource>(part: string, query: RequestQuery, options: {initial?: T; enabled?: boolean; refresh?: number} = {}) {
  const {initial, enabled = true, refresh = 0} = options;
  const key = requestKey(part, query);
  const [retry, setRetry] = useState(0);
  const cycle = `${key}:${refresh}:${retry}`;
  const [remote, setRemote] = useState<Remote<T>>(() => ({key: cycle, data: initial, loading: !initial && enabled}));
  const initialRef = useRef({key, value: initial});
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      if (!enabled) { setRemote({key: cycle, loading: false}); return; }
      setRemote({key: cycle, loading: true});
      try {
        const data = await loadResource<T>(key, controller.signal);
        if (!controller.signal.aborted) setRemote({key: cycle, data, loading: false});
      } catch (error) {
        if (!controller.signal.aborted) setRemote({key: cycle, error: error instanceof TypeError ? "Er is geen verbinding. Probeer het opnieuw." : error instanceof Error ? error.message : "Laden is niet gelukt.", loading: false});
      }
    }
    // Initial server data is current for this render; later reads always revalidate.
    if (enabled && initialRef.current.value && initialRef.current.key === key && retry === 0 && refresh === 0) { initialRef.current.value = undefined; return; }
    initialRef.current.value = undefined;
    void load();
    return () => controller.abort();
  }, [cycle, enabled, key, refresh, retry]);
  return {...(remote.key === cycle ? remote : {key: cycle, loading: enabled}), reload: () => setRetry(value => value + 1)};
}

function ContextStamp({context}: {context: ExplorerContext}) {
  return <span className={styles.contextStamp}><span className={styles.contextDot}/>{context.label}<span className={styles.stampDate}>{context.snapshot ? `Peildatum ${context.snapshot}` : "Algemene uitleg"}</span></span>;
}

function ItemIcon({kind, size = 18}: {kind: string; size?: number}) {
  const Icon = kind === "right" ? Scale : kind === "safeguard" || kind === "norm" ? ShieldCheck : kind.includes("mechanism") ? GitBranch : kind === "procedure" ? Layers3 : BookOpen;
  return <Icon size={size} aria-hidden="true"/>;
}

function StatusMessage({loading, error, retry}: {loading?: boolean; error?: string; retry?: () => void}) {
  return <div className={styles.status} role={error ? "alert" : "status"}>
    {loading ? <><LoaderCircle size={21} className={styles.spinner} aria-hidden="true"/><span>Gegevens laden…</span></> : <><Info size={21} aria-hidden="true"/><p>{error}</p>{retry && <button type="button" onClick={retry}><RefreshCw size={15}/> Opnieuw proberen</button>}</>}
  </div>;
}

function SourceList({sources}: {sources: ExplorerSource[]}) {
  const documents = new Map<string, {source: ExplorerSource; locators: Set<string>}>();
  for (const source of sources) {
    const key = `${source.id}:${source.url ?? ""}`;
    const document = documents.get(key) ?? {source, locators: new Set<string>()};
    if (source.locator) document.locators.add(source.locator);
    documents.set(key, document);
  }
  function safeUrl(value: string | null) {
    try { const url = new URL(value ?? ""); return ["http:", "https:"].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
  }
  return <ul className={styles.sources}>{[...documents.entries()].map(([key, {source, locators}]) => {
    const href = safeUrl(source.url);
    return <li key={key}><FileText size={16} aria-hidden="true"/><div>{href ? <a href={href} target="_blank" rel="noopener noreferrer">{source.title}<ArrowUpRight size={13}/></a> : <span>{source.title}</span>}
      {source.version && <small>{source.version}</small>}{locators.size > 0 && <small>{[...locators].join(" · ")}</small>}
      {source.limitations && <small>{source.limitations}</small>}</div></li>;
  })}</ul>;
}

function ProofDisclosure({proof, context, research}: {proof: ExplorerDetail["proofs"][number]; context: string; research: boolean}) {
  const [open, setOpen] = useState(false);
  const resource = useResource<ExplorerProof>("proof", {id: proof.id, context, research}, {enabled: open});
  return <div className={styles.proof}>
    <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}><FileText size={16} aria-hidden="true"/><span>{proof.label}</span><ChevronDown size={16} className={open ? styles.rotated : ""}/></button>
    {open && <div className={styles.proofBody}>{resource.loading || resource.error ? <StatusMessage loading={resource.loading} error={resource.error} retry={resource.reload}/> : resource.data && <>
      <ol>{resource.data.steps.map(step => <li key={step.id}><span className={styles.textLabel}>{step.kindLabel}</span><p>{step.statement}</p>{step.rule && <small>{step.rule.description}</small>}{step.limitations && <p className={styles.note}>{step.limitations}</p>}{step.sources.length > 0 && <SourceList sources={step.sources}/>}</li>)}</ol>
      {resource.data.truncated && <p className={styles.note}>De onderbouwing is begrensd. Open de bron voor de volledige context.</p>}
    </>}</div>}
  </div>;
}

export type RightsDetailPanelProps = {
  detail: ExplorerDetail;
  onNavigate: (id: string) => void;
  onBack?: () => void;
  headingId?: string;
  headingLevel?: 1 | 2;
};

/** Shared content for the explorer and any direct right page; no nested modal. */
export function RightsDetailPanel({detail, onNavigate, onBack, headingId, headingLevel = 2}: RightsDetailPanelProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return <article className={styles.detailContent}>
    {onBack && <button type="button" className={styles.mobileBack} onClick={onBack}><ArrowLeft size={17}/> Terug naar overzicht</button>}
    <div className={styles.detailKicker}><span><ItemIcon kind={detail.item.kind} size={15}/>{detail.item.kindLabel}</span><span>{detail.item.topic}</span></div>
    <Heading id={headingId} tabIndex={-1}>{detail.item.title}</Heading>
    <p className={styles.description}>{detail.description}</p>
    <ContextStamp context={detail.context}/>
    {detail.research && <p className={styles.researchNotice}><FlaskConical size={16}/> Onderzoeksweergave. Een hypothese is geen vastgestelde juridische conclusie.</p>}
    {(detail.conditions.length > 0 || detail.exceptions.length > 0) && <section className={styles.conditions} aria-label="Voorwaarden en uitzonderingen">
      {detail.conditions.length > 0 && <div><h3><ShieldCheck size={16}/> Wanneer geldt dit?</h3><ul>{detail.conditions.map(text => <li key={text}>{text}</li>)}</ul></div>}
      {detail.exceptions.length > 0 && <div className={styles.exceptions}><h3><Info size={16}/> Grenzen en uitzonderingen</h3><ul>{detail.exceptions.map(text => <li key={text}>{text}</li>)}</ul></div>}
    </section>}
    {detail.normGroups.map(group => <section className={styles.section} key={group.id}>
      <div className={styles.sectionHeading}><h3><ShieldCheck size={17}/>{group.title}</h3><span>{group.requirements.length} normen</span></div>
      {group.scope.length > 0 && <p className={styles.note}>{group.scope.join(" · ")}</p>}
      <ul className={styles.requirements}>{group.requirements.map(requirement => <li key={requirement.id}><Check size={15} aria-hidden="true"/><div><strong>{requirement.title}</strong>{requirement.conditions.map(text => <p key={text}>{text}</p>)}{requirement.exceptions.map(text => <p className={styles.inlineException} key={text}><Info size={13}/>{text}</p>)}</div></li>)}</ul>
      {group.limitations.map(text => <p className={styles.note} key={text}>{text}</p>)}
      <SourceList sources={group.requirements.flatMap(requirement => requirement.sources)}/>
    </section>)}
    <section className={styles.section}>
      <div className={styles.sectionHeading}><h3><Link2 size={17}/> Verbonden onderdelen</h3><span>{detail.relations.length}</span></div>
      {detail.relations.length ? <ul className={styles.related}>{detail.relations.map(relation => <li key={relation.item.id}><button type="button" onClick={() => onNavigate(relation.item.id)}><div><span className={styles.relatedTitle}>{relation.item.title}</span><span className={styles.reasonLabels}>{[...new Set(relation.reasons.map(reason => reason.kindLabel))].join(" · ")}</span></div><ArrowUpRight size={17}/></button><details><summary>Waarom verbonden? <span>{relation.reasons.length}</span></summary><ul>{relation.reasons.map(reason => <li key={reason.id}><span className={styles.textLabel}>{reason.kindLabel}</span><p>{reason.statement}</p></li>)}</ul></details></li>)}</ul>
        : <p className={styles.note}>Er zijn in deze context geen directe verbindingen opgeslagen.</p>}
    </section>
    {detail.proofs.length > 0 && <section className={styles.section}><div className={styles.sectionHeading}><h3><FileText size={17}/> Onderbouwing</h3><span>Op aanvraag</span></div><p className={styles.note}>Open alleen de bewijsstap die je wilt bekijken.</p>{detail.proofs.map(proof => <ProofDisclosure key={`${detail.revision}:${detail.context.id}:${proof.id}:${detail.research}`} proof={proof} context={detail.context.id} research={detail.research}/>)}</section>}
    {detail.sources.length > 0 && <details className={styles.sourceOverview}><summary>Alle bronnen bij dit onderdeel <span>{new Set(detail.sources.map(source => source.id)).size}</span><ChevronDown size={16}/></summary><SourceList sources={detail.sources}/></details>}
    <p className={styles.endNote}>Controleer de context en de bron. Een verbinding toont een samenhang en beoordeelt geen persoonlijke situatie.</p>
  </article>;
}

function LocalNetwork({data, onNavigate}: {data: ExplorerNeighbors; onNavigate: (id: string) => void}) {
  const focus = data.nodes.find(node => node.id === data.focusId);
  const neighbors = data.nodes.filter(node => node.id !== data.focusId).slice(0, 8);
  return <div className={styles.localNetwork}>
    <div className={styles.networkCaption}><GitBranch size={15}/> Direct verbonden · {neighbors.length} onderdelen</div>
    <div className={styles.graphCanvas} style={{"--network-rows": Math.ceil(neighbors.length / 2)} as CSSProperties}>
      <svg className={styles.graphLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{neighbors.map((node, index) => <path key={node.id} d={`M 50 12 C 50 ${22 + Math.floor(index / 2) * 22}, ${index % 2 ? 75 : 25} 20, ${index % 2 ? 75 : 25} ${34 + Math.floor(index / 2) * 20}`}/>)}</svg>
      <div className={styles.focusNode}><Scale size={17}/><span>{focus?.title ?? "Geselecteerd onderdeel"}</span></div>
      {neighbors.map((node, index) => { const edges = data.edges.filter(edge => edge.sourceId === node.id || edge.targetId === node.id); return <button key={node.id} type="button" className={styles.graphNode} style={{left: index % 2 ? "53%" : "3%", top: `${26 + Math.floor(index / 2) * 20}%`}} onClick={() => onNavigate(node.id)}><ItemIcon kind={node.kind} size={14}/><span><strong>{node.title}</strong><small>{edges[0]?.label ?? "Opgeslagen koppeling"}</small></span><ArrowUpRight size={13}/></button>; })}
    </div>
    {neighbors.length > 0 && <ul className={styles.networkLegend}>{neighbors.map(node => { const edges = data.edges.filter(edge => edge.sourceId === node.id || edge.targetId === node.id); return <li key={node.id}><strong>{node.title}</strong><span>{[...new Set(edges.map(edge => `${edge.label} · ${connectionLabels[edge.kind] ?? "Opgeslagen koppeling"}`))].join("; ")}</span></li>; })}</ul>}
    {neighbors.length === 0 && <p className={styles.note}>Geen directe verbindingen in deze context.</p>}
    <p className={styles.networkHint}>Klik op een onderdeel om vanuit daar verder te verkennen. De lijnen geven opgeslagen verbindingen weer.</p>
  </div>;
}

export type RightsWorkspaceProps = {
  initialIndex: ExplorerIndex;
  initialSelection?: string;
  initialDetail?: ExplorerDetail;
  initialNavigation?: Partial<ExplorerNavigation>;
  embedded?: boolean;
};

export function RightsWorkspace({initialIndex, initialSelection, initialDetail, initialNavigation, embedded = false}: RightsWorkspaceProps) {
  const [navigation, setNavigation] = useState<ExplorerNavigation>(() => ({q: "", kind: "", context: initialIndex.context.id, research: initialIndex.research, view: "list", select: initialSelection ?? initialDetail?.item.id ?? "", ...initialNavigation}));
  const navRef = useRef(navigation);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [copied, setCopied] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const pendingScroll = useRef<ExplorerHistory["scroll"] | null>(null);
  const returnFocus = useRef("");
  const pendingFocus = useRef(false);
  const lastListWindow = useRef(0);
  const index = useResource<ExplorerIndex>("index", navigation, {initial: initialIndex, refresh});
  const detail = useResource<ExplorerDetail>("detail", {context: navigation.context, research: navigation.research, id: navigation.select}, {initial: initialDetail, enabled: Boolean(navigation.select), refresh});
  const neighborhood = useResource<ExplorerNeighbors>("neighbors", {context: navigation.context, research: navigation.research, id: navigation.select}, {enabled: navigation.view === "network" && Boolean(navigation.select), refresh});
  const currentIndex = index.data;
  const query = useDeferredValue(navigation.q).toLocaleLowerCase("nl").trim();
  const kinds = useMemo(() => [...new Map((currentIndex?.items ?? []).map(item => [item.kind, item.kindLabel])).entries()], [currentIndex]);
  const filtered = useMemo(() => (currentIndex?.items ?? []).filter(item => (!navigation.kind || item.kind === navigation.kind) && (!query || `${item.title} ${item.summary} ${item.topic}`.toLocaleLowerCase("nl").includes(query))), [currentIndex, navigation.kind, query]);
  const context = currentIndex?.context ?? initialIndex.contexts.find(item => item.id === navigation.context) ?? initialIndex.context;

  const rememberScroll = useCallback(() => {
    if (pendingScroll.current) return;
    const history = readExplorerHistory(window.history.state);
    window.history.replaceState(withExplorerHistory(window.history.state, {key: history?.key ?? `rights-${Date.now()}`, scroll: {list: listRef.current?.scrollTop ?? 0, detail: detailRef.current?.scrollTop ?? 0, window: window.scrollY}}), "");
  }, []);

  const navigate = useCallback((patch: Partial<ExplorerNavigation>, replace = false) => {
    rememberScroll();
    const next = {...navRef.current, ...patch};
    const resetting = "context" in patch || "research" in patch || "kind" in patch || "q" in patch;
    const mobileSelection = Boolean(patch.select) && window.matchMedia("(max-width: 900px)").matches;
    if (patch.select && !navRef.current.select) lastListWindow.current = window.scrollY;
    const returningToList = patch.select === "" && Boolean(navRef.current.select);
    const scroll = {list: resetting ? 0 : listRef.current?.scrollTop ?? 0, detail: 0, window: mobileSelection ? 0 : returningToList ? resetting ? 0 : lastListWindow.current : window.scrollY};
    if (patch.select === "") returnFocus.current = navRef.current.select;
    if ("select" in patch) pendingFocus.current = true;
    const href = explorerHref(next, window.location.pathname, new URLSearchParams(window.location.search));
    const state = withExplorerHistory(window.history.state, {key: `rights-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, scroll});
    window.history[replace ? "replaceState" : "pushState"](state, "", href);
    navRef.current = next;
    setNavigation(next);
    pendingScroll.current = scroll;
    if (patch.select) setFiltersOpen(false);
    if (mobileSelection) window.scrollTo({top: 0, behavior: "instant"});
  }, [rememberScroll]);

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const sync = () => {
      const parsed = parseExplorerNavigation(window.location.search, initialIndex.context.id);
      if (!parsed.select) returnFocus.current = navRef.current.select;
      pendingFocus.current = true;
      navRef.current = parsed;
      setNavigation(parsed);
      pendingScroll.current = readExplorerHistory(window.history.state)?.scroll ?? {list: 0, detail: 0, window: 0};
    };
    let lastFocus = 0;
    let scrollFrame = 0;
    const onFocus = () => {
      if (document.visibilityState !== "visible" || Date.now() - lastFocus < 500) return;
      lastFocus = Date.now();
      rememberScroll();
      pendingScroll.current ??= {list: listRef.current?.scrollTop ?? 0, detail: detailRef.current?.scrollTop ?? 0, window: window.scrollY};
      if (detailRef.current?.contains(document.activeElement)) pendingFocus.current = true;
      setRefresh(value => value + 1);
    };
    const onScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; if (!navRef.current.select && !pendingScroll.current) lastListWindow.current = window.scrollY; rememberScroll(); }); };
    window.addEventListener("popstate", sync);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("scroll", onScroll, {passive: true});
    if (window.location.search) sync();
    rememberScroll();
    return () => {
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener("popstate", sync);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollFrame);
    };
  }, [initialIndex.context.id, rememberScroll]);

  useEffect(() => {
    if (index.loading || (navigation.select && detail.loading) || !pendingScroll.current) return;
    const scroll = pendingScroll.current;
    pendingScroll.current = null;
    const frame = requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = scroll.list;
      if (detailRef.current) detailRef.current.scrollTop = scroll.detail;
      window.scrollTo({top: scroll.window, behavior: "instant"});
      if (pendingFocus.current) {
        pendingFocus.current = false;
        const target = navigation.select ? detailRef.current?.querySelector<HTMLElement>("h2") : listRef.current?.querySelector<HTMLElement>(`[data-explorer-item="${CSS.escape(returnFocus.current)}"]`);
        (target ?? listRef.current)?.focus({preventScroll: true});
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [index.loading, detail.loading, navigation.select]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (filtersOpen) setFiltersOpen(false);
      else if (navRef.current.select && window.matchMedia("(max-width: 900px)").matches) navigate({select: ""});
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen, navigate]);

  async function share() {
    try { await navigator.clipboard.writeText(window.location.href); setCopied("Link gekopieerd"); }
    catch { setCopied("Gebruik de adresbalk om deze selectie te delen."); }
    window.setTimeout(() => setCopied(""), 3500);
  }

  return <div className={`${styles.workspace} ${navigation.select ? styles.hasSelection : ""} ${embedded ? styles.embedded : ""}`}>
    <div className={styles.workspaceTop}><div><span className={styles.eyebrow}>AEGORA / RECHTEN VERKENNEN</span><h1>Begrijp hoe rechten samenhangen<span>.</span></h1><p>Begin bij één onderwerp. Ontdek de regels, voorwaarden en verbindingen eromheen.</p></div><Link href="/rechten/netwerk" className={styles.combinationsLink}><Layers3 size={17}/> Opgeslagen combinaties <ArrowUpRight size={16}/></Link></div>
    <div className={styles.contextBar}><label><span>Context</span><select aria-label="Kies een context" value={navigation.context} onChange={event => navigate({context: event.target.value, select: "", kind: ""})}>{(currentIndex?.contexts ?? initialIndex.contexts).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><ChevronDown size={14} aria-hidden="true"/></label><ContextStamp context={context}/><div className={styles.contextActions}><button type="button" onClick={() => setFiltersOpen(value => !value)} className={styles.filterToggle} aria-expanded={filtersOpen}><SlidersHorizontal size={16}/> Filters</button><button type="button" onClick={share} aria-label="Deel deze selectie"><Copy size={16}/><span>Delen</span></button></div></div>
    <div className={styles.columns}>
      <aside className={`${styles.sidebar} ${filtersOpen ? styles.filtersOpen : ""}`} aria-label="Zoeken en filteren"><div className={styles.sidebarTitle}>Verfijn je overzicht<button type="button" onClick={() => setFiltersOpen(false)} aria-label="Sluit filters"><X size={17}/></button></div><label className={styles.search}><Search size={17}/><input aria-label="Zoek rechten en onderwerpen" placeholder="Zoek een recht of onderwerp" maxLength={120} value={navigation.q} onChange={event => navigate({q: event.target.value}, true)}/>{navigation.q && <button type="button" aria-label="Wis zoekopdracht" onClick={() => navigate({q: ""}, true)}><X size={14}/></button>}</label>
        <div className={styles.filterHeading}>SOORT ONDERDEEL</div><div className={styles.kindFilters}><button type="button" className={!navigation.kind ? styles.activeFilter : ""} onClick={() => navigate({kind: ""})}><Layers3 size={16}/><span>Alle onderdelen</span><small>{currentIndex?.items.length ?? "–"}</small></button>{kinds.map(([kind, label]) => <button type="button" key={kind} className={navigation.kind === kind ? styles.activeFilter : ""} onClick={() => navigate({kind})}><ItemIcon kind={kind} size={16}/><span>{label}</span><small>{currentIndex?.items.filter(item => item.kind === kind).length}</small></button>)}</div>
        <div className={styles.researchFilter}><div><FlaskConical size={17}/><strong>Onderzoek meenemen</strong><label className={styles.switch}><input type="checkbox" checked={navigation.research} onChange={event => navigate({research: event.target.checked, select: "", kind: ""})}/><span/><span className={styles.srOnly}>Toon ook hypothesen en analytische verbanden</span></label></div><p>Toont ook hypotheses en analytische verbanden. Deze krijgen een eigen label.</p></div>
        <div className={styles.sidebarNote}><Info size={17}/><p>{context.description}</p></div>
      </aside>
      <section className={styles.results} aria-label="Onderdelen"><div className={styles.resultsHeader}><div><h2>{navigation.q ? "Zoekresultaten" : "Alle onderdelen"}</h2><span>{filtered.length} onderwerpen</span></div><div className={styles.viewToggle} aria-label="Weergave"><button type="button" aria-pressed={navigation.view === "list"} aria-label="Lijstweergave" onClick={() => navigate({view: "list"})}><List size={17}/></button><button type="button" aria-pressed={navigation.view === "network"} aria-label="Netwerkweergave" onClick={() => navigate({view: "network"})}><Network size={17}/></button></div></div>
        <div className={styles.resultsScroll} ref={listRef} tabIndex={-1} onScroll={rememberScroll}>
          {index.loading || index.error ? <StatusMessage loading={index.loading} error={index.error} retry={index.reload}/>
            : navigation.view === "network" && navigation.select ? neighborhood.loading || neighborhood.error ? <StatusMessage loading={neighborhood.loading} error={neighborhood.error} retry={neighborhood.reload}/> : neighborhood.data && <LocalNetwork data={neighborhood.data} onNavigate={id => navigate({select: id})}/>
              : <>{navigation.view === "network" && <p className={styles.selectHint}>Kies een onderdeel om zijn directe netwerk te openen.</p>}<ul className={styles.resultList}>{filtered.map(item => <li key={item.id}><button type="button" data-explorer-item={item.id} aria-current={navigation.select === item.id ? "true" : undefined} onClick={() => navigate({select: item.id})}><span className={styles.itemIcon}><ItemIcon kind={item.kind}/></span><span className={styles.resultText}><span className={styles.resultMeta}>{item.kindLabel}<span>·</span>{item.topic}</span><strong>{item.title}</strong><span className={styles.resultSummary}>{item.summary}</span><span className={styles.resultFoot}><Link2 size={12}/>{item.relationCount} verbindingen</span></span><ChevronRight className={styles.resultArrow} size={17}/></button></li>)}</ul>{!filtered.length && <div className={styles.emptyResults}><Search size={25}/><h3>Geen onderdelen gevonden</h3><p>Probeer een kortere zoekterm of wis het filter.</p><button type="button" onClick={() => navigate({q: "", kind: ""})}>Filters wissen <ArrowRight size={15}/></button></div>}</>}
        </div>
      </section>
      <section className={styles.detailPane} aria-label="Geselecteerd onderdeel" ref={detailRef} onScroll={rememberScroll}>
        {navigation.select ? detail.loading || detail.error ? <><button className={styles.mobileBack} type="button" onClick={() => navigate({select: ""})}><ArrowLeft size={17}/> Terug naar overzicht</button><StatusMessage loading={detail.loading} error={detail.error} retry={detail.reload}/></>
          : detail.data && <RightsDetailPanel detail={detail.data} onNavigate={id => navigate({select: id})} onBack={() => navigate({select: ""})}/>
          : <div className={styles.detailEmpty}><div className={styles.emptyMark}><Scale size={32}/><span className={styles.orbitOne}/><span className={styles.orbitTwo}/></div><span className={styles.eyebrow}>EEN HELDER VERTREKPUNT</span><h2>Van één recht<br/>naar meer inzicht.</h2><p>Selecteer een onderwerp. Hier vind je de uitleg, voorwaarden, bronnen en verbonden onderdelen op één plek.</p><div className={styles.emptySteps}><span><ShieldCheck size={15}/> Lees de voorwaarden</span><span><Link2 size={15}/> Volg de verbindingen</span><span><FileText size={15}/> Bekijk de bron</span></div></div>}
      </section>
    </div>
    <span className={styles.srOnly} role="status" aria-live="polite">{copied}</span>
  </div>;
}
