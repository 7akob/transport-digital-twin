import { useEffect, useMemo, useState } from "react";
import { getNetwork, postPareto } from "../api/client";
import type {
  NetworkResponse,
  ParetoResponse,
  ParetoSolution,
  ParetoEdge,
} from "../api/types";
import { NetworkGraph } from "../components/NetworkGraph";

type Mode = "delay" | "congestion";

function utilizationPct(e: ParetoEdge): number {
  if (!e.capacity) return 0;
  return (e.flow / e.capacity) * 100;
}

function edgeKeyAB(a: string, b: string): string {
  return `${a}→${b}`;
}

function edgeKey(e: ParetoEdge): string {
  return edgeKeyAB(e.source, e.target);
}

function linkEndpointId(x: any): string {
  // ForceGraph sometimes gives endpoints as node objects, sometimes raw ids
  if (x && typeof x === "object") return String(x.id ?? x.name ?? "");
  return String(x ?? "");
}

export function OperationsView() {
  const [net, setNet] = useState<NetworkResponse | null>(null);
  const [pareto, setPareto] = useState<ParetoResponse | null>(null);
  const [mode, setMode] = useState<Mode>("delay");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [n, p] = await Promise.all([getNetwork(), postPareto({})]);
        if (!alive) return;
        setNet(n);
        setPareto(p);
      } catch (e) {
        if (!alive) return;
        setErr(String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const sol: ParetoSolution | null = useMemo(() => {
    if (!pareto) return null;
    return mode === "delay" ? pareto.delay_optimal : pareto.congestion_optimal;
  }, [pareto, mode]);

  // Map both directions so undirected / reversed edges still match.
  const edgeMetrics = useMemo(() => {
    const m = new Map<string, ParetoEdge>();
    if (!sol) return m;

    for (const e of sol.edges) {
      m.set(edgeKey(e), e);
      m.set(edgeKeyAB(e.target, e.source), e); // reverse lookup
    }
    return m;
  }, [sol]);

  const linkColor = (l: any) => {
    const src = linkEndpointId(l.source);
    const tgt = linkEndpointId(l.target);

    const e = edgeMetrics.get(edgeKeyAB(src, tgt));
    if (!e) return "#cbd5e1";

    const u = utilizationPct(e);
    if (u >= 100) return "#dc2626"; // red
    if (u >= 80) return "#f59e0b"; // amber
    return "#94a3b8"; // slate
  };

  const summary = useMemo(() => {
    if (!sol) return null;

    const maxUtil = Math.max(...sol.edges.map(utilizationPct), 0);
    const totalFlow = sol.edges.reduce((acc, e) => acc + e.flow, 0);
    const totalCong = sol.edges.reduce((acc, e) => acc + e.congestion, 0);
    const totalDelay = sol.edges.reduce((acc, e) => acc + e.delay, 0);

    return {
      capacityScale: sol.capacity_scale,
      objective: sol.objective,
      delay: sol.delay,
      congestion: sol.congestion,
      maxUtil,
      totalFlow,
      totalCong,
      totalDelay,
    };
  }, [sol]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-light text-slate-900">Operations View</h1>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Solution:</span>
          <button
            className={`px-3 py-1.5 text-sm rounded border ${
              mode === "delay"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-slate-700"
            }`}
            onClick={() => setMode("delay")}
          >
            Min Delay
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded border ${
              mode === "congestion"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-slate-700"
            }`}
            onClick={() => setMode("congestion")}
          >
            Min Congestion
          </button>
        </div>
      </div>

      {err && <div className="mt-4 text-red-600 text-sm">{err}</div>}

      <div className="mt-6 border rounded-lg p-6 shadow-sm bg-white">
        {/* Header + Legend + Actions */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-slate-700">
              Operational Network Map (Dynamic Status)
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Links are colored by utilization (flow / capacity).
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Legend (matches linkColor thresholds) */}
            <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 border rounded-md px-3 py-2 bg-white">
              <div className="font-semibold text-slate-700 mr-1">Legend</div>

              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm bg-red-600" />
                <span>≥ 100%</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm bg-amber-500" />
                <span>80–99%</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm bg-slate-400" />
                <span>&lt; 80%</span>
              </div>
            </div>

            <button className="px-3 py-1.5 text-sm rounded bg-slate-100 text-slate-700 border">
              Upload Excel
            </button>
            <button className="px-3 py-1.5 text-sm rounded bg-green-600 text-white border border-green-600">
              Download
            </button>
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-slate-500">Loading…</div>
          ) : net ? (
            <NetworkGraph
              nodes={net.nodes}
              edges={net.edges}
              height={520}
              linkColor={linkColor}
            />
          ) : (
            <div className="text-slate-500">No network data.</div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 shadow-sm bg-white">
          <div className="text-sm font-medium text-slate-700">
            4-Hour Prediction Summary
          </div>

          {summary ? (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>
                Capacity Scale:{" "}
                <span className="font-semibold">
                  {summary.capacityScale.toFixed(1)}×
                </span>
              </div>
              <div>
                Objective ({mode === "delay" ? "Delay" : "Congestion"}):{" "}
                <span className="font-semibold">
                  {summary.objective.toFixed(1)}
                </span>
              </div>
              <div>
                Total Delay:{" "}
                <span className="font-semibold">{summary.delay.toFixed(1)}</span>
              </div>
              <div>
                Total Congestion:{" "}
                <span className="font-semibold">
                  {summary.congestion.toFixed(0)}
                </span>
              </div>
              <div>
                Max Utilization:{" "}
                <span
                  className={`font-semibold ${
                    summary.maxUtil >= 80 ? "text-amber-600" : "text-green-700"
                  }`}
                >
                  {summary.maxUtil.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-slate-500 pt-2">
                Note: This summary is derived from edge-level outputs
                (flow/capacity/delay/congestion).
              </div>
            </div>
          ) : (
            <div className="mt-4 text-slate-500">
              Waiting for optimization output…
            </div>
          )}
        </div>

        <div className="border rounded-lg p-6 shadow-sm bg-white">
          <div className="text-sm font-medium text-slate-700">
            Optimal Dispatch Decisions (Next 4h)
          </div>

          <div className="mt-4 overflow-auto">
            {sol ? (
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 border-b">
                  <tr>
                    <th className="text-left py-2 pr-3">Link</th>
                    <th className="text-right py-2 px-3">Flow</th>
                    <th className="text-right py-2 px-3">Cap</th>
                    <th className="text-right py-2 px-3">Util%</th>
                    <th className="text-right py-2 px-3">Delay</th>
                    <th className="text-right py-2 pl-3">Cong</th>
                  </tr>
                </thead>
                <tbody>
                  {sol.edges
                    .slice()
                    .sort((a, b) => utilizationPct(b) - utilizationPct(a))
                    .map((e) => {
                      const util = utilizationPct(e);
                      return (
                        <tr key={edgeKey(e)} className="border-b last:border-b-0">
                          <td className="py-2 pr-3 text-slate-800">
                            {edgeKey(e)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {e.flow.toFixed(0)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {e.capacity.toFixed(0)}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-medium ${
                              util >= 100
                                ? "text-red-600"
                                : util >= 80
                                ? "text-amber-600"
                                : "text-slate-700"
                            }`}
                          >
                            {util.toFixed(1)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {e.delay.toFixed(1)}
                          </td>
                          <td className="py-2 pl-3 text-right">
                            {e.congestion.toFixed(0)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            ) : (
              <div className="text-slate-500">
                Waiting for optimization output…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
