import { useEffect, useState } from "react";
import { getNetwork } from "../api/client";
import type { NetworkResponse } from "../api/types";
import { NetworkGraph } from "../components/NetworkGraph";

export function CommandCenter() {
  const [net, setNet] = useState<NetworkResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getNetwork().then(setNet).catch((e) => setErr(String(e)));
  }, []);

  return (

    <div>
      <h1 className="text-3xl font-light text-slate-900">Command Center</h1>


      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <div className="text-sm text-slate-600">Operational Status</div>
            <div className="mt-2 text-4xl font-semibold tracking-wide text-blue-600">
              REAL-TIME MONITORING
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Last Updated: {new Date().toUTCString()}
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-6 text-center shadow-sm bg-white">
              Topology
            </div>
            <div className="border rounded-lg p-6 text-center shadow-sm bg-white">
              Operations
            </div>
            <div className="border rounded-lg p-6 text-center shadow-sm bg-white opacity-50 cursor-not-allowed">
              Scenario Library (later)
            </div>
            <div className="border rounded-lg p-6 text-center shadow-sm bg-white opacity-50 cursor-not-allowed">
              Infrastructure Planning (later)
            </div>
          </div>

          <div className="border rounded-lg p-6 text-center shadow-sm bg-white">
            System Settings
          </div>

          {err && <div className="text-red-600 text-sm">{err}</div>}
        </div>

        {/* Right column */}
        <div className="border rounded-lg p-6 shadow-sm bg-white">
          <div className="text-sm font-medium text-slate-700">
            Operational Snapshot: Simplified Grid Map
          </div>

          <div className="mt-4">
            {net ? (
              <NetworkGraph nodes={net.nodes} edges={net.edges} height={560} />
            ) : (
              <div className="text-slate-500">Loading network…</div>
            )}
          </div>

          <div className="mt-3 text-xs text-slate-600 border rounded p-3 w-fit ml-auto bg-white">
            <div className="font-semibold mb-1">State Legend:</div>
            <div>• Fault (e.g., Low V)</div>
            <div>• High Load (&gt;80%)</div>
            <div>• Normal (&lt;80%)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
