import { useEffect, useMemo, useState } from "react";
import { getNetwork } from "../api/client";
import type { NetworkResponse, NetworkNode } from "../api/types";
import { NetworkGraph } from "../components/NetworkGraph";

type FilterState = {
  source: boolean;
  sink: boolean;
  ghost: boolean;
  other: boolean;
};

function nodeBucket(t?: string): keyof FilterState {
  if (t === "source") return "source";
  if (t === "sink") return "sink";
  if (t === "ghost") return "ghost";
  return "other";
}

export function TopologyView() {
  const [net, setNet] = useState<NetworkResponse | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    source: true,
    sink: true,
    ghost: true,
    other: true,
  });

  useEffect(() => {
    getNetwork().then(setNet);
  }, []);

  const filtered = useMemo(() => {
    if (!net) return null;
    const nodes = net.nodes.filter((n) => filters[nodeBucket(n.type)]);
    const nodeSet = new Set(nodes.map((n) => n.id));
    const edges = net.edges.filter((e) => nodeSet.has(e.source) && nodeSet.has(e.target));
    return { nodes, edges };
  }, [net, filters]);

  const summary = useMemo(() => {
    if (!net) return null;
    const totalLines = net.edges.length;
    const totalNodes = net.nodes.length;
    const sources = net.nodes.filter((n) => n.type === "source").length;
    const sinks = net.nodes.filter((n) => n.type === "sink").length;
    // “Peak load” is not inherently in your schema; approximate from positive demands if present
    const peakLoad = net.nodes
      .map((n) => (typeof n.demand === "number" && n.demand > 0 ? n.demand : 0))
      .reduce((a, b) => a + b, 0);

    return { totalLines, totalNodes, sources, sinks, peakLoad };
  }, [net]);

  const colorNode = (n: NetworkNode) => {
    if (n.type === "source") return "#2563eb";
    if (n.type === "sink") return "#111827";
    if (n.type === "ghost") return "#64748b";
    return "#0f172a";
  };

  return (
    <div>
      <h1 className="text-3xl font-light text-slate-900">
        Topology View - Static Asset Registry
      </h1>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="border rounded-lg p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-700">Structural Summary</div>
            {summary ? (
              <div className="mt-3 text-sm text-slate-700 space-y-1">
                <div>Total Lines: <span className="font-semibold">{summary.totalLines}</span></div>
                <div>Total Nodes: <span className="font-semibold">{summary.totalNodes}</span></div>
                <div>Sources: <span className="font-semibold">{summary.sources}</span></div>
                <div>Sinks: <span className="font-semibold">{summary.sinks}</span></div>
                <div>Peak Load (approx): <span className="font-semibold">{summary.peakLoad}</span></div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-500">Loading…</div>
            )}
          </div>

          <div className="border rounded-lg p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-700">Asset Filter</div>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              {(["source","sink","ghost","other"] as const).map((k) => (
                <label key={k} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters[k]}
                    onChange={(e) => setFilters((p) => ({ ...p, [k]: e.target.checked }))}
                  />
                  <span>
                    {k === "source" && "Generation Assets (Sources)"}
                    {k === "sink" && "Consumption Load (Sinks)"}
                    {k === "ghost" && "Storage / Transfer (Ghost)"}
                    {k === "other" && "Other"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 border rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="text-sm font-medium text-slate-700">Detailed One-Line Diagram</div>
            <div className="text-xs text-slate-600 border rounded p-3">
              <div className="font-semibold mb-1">Asset Color Legend:</div>
              <div>• Source (Generation)</div>
              <div>• Sink (Consumption)</div>
              <div>• Ghost (Transfer/Storage)</div>
            </div>
          </div>

          <div className="mt-4">
            {filtered ? (
              <NetworkGraph
                nodes={filtered.nodes}
                edges={filtered.edges}
                height={640}
                nodeColor={colorNode}
              />
            ) : (
              <div className="text-slate-500">Loading network…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
