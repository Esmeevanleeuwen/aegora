"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  ExternalLink,
  Layers3,
  Link2,
  Network,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import {
  combineRights,
  getRelatedRights,
  getSuggestedCombinations,
  resolveRightId,
  type RightsCombination,
  type RightsGraph,
  type RightsNode,
} from "@/lib/rights-network";
import styles from "@/components/rights-network.module.css";

const SAVED_KEY = "aegora:rights-combinations:v1";
const OPENS_KEY = "aegora:rights-combination-opens:v1";
const STORAGE_EVENT = "aegora:rights-combinations-change";
const MAX_SELECTION = 12;

type SavedCombination = { id: string; title: string; nodeIds: string[] };

function readStorage(key: string) {
  try { return window.localStorage.getItem(key) ?? ""; } catch { return ""; }
}

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function useLocalSnapshot(key: string) {
  const getSnapshot = useCallback(() => readStorage(key), [key]);
  return useSyncExternalStore(subscribeStorage, getSnapshot, () => "");
}

function parseOpenCounts(raw: string): Record<string, number> {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("version" in parsed) || parsed.version !== 1 || !("counts" in parsed) || !parsed.counts || typeof parsed.counts !== "object") return {};
    return Object.fromEntries(Object.entries(parsed.counts).filter(([, count]) => typeof count === "number" && Number.isSafeInteger(count) && count > 0));
  } catch { return {}; }
}

export function recordRightsCombinationOpen(id: string) {
  const counts = parseOpenCounts(readStorage(OPENS_KEY));
  counts[id] = Math.min((counts[id] ?? 0) + 1, 1000000);
  try {
    window.localStorage.setItem(OPENS_KEY, JSON.stringify({ version: 1, counts }));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch { /* Browsing remains available when device storage is disabled. */ }
}

function validIds(graph: RightsGraph, ids: string[]) {
  return [...new Set(ids.map((id) => resolveRightId(graph, id)).filter((id): id is string => Boolean(id)))].slice(0, MAX_SELECTION);
}

function parseSaved(raw: string, graph: RightsGraph): SavedCombination[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("version" in parsed) || parsed.version !== 1 || !("combinations" in parsed) || !Array.isArray(parsed.combinations)) return [];
    return parsed.combinations.slice(0, 12).flatMap((item: unknown) => {
      if (!item || typeof item !== "object" || !("id" in item) || typeof item.id !== "string" || !("title" in item) || typeof item.title !== "string" || !("nodeIds" in item) || !Array.isArray(item.nodeIds)) return [];
      const nodeIds = validIds(graph, item.nodeIds.filter((id: unknown): id is string => typeof id === "string"));
      return nodeIds.length > 1 ? [{ id: item.id.slice(0, 100), title: item.title.slice(0, 80) || "Mijn combinatie", nodeIds }] : [];
    });
  } catch { return []; }
}

