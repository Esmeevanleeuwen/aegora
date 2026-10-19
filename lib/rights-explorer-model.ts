/** Shared API contracts; importing this file never imports research data. */
export type ExplorerContext = {
  id: string;
  label: string;
  description: string;
  snapshot: string | null;
  kind: "catalog" | "research";
};

export type ExplorerItem = {
  id: string;
  title: string;
  summary: string;
  kind: string;
  kindLabel: string;
  topic: string;
  relationCount: number;
  claimCount: number;
};

export type ExplorerSource = {
  id: string;
  title: string;
  url: string | null;
  locator: string | null;
  version: string | null;
  limitations: string | null;
};

export type ExplorerReason = {
  id: string;
  label: string;
  kind: string;
  kindLabel: string;
  statement: string;
  contextId: string;
  sourceIds: string[];
};

export type ExplorerRelation = {
  item: ExplorerItem;
  direction: "incoming" | "outgoing" | "both";
  reasons: ExplorerReason[];
};

export type ExplorerNormGroup = {
  id: string;
  title: string;
  snapshot: string;
  scope: string[];
  limitations: string[];
  requirements: {
    id: string;
    title: string;
    conditions: string[];
    exceptions: string[];
    sources: ExplorerSource[];
  }[];
};

export type ExplorerIndex = {
  revision: string;
  contexts: ExplorerContext[];
  context: ExplorerContext;
  research: boolean;
  items: ExplorerItem[];
};

export type ExplorerDetail = {
  revision: string;
  context: ExplorerContext;
  research: boolean;
  item: ExplorerItem;
  description: string;
  conditions: string[];
  exceptions: string[];
  normGroups: ExplorerNormGroup[];
  relations: ExplorerRelation[];
  sources: ExplorerSource[];
  proofs: { id: string; label: string; kind: string }[];
};

export type ExplorerProofStep = {
  id: string;
  kind: string;
  kindLabel: string;
  statement: string;
  limitations: string;
  sources: ExplorerSource[];
  premiseIds: string[];
  rule: { id: string; description: string } | null;
};

export type ExplorerProof = {
  revision: string;
  context: ExplorerContext;
  research: boolean;
  id: string;
  steps: ExplorerProofStep[];
  truncated: boolean;
};

export type ExplorerNeighbors = {
  revision: string;
  context: ExplorerContext;
  research: boolean;
  focusId: string;
  nodes: ExplorerItem[];
  edges: {
    id: string;
    sourceId: string;
    targetId: string;
    label: string;
    kind: string;
    contextId: string;
    assertionIds: string[];
  }[];
};

export type ExplorerQuery = { context?: string; research?: boolean };
