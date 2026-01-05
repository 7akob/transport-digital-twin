import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { NetworkNode, NetworkEdge } from "../api/types";

type Props = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  height?: number;
  nodeColor?: (n: NetworkNode) => string;
  linkColor?: (l: any) => string;

  // Optional: turn search UI on/off (default: true)
  enableSearch?: boolean;
};

function safeId(x: unknown): string {
  return String(x ?? "");
}

export function NetworkGraph({
  nodes,
  edges,
  height = 560,
  nodeColor,
  linkColor,
  enableSearch = true,
}: Props) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [width, setWidth] = useState<number>(900);
  const didInitialFitRef = useRef(false);

  // Search state
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const graphData = useMemo(
    () => ({
      nodes: (nodes ?? []).map((n) => ({ ...n, name: n.id })),
      links: (edges ?? []).map((e) => ({
        ...e,
        source: e.source,
        target: e.target,
      })),
    }),
    [nodes, edges]
  );

  // Track container width precisely (fixes "graph off-screen" due to wrong canvas size)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (w && w !== width) setWidth(w);
    });

    ro.observe(el);
    setWidth(el.clientWidth || 900);

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset "did fit" whenever data changes
  useEffect(() => {
    didInitialFitRef.current = false;
    // also clear selection if node disappears
    if (selectedId && !nodes.some((n) => n.id === selectedId)) setSelectedId(null);
  }, [nodes?.length, edges?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const fitNow = (ms: number) => {
    const fg = fgRef.current;
    if (!fg) return;

    try {
      if (typeof fg.centerAt === "function") fg.centerAt(0, 0, ms);
      if (typeof fg.zoomToFit === "function") fg.zoomToFit(ms, 80);
    } catch {
      // do not crash the app
    }
  };

  const focusNodeById = (id: string, ms = 700) => {
    const fg = fgRef.current;
    if (!fg) return;

    const n: any =
      (fg.graphData?.().nodes || []).find((x: any) => safeId(x.id) === id) ||
      (graphData.nodes as any[]).find((x: any) => safeId(x.id) === id);

    if (!n) return;

    // If the simulation hasn't assigned positions yet, do a fit instead.
    const hasPos = typeof n.x === "number" && typeof n.y === "number";

    try {
      if (hasPos && typeof fg.centerAt === "function") fg.centerAt(n.x, n.y, ms);
      // Zoom a bit for clarity; clamp via try/catch to avoid method mismatch issues.
      if (typeof fg.zoom === "function") fg.zoom(3, ms);
      if (!hasPos) fitNow(ms);
    } catch {
      fitNow(ms);
    }
  };

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return nodes
      .filter((n) => n.id.toLowerCase().includes(q))
      .slice(0, 8)
      .map((n) => n.id);
  }, [query, nodes]);

  const onPick = (id: string) => {
    setSelectedId(id);
    focusNodeById(id, 650);
  };

  return (
    <div ref={containerRef} className="border rounded-lg bg-white overflow-hidden">
      {enableSearch && (
        <div className="p-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-slate-700">Node search</div>

            <div className="relative flex-1">
              <input
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                placeholder="Type a node name (e.g., Kamppi, Pasila, Depot_East)…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && matches.length) {
                    onPick(matches[0]);
                  }
                  if (e.key === "Escape") {
                    setQuery("");
                  }
                }}
              />

              {query.trim() && matches.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-sm">
                  {matches.map((id) => (
                    <button
                      key={id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                      onClick={() => onPick(id)}
                      type="button"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="px-3 py-2 text-sm rounded-md border bg-white text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setSelectedId(null);
                setQuery("");
                fitNow(650);
              }}
            >
              Reset view
            </button>
          </div>

          {selectedId && (
            <div className="mt-2 text-xs text-slate-500">
              Selected: <span className="font-semibold text-slate-700">{selectedId}</span>
            </div>
          )}
        </div>
      )}

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData as any}
        width={width}
        height={height}
        warmupTicks={50}
        cooldownTime={1200}
        onEngineStop={() => {
          if (didInitialFitRef.current) return;
          didInitialFitRef.current = true;

          fitNow(700);
          window.setTimeout(() => fitNow(700), 300);
        }}
        onRenderFramePre={() => {
          if (!didInitialFitRef.current && nodes?.length && width > 0) {
            fitNow(0);
          }
        }}
        nodeLabel={(n: any) => {
          const d =
            typeof n.demand === "number"
              ? `\nDemand: ${n.demand > 0 ? "+" : ""}${n.demand}`
              : "";
          return `${n.id}${n.type ? ` (${n.type})` : ""}${d}`;
        }}
        nodeRelSize={5}
        onNodeClick={(n: any) => {
          const id = safeId(n?.id);
          if (id) onPick(id);
        }}
        nodeCanvasObject={(n: any, ctx, globalScale) => {
          const id = safeId(n.id);
          const label = String(n.id ?? "");
          const fontSize = 10 / globalScale;

          // Base node
          ctx.beginPath();
          ctx.fillStyle = nodeColor ? nodeColor(n) : "#111827";
          ctx.arc(n.x, n.y, 5, 0, 2 * Math.PI, false);
          ctx.fill();

          // Highlight ring for selected node
          if (selectedId && id === selectedId) {
            ctx.beginPath();
            ctx.strokeStyle = "#16a34a"; // green-600
            ctx.lineWidth = 2 / globalScale;
            ctx.arc(n.x, n.y, 7.5, 0, 2 * Math.PI, false);
            ctx.stroke();
          } else if (query.trim() && matches.includes(id)) {
            // Subtle ring for search matches
            ctx.beginPath();
            ctx.strokeStyle = "rgba(22, 163, 74, 0.45)";
            ctx.lineWidth = 2 / globalScale;
            ctx.arc(n.x, n.y, 7.5, 0, 2 * Math.PI, false);
            ctx.stroke();
          }

          // Label
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillStyle = "#334155";
          ctx.fillText(label, n.x + 6, n.y + 3);
        }}
        linkColor={(l: any) => (linkColor ? linkColor(l) : "#cbd5e1")}
        linkWidth={1.2}
      />
    </div>
  );
}
