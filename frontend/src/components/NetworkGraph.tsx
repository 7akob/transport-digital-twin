import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { NetworkNode, NetworkEdge } from "../api/types";

type Props = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  height?: number;
  nodeColor?: (n: NetworkNode) => string;
linkColor?: (l: any) => string;
};

export function NetworkGraph({
  nodes,
  edges,
  height = 560,
  nodeColor,
  linkColor,
}: Props) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [width, setWidth] = useState<number>(900);
  const didInitialFitRef = useRef(false);

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
    // initial set
    setWidth(el.clientWidth || 900);

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset "did fit" whenever data changes
  useEffect(() => {
    didInitialFitRef.current = false;
  }, [nodes?.length, edges?.length]);

  const fitNow = (ms: number) => {
    const fg = fgRef.current;
    if (!fg) return;

    try {
      // Reset pan first so we don't stay "dragged away"
      if (typeof fg.centerAt === "function") fg.centerAt(0, 0, ms);

      // Then fit
      if (typeof fg.zoomToFit === "function") fg.zoomToFit(ms, 80);
    } catch {
      // do not crash the app
    }
  };

  return (
    <div ref={containerRef} className="border rounded-lg bg-white overflow-hidden">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData as any}
        width={width}
        height={height}
        // Let forces settle, then do one reliable fit.
        warmupTicks={50}
        cooldownTime={1200}
        onEngineStop={() => {
          if (didInitialFitRef.current) return;
          didInitialFitRef.current = true;

          // Fit after engine stops (stable positions)
          fitNow(700);

          // Safety fit shortly after (handles late drift on some runs)
          window.setTimeout(() => fitNow(700), 300);
        }}
        // Also fit after width becomes known (first render / resizing)
        onRenderFramePre={() => {
          // If we have data and haven’t fit yet, and width is known, fit once.
          if (!didInitialFitRef.current && nodes?.length && width > 0) {
            // Don't mark as "did fit" here; engine stop is preferred.
            // But do a gentle pre-fit to avoid "offscreen" initial frames.
            fitNow(0);
          }
        }}
        nodeLabel={(n: any) => `${n.id}${n.type ? ` (${n.type})` : ""}`}
        nodeRelSize={5}
        nodeCanvasObject={(n: any, ctx, globalScale) => {
          const label = String(n.id ?? "");
          const fontSize = 10 / globalScale;

          ctx.beginPath();
          ctx.fillStyle = nodeColor ? nodeColor(n) : "#111827";
          ctx.arc(n.x, n.y, 5, 0, 2 * Math.PI, false);
          ctx.fill();

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