function checkedDate(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

const kindLabels: Record<RightsNode["kind"], string> = {
  recht: "Recht",
  plicht: "Plicht",
  bevoegdheid: "Bevoegdheid",
  grens: "Belangrijke grens",
};

export type RightsExplorerProps = {
  graph: RightsGraph;
  initialRightId?: string;
  initialCombinationId?: string;
  initialSelectedIds?: string[];
  initialQuery?: string;
  showIntro?: boolean;
  embedded?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (nodeIds: string[]) => void;
};

export function RightsExplorer({ graph, initialRightId, initialCombinationId, initialSelectedIds, initialQuery = "", showIntro = true, embedded = false, selectedIds: controlledSelection, onSelectionChange }: RightsExplorerProps) {
  const initialCombination = graph.combinations.find((item) => item.id === initialCombinationId || item.slug === initialCombinationId);
  const [localSelection, setLocalSelection] = useState(() => validIds(graph, initialSelectedIds ?? initialCombination?.nodeIds ?? []));
  const selectedIds = controlledSelection ?? localSelection;
  const setSelectedIds = onSelectionChange ?? setLocalSelection;
  const [trail, setTrail] = useState<string[]>(() => {
    const id = resolveRightId(graph, initialRightId ?? initialCombination?.nodeIds[0] ?? initialSelectedIds?.[0] ?? "");
    return id ? [id] : [];
  });
  const [query, setQuery] = useState(initialQuery);
  const [topic, setTopic] = useState("");
  const [view, setView] = useState<"network" | "list">("network");
  const [notice, setNotice] = useState("");
  const [saveName, setSaveName] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const detailRef = useRef<HTMLElement>(null);
  const savedSnapshot = useLocalSnapshot(SAVED_KEY);
  const opensSnapshot = useLocalSnapshot(OPENS_KEY);
  const saved = useMemo(() => parseSaved(savedSnapshot, graph), [savedSnapshot, graph]);
  const openCounts = useMemo(() => parseOpenCounts(opensSnapshot), [opensSnapshot]);
  const activeId = trail.at(-1);
  const activeNode = graph.nodes.find((node) => node.id === activeId);
  const related = useMemo(() => activeId ? getRelatedRights(graph, activeId, selectedIds) : [], [graph, activeId, selectedIds]);
  const combination = useMemo(() => combineRights(graph, selectedIds), [graph, selectedIds]);
  const suggestions = useMemo(() => getSuggestedCombinations(graph, selectedIds).slice(0, 3), [graph, selectedIds]);
  const topics = useMemo(() => [...new Set(graph.nodes.map((node) => node.topic))].sort((a, b) => a.localeCompare(b, "nl")), [graph]);
  const filteredNodes = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("nl");
    return graph.nodes.filter((node) => (!topic || node.topic === topic) && (!normalized || [node.title, node.summary, node.topic, ...node.tags].join(" ").toLocaleLowerCase("nl").includes(normalized)));
  }, [graph, query, topic]);
  const frequent = useMemo(() => graph.combinations.filter((item) => openCounts[item.id] > 0).sort((a, b) => openCounts[b.id] - openCounts[a.id]).slice(0, 3), [graph, openCounts]);
  const featured = graph.combinations.filter((item) => item.featured).sort((a, b) => b.priority - a.priority);
  const popular = graph.combinations.filter((item) => item.openCount > 0).sort((a, b) => b.openCount - a.openCount).slice(0, 3);

  function navigate(id: string) {
    const resolved = resolveRightId(graph, id);
    if (!resolved) return;
    setTrail((current) => {
      const existing = current.indexOf(resolved);
      return existing >= 0 ? current.slice(0, existing + 1) : [...current, resolved];
    });
    requestAnimationFrame(() => {
      detailRef.current?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 760px)").matches) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggleSelection(id: string) {
    setNotice("");
    setShareUrl("");
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((item) => item !== id));
    else if (selectedIds.length < MAX_SELECTION) setSelectedIds([...selectedIds, id]);
    else setNotice(`Je kunt maximaal ${MAX_SELECTION} rechten in één combinatie opnemen.`);
  }

  function openPreset(item: RightsCombination) {
    setSelectedIds(validIds(graph, item.nodeIds));
    setTrail(item.nodeIds[0] ? [item.nodeIds[0]] : []);
    setNotice(`Combinatie ‘${item.title}’ geopend.`);
    setShareUrl("");
    recordRightsCombinationOpen(item.id);
  }

  function mergePreset(item: RightsCombination) {
    const merged = [...new Set([...selectedIds, ...item.nodeIds]
      .map((id) => resolveRightId(graph, id))
      .filter((id): id is string => Boolean(id)))];
    if (merged.length > MAX_SELECTION) {
      setNotice(`Deze route maakt je combinatie groter dan ${MAX_SELECTION} rechten. Verwijder eerst een recht uit je selectie.`);
      return;
    }
    const added = merged.length - selectedIds.length;
    if (!added) {
      setNotice(`Alle rechten uit ‘${item.title}’ staan al in je combinatie.`);
      return;
    }
    setSelectedIds(merged);
    if (!trail.length && item.nodeIds[0]) setTrail([item.nodeIds[0]]);
    setShareUrl("");
    setNotice(`Route toegevoegd: ${added} ${added === 1 ? "nieuw recht" : "nieuwe rechten"} in je combinatie.`);
  }

  function persistSaved(next: SavedCombination[]) {
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify({ version: 1, combinations: next.slice(0, 12) }));
      window.dispatchEvent(new Event(STORAGE_EVENT));
      return true;
    } catch {
      setNotice("Je browser kan deze combinatie niet bewaren. Je kunt wel een link kopiëren.");
      return false;
    }
  }

  function saveCombination() {
    if (selectedIds.length < 2) return;
    const normalized = [...selectedIds].sort().join("|");
    const same = saved.find((item) => [...item.nodeIds].sort().join("|") === normalized);
    const item = { id: same?.id ?? `local-${Date.now()}`, title: saveName.trim().slice(0, 80) || "Mijn combinatie", nodeIds: [...selectedIds] };
    if (persistSaved([item, ...saved.filter((other) => other.id !== item.id)])) {
      setNotice("Combinatie bewaard op dit apparaat.");
      setSaveName("");
    }
  }

  async function copyCombination() {
    const url = new URL("/rechten/netwerk", window.location.origin);
    url.searchParams.set("select", selectedIds.join(","));
    setShareUrl(url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice("Link naar deze combinatie gekopieerd.");
    } catch { setNotice("Selecteer en kopieer de link hieronder."); }
  }

  const selectedNodes = selectedIds.flatMap((id) => {
    const node = graph.nodes.find((item) => item.id === id);
    return node ? [node] : [];
  });
  const checked = activeNode ? checkedDate(activeNode.sourceCheckedAt) : null;

  return (
    <div className={`${styles.explorer} ${embedded ? styles.embedded : ""}`}>
      {!embedded && showIntro && (
        <header className={styles.hero}>
          <span className={styles.eyebrow}><Network size={16} aria-hidden="true" /> Het rechtennetwerk</span>
          <h1>Een recht staat<br /><span>nooit op zichzelf.</span></h1>
          <p>Volg de verbindingen tussen rechten, bekijk waarom ze samenhangen en stel een combinatie samen die past bij jouw vraag.</p>
          <div className={styles.heroStats}><span>{graph.nodes.length} rechten en regels</span><span>{graph.edges.length} inhoudelijke verbindingen</span><span>Vrij te verkennen</span></div>
        </header>
      )}

      <div className={styles.workspace}>
        <aside className={styles.browse} aria-label="Zoek en kies een recht">
          <div className={styles.sectionHeading}><h2>Ontdek de rechten</h2><span>{filteredNodes.length}</span></div>
          <label className={styles.search}><Search size={17} aria-hidden="true" /><span className="sr-only">Zoek een recht</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek een recht of onderwerp" type="search" /></label>
          <label className={styles.filterLabel}>Onderwerp<select value={topic} onChange={(event) => setTopic(event.target.value)}><option value="">Alle onderwerpen</option>{topics.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <div className={styles.nodeList}>
            {filteredNodes.map((node) => (
              <a
                key={node.id}
                href={`/rechten/${encodeURIComponent(node.id)}`}
                className={`${styles.nodeItem} ${activeId === node.id ? styles.nodeItemActive : ""}`}
                aria-current={activeId === node.id ? "true" : undefined}
                onClick={(event) => {
                  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault(); navigate(node.id);
                }}
              ><span><small>{node.topic}</small><strong>{node.title}</strong></span>{selectedIds.includes(node.id) ? <Check size={17} aria-label="Toegevoegd aan combinatie" /> : <ChevronRight size={17} aria-hidden="true" />}</a>
            ))}
            {!filteredNodes.length && <p className={styles.empty}>Geen rechten gevonden. Probeer een ander woord of onderwerp.</p>}
          </div>
        </aside>

        <section className={styles.detail} ref={detailRef} tabIndex={-1} aria-label={activeNode ? `Uitleg over ${activeNode.title}` : "Begin met verkennen"}>
          {activeNode ? (
            <>
              <div className={styles.detailNavigation}>
                <button type="button" className={styles.textButton} disabled={trail.length < 2} onClick={() => setTrail((current) => current.slice(0, -1))}><ArrowLeft size={16} /> Terug</button>
                <a className={styles.textButton} href={`/rechten/${encodeURIComponent(activeNode.id)}`}><ExternalLink size={14} /> Eigen pagina</a>
              </div>
              <div className={styles.breadcrumb} aria-label="Je gevolgde route">
                {trail.slice(-3).map((id, index, visible) => <span key={id}><button type="button" onClick={() => navigate(id)} aria-current={id === activeId ? "step" : undefined}>{graph.nodes.find((node) => node.id === id)?.title}</button>{index < visible.length - 1 && <ChevronRight size={12} aria-hidden="true" />}</span>)}
              </div>
              <div className={styles.detailIntro}><span className={styles.badge}>{kindLabels[activeNode.kind]} · {activeNode.topic}</span><h2>{activeNode.title}</h2><p>{activeNode.summary}</p></div>
              <button className={selectedIds.includes(activeNode.id) ? styles.secondaryButton : styles.primaryButton} type="button" onClick={() => toggleSelection(activeNode.id)}>{selectedIds.includes(activeNode.id) ? <Check size={17} /> : <Plus size={17} />}{selectedIds.includes(activeNode.id) ? "Toegevoegd aan combinatie" : "Voeg toe aan combinatie"}</button>
              <dl className={styles.explanation}>
                {activeNode.appliesWhen && <div><dt>Wanneer geldt dit?</dt><dd>{activeNode.appliesWhen}</dd></div>}
                {activeNode.boundary && <div><dt>Waar ligt de grens?</dt><dd>{activeNode.boundary}</dd></div>}
                {activeNode.nextStep && <div className={styles.nextStep}><dt><ArrowRight size={17} aria-hidden="true" /> Wat kun je doen?</dt><dd>{activeNode.nextStep}</dd></div>}
                {activeNode.practicalNote && <div><dt>In de praktijk</dt><dd>{activeNode.practicalNote}</dd></div>}
              </dl>
              <div className={styles.source}><span>Bron en onderbouwing</span><a href={activeNode.sourceUrl} target="_blank" rel="noopener noreferrer">{activeNode.sourceTitle}<ExternalLink size={14} aria-hidden="true" /></a>{checked && <small>Gecontroleerd op {checked}</small>}</div>

              <section className={styles.connections} aria-labelledby={`connections-${activeNode.id}`}>
                <div className={styles.sectionHeading}><h3 id={`connections-${activeNode.id}`}>Hiermee verbonden</h3><div className={styles.viewSwitch} role="group" aria-label="Weergave verbindingen"><button type="button" aria-pressed={view === "network"} onClick={() => setView("network")}>Netwerk</button><button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>Lijst</button></div></div>
                {related.length > 0 ? <>
                  {view === "network" && <MiniNetwork activeNode={activeNode} nodes={related.slice(0, 5).map((item) => item.node)} onNavigate={navigate} selectedIds={selectedIds} />}
                  <p className={styles.connectionHint}>Elke verbinding heeft een eigen reden. Open een recht om verder te kijken.</p>
                  <div className={styles.relatedList}>{related.map(({ node, edge }) => <a key={edge.id} href={`/rechten/${encodeURIComponent(node.id)}`} onClick={(event) => { if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate(node.id); }} className={styles.relatedItem}><span className={styles.relationLabel}><Link2 size={13} aria-hidden="true" />{edge.label}</span><strong>{node.title}<ArrowRight size={17} aria-hidden="true" /></strong><p>{edge.explanation}</p></a>)}</div>
                </> : <p className={styles.empty}>Voor dit onderdeel zijn nog geen inhoudelijke verbindingen vastgelegd. Je kunt wel zelf rechten combineren.</p>}
              </section>
            </>
          ) : (
            <>
              <div className={styles.welcome}><span className={styles.welcomeIcon}><Network size={30} aria-hidden="true" /></span><span className={styles.eyebrow}>Begin bij wat samenhangt</span><h2>Welke rechten raken<br />jouw vraag?</h2><p>Kies links een recht of begin met een belangrijke route. Je ziet steeds de uitleg, de bron en de reden waarom een ander recht ermee is verbonden.</p><div className={styles.welcomeSteps}><span><b>1</b> Open een recht</span><span><b>2</b> Volg de verbinding</span><span><b>3</b> Bewaar je combinatie</span></div></div>
              <PresetSection title="Belangrijke routes" combinations={featured} onOpen={openPreset} />
              {popular.length > 0 && <PresetSection title="Populair" combinations={popular} onOpen={openPreset} />}
            </>
          )}
        </section>

        <aside className={styles.selection} aria-label="Jouw combinatie">
          <div className={styles.selectionTitle}><span className={styles.selectionIcon}><Layers3 size={20} aria-hidden="true" /></span><div><h2>Jouw combinatie</h2><p>{selectedIds.length ? `${selectedIds.length} ${selectedIds.length === 1 ? "recht" : "rechten"} geselecteerd` : "Leg de samenhang vast"}</p></div></div>
          {selectedNodes.length ? <>
            <ul className={styles.selectedList}>{selectedNodes.map((node, index) => <li key={node.id}><span>{index + 1}</span><button type="button" onClick={() => navigate(node.id)}>{node.title}</button><button type="button" className={styles.removeButton} onClick={() => toggleSelection(node.id)} aria-label={`Verwijder ${node.title} uit combinatie`}><X size={15} /></button></li>)}</ul>
            <div className={styles.selectionSummary}><Link2 size={15} aria-hidden="true" />{combination.edges.length} vastgelegde {combination.edges.length === 1 ? "verbinding" : "verbindingen"}</div>
            {selectedIds.length > 1 && combination.edges.length === 0 && <p className={styles.smallNote}>Voor deze selectie zijn nog geen verbindingen vastgelegd.</p>}
            {combination.edges.length > 0 && <details className={styles.edgeDetails}><summary>Bekijk de samenhang</summary>{combination.edges.map((edge) => <p key={edge.id}><strong>{edge.label}</strong>{edge.explanation}</p>)}</details>}
            <button type="button" className={styles.clearButton} onClick={() => { setSelectedIds([]); setShareUrl(""); setNotice("Selectie gewist."); }}>Wis selectie</button>
          </> : <p className={styles.selectionEmpty}>Voeg rechten toe terwijl je het netwerk verkent. Zo maak je stap voor stap een eigen overzicht.</p>}

          {selectedIds.length > 1 ? <form className={styles.saveForm} onSubmit={(event) => { event.preventDefault(); saveCombination(); }}><label>Naam van je combinatie<input value={saveName} onChange={(event) => setSaveName(event.target.value)} placeholder="Bijv. Regie over mijn zorg" maxLength={80} /></label><button type="submit" className={styles.primaryButton}><Bookmark size={16} /> Bewaar combinatie</button><button type="button" className={styles.secondaryButton} onClick={() => void copyCombination()}><Link2 size={16} /> Kopieer link</button><p>Alleen bewaard op dit apparaat.</p></form> : <p className={styles.smallNote}>Selecteer minimaal twee rechten om een combinatie te bewaren of te delen.</p>}
          {shareUrl && <label className={styles.shareField}>Link naar je selectie<input readOnly value={shareUrl} onFocus={(event) => event.target.select()} /></label>}
          <p className={styles.notice} role="status" aria-live="polite">{notice}</p>

          {saved.length > 0 && <section className={styles.savedSection}><h3>Mijn bewaarde combinaties</h3>{saved.map((item) => <div key={item.id} className={styles.savedItem}><button type="button" onClick={() => { setSelectedIds(item.nodeIds); setTrail([item.nodeIds[0]]); setShareUrl(""); setNotice(`‘${item.title}’ geopend.`); }}><Bookmark size={15} aria-hidden="true" /><span>{item.title}<small>{item.nodeIds.length} rechten</small></span></button><button type="button" className={styles.removeButton} onClick={() => { if (persistSaved(saved.filter((other) => other.id !== item.id))) setNotice("Bewaarde combinatie verwijderd."); }} aria-label={`Verwijder bewaarde combinatie ${item.title}`}><X size={15} /></button></div>)}</section>}
          {frequent.length > 0 && <PresetSection title="Vaak door jou geopend" combinations={frequent} onOpen={openPreset} compact note="Gebaseerd op gebruik op dit apparaat." />}
          <PresetSection title={selectedIds.length ? "Passende routes" : "Belangrijke routes"} combinations={selectedIds.length ? suggestions : featured.slice(0, 3)} onOpen={openPreset} onMerge={selectedIds.length ? mergePreset : undefined} compact />
          <p className={styles.contextNote}>Verbindingen laten inhoudelijke samenhang zien. Welke rechten gelden, hangt af van de situatie.</p>
        </aside>
      </div>
    </div>
  );
}

