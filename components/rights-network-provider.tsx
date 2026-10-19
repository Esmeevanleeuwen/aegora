"use client";

import { Network, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { RightsExplorer, recordRightsCombinationOpen } from "@/components/rights-explorer";
import { resolveRightId, type RightsGraph } from "@/lib/rights-network";
import styles from "@/components/rights-network.module.css";

type OpenEntry = { rightId?: string; combinationId?: string; key: number };

type RightsNetworkContextValue = {
  graph: RightsGraph;
  openRight: (rightId: string, trigger?: HTMLElement) => void;
  openCombination: (combinationId: string, trigger?: HTMLElement) => void;
};

const RightsNetworkContext = createContext<RightsNetworkContextValue | null>(null);

export function useRightsNetwork() {
  return useContext(RightsNetworkContext);
}

export function RightsNetworkProvider({ graph, children }: { graph: RightsGraph; children: ReactNode }) {
  const [entry, setEntry] = useState<OpenEntry | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const openingNumber = useRef(0);
  const titleId = useId();

  const openRight = useCallback((rightId: string, trigger?: HTMLElement) => {
    const canonicalId = resolveRightId(graph, rightId);
    if (!canonicalId) return;
    triggerRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setEntry({ rightId: canonicalId, key: ++openingNumber.current });
  }, [graph]);

  const openCombination = useCallback((combinationId: string, trigger?: HTMLElement) => {
    const combination = graph.combinations.find((item) => item.id === combinationId || item.slug === combinationId);
    if (!combination) return;
    triggerRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setSelectedIds(combination.nodeIds);
    recordRightsCombinationOpen(combination.id);
    setEntry({ combinationId: combination.id, key: ++openingNumber.current });
  }, [graph]);

  const close = useCallback(() => setEntry(null), []);
  const isOpen = entry !== null;

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();

    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      const trigger = triggerRef.current;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [isOpen]);

  const value = useMemo(() => ({ graph, openRight, openCombination }), [graph, openRight, openCombination]);

  return (
    <RightsNetworkContext.Provider value={value}>
      {children}
      {entry && (
        <dialog
          ref={dialogRef}
          className={styles.dialog}
          aria-labelledby={titleId}
          onCancel={(event) => { event.preventDefault(); close(); }}
          onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
          }}
        >
          <div className={styles.dialogHeader}>
            <span id={titleId}><Network size={19} aria-hidden="true" /> Rechten verkennen</span>
            <button className={styles.iconButton} type="button" onClick={close} aria-label="Sluit rechtenvenster" autoFocus><X size={21} /></button>
          </div>
          <RightsExplorer
            key={entry.key}
            graph={graph}
            initialRightId={entry.rightId}
            initialCombinationId={entry.combinationId}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            embedded
          />
        </dialog>
      )}
    </RightsNetworkContext.Provider>
  );
}

type RightLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  rightId: string;
  fallbackQuery?: string;
  children: ReactNode;
};

export function RightLink({ rightId, fallbackQuery, children, onClick, ...props }: RightLinkProps) {
  const network = useRightsNetwork();
  const canonicalId = network ? resolveRightId(network.graph, rightId) : rightId;
  const query = fallbackQuery ?? (typeof children === "string" ? children : rightId);
  return (
    <a
      {...props}
      href={canonicalId ? `/rechten/${encodeURIComponent(canonicalId)}` : `/rechten/netwerk?zoek=${encodeURIComponent(query)}`}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !network || !resolveRightId(network.graph, rightId)) return;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (props.target && props.target !== "_self") || props.download !== undefined) return;
        event.preventDefault();
        if (canonicalId) network.openRight(canonicalId, event.currentTarget);
      }}
    >{children}</a>
  );
}
