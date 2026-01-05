import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNetwork } from "../api/client";
import type { NetworkResponse } from "../api/types";
import { NetworkGraph } from "../components/NetworkGraph";
import { NavCard } from "../components/NavCard";


export function CommandCenter() {
  const navigate = useNavigate();

  const [net, setNet] = useState<NetworkResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toUTCString());

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const n = await getNetwork();
        if (!alive) return;
        setNet(n);
        setLastUpdated(new Date().toUTCString());
      } catch (e) {
        if (!alive) return;
        setErr(String(e));
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const metrics = useMemo(() => {
    if (!net) return null;

    const totalNodes = net.nodes.length;
    const totalLines = net.edges.length;

    const sources = net.nodes.filter((n) => n.type === "source").length;
    const sinks = net.nodes.filter((n) => n.type === "sink").length;
    const ghosts = net.nodes.filter((n) => n.type === "ghost").length;

    const totalLoad = net.nodes.reduce((acc, n) => {
      const d = typeof n.demand === "number" ? n.demand : 0;
      return d > 0 ? acc + d : acc;
    }, 0);

    const totalGeneration = net.nodes.reduce((acc, n) => {
      const d = typeof n.demand === "number" ? n.demand : 0;
      return d < 0 ? acc + Math.abs(d) : acc;
    }, 0);

    // a simple headline value you can change later
    const status =
      totalLoad > 0 && totalGeneration > 0 ? "NETWORK STATE OVERVIEW" : "DATA INCOMPLETE";

    return {
      status,
      totalNodes,
      totalLines,
      sources,
      sinks,
      ghosts,
      totalLoad,
      totalGeneration,
    };
  }, [net]);

  const cardBase =
    "border rounded-lg p-6 text-center shadow-sm bg-white hover:shadow transition focus:outline-none focus:ring-2 focus:ring-green-500";
  const disabled =
    "border rounded-lg p-6 text-center shadow-sm bg-white opacity-50 cursor-not-allowed";

  return (
    <div>
      <h1 className="text-3xl font-light text-slate-900">Command Center</h1>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Operational status */}
          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <div className="text-sm text-slate-600">Operational Status</div>
            <div className="mt-2 text-4xl font-semibold tracking-wide text-green-600">
              {metrics?.status ?? "LOADING…"}
            </div>
            <div className="mt-2 text-xs text-slate-500">Last Updated: {lastUpdated}</div>

            {/* Dynamic metrics row */}
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="border rounded-md p-3">
                <div className="text-xs text-slate-500">Nodes</div>
                <div className="text-lg font-semibold text-slate-900">
                  {metrics ? metrics.totalNodes : "—"}
                </div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-xs text-slate-500">Lines</div>
                <div className="text-lg font-semibold text-slate-900">
                  {metrics ? metrics.totalLines : "—"}
                </div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-xs text-slate-500">Peak Load (sum +demand)</div>
                <div className="text-lg font-semibold text-slate-900">
                  {metrics ? metrics.totalLoad.toFixed(0) : "—"}
                </div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-xs text-slate-500">Total Generation (sum |−demand|)</div>
                <div className="text-lg font-semibold text-slate-900">
                  {metrics ? metrics.totalGeneration.toFixed(0) : "—"}
                </div>
              </div>
            </div>

            {/* Type counts */}
            <div className="mt-4 text-xs text-slate-600">
              {metrics ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    Sources: <span className="font-semibold">{metrics.sources}</span>
                  </span>
                  <span>
                    Sinks: <span className="font-semibold">{metrics.sinks}</span>
                  </span>
                  <span>
                    Ghosts: <span className="font-semibold">{metrics.ghosts}</span>
                  </span>
                </div>
              ) : (
                <span>Loading metrics…</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
  <NavCard title="Topology" to="/topology" />
  <NavCard title="Operations" to="/operations" />
  <NavCard title="Scenario Library (later)" disabled />
  <NavCard title="Infrastructure Planning (later)" disabled />
</div>

<NavCard title="System Settings" to="/settings" className="mt-4" />


          {err && <div className="text-red-600 text-sm">{err}</div>}
        </div>

        {/* Right column */}
        <div className="border rounded-lg p-6 shadow-sm bg-white">
          <div className="text-sm font-medium text-slate-700">
            Operational Topology Visualization
          </div>

          <div className="mt-4">
            {net ? (
              <NetworkGraph nodes={net.nodes} edges={net.edges} height={560} />
            ) : (
              <div className="text-slate-500">Loading network…</div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}