function PresetSection({ title, combinations, onOpen, onMerge, compact = false, note }: { title: string; combinations: RightsCombination[]; onOpen: (item: RightsCombination) => void; onMerge?: (item: RightsCombination) => void; compact?: boolean; note?: string }) {
  if (!combinations.length) return null;
  return <section className={`${styles.presets} ${compact ? styles.presetsCompact : ""}`}><h3>{title}</h3>{note && <p className={styles.smallNote}>{note}</p>}<div>{combinations.map((item) => <div className={styles.presetEntry} key={item.id}><button type="button" className={styles.preset} onClick={() => onOpen(item)} aria-label={`Open route ${item.title}`}><span><small>{item.nodeIds.length} verbonden rechten</small><strong>{item.title}</strong>{!compact && <p>{item.summary}</p>}</span><ArrowRight size={17} aria-hidden="true" /></button>{onMerge && <button type="button" className={styles.mergePreset} onClick={() => onMerge(item)} aria-label={`Voeg route ${item.title} toe aan je combinatie`}><Plus size={15} aria-hidden="true" />Voeg route toe</button>}</div>)}</div></section>;
}

function MiniNetwork({ activeNode, nodes, onNavigate, selectedIds }: { activeNode: RightsNode; nodes: RightsNode[]; onNavigate: (id: string) => void; selectedIds: string[] }) {
  const positions = [{ x: 20, y: 17 }, { x: 80, y: 17 }, { x: 80, y: 72 }, { x: 49, y: 89 }, { x: 20, y: 72 }];
  return <div className={styles.miniNetwork} role="group" aria-label={`Netwerk rond ${activeNode.title}`}><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{nodes.map((node, index) => <line key={node.id} x1="49" y1="47" x2={positions[index].x} y2={positions[index].y} />)}</svg><div className={styles.centralNode}><Network size={19} aria-hidden="true" /><strong>{activeNode.title}</strong></div>{nodes.map((node, index) => <button type="button" key={node.id} style={{ "--node-x": `${positions[index].x}%`, "--node-y": `${positions[index].y}%` } as CSSProperties} className={`${styles.graphNode} ${selectedIds.includes(node.id) ? styles.graphNodeSelected : ""}`} onClick={() => onNavigate(node.id)}><span>{selectedIds.includes(node.id) ? <Check size={12} /> : <ArrowRight size={12} />}</span>{node.title}</button>)}</div>;
}
