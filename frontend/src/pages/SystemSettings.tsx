// frontend/src/pages/SystemSettings.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { postPareto } from "../api/client";
import type { ParetoResponse, ParetoSolution } from "../api/types";

type Preset = "balanced" | "min_delay" | "min_congestion";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizeWeights(congestion: number, delay: number) {
  const c = Math.max(0, congestion);
  const d = Math.max(0, delay);
  const s = c + d;
  if (s <= 0) return { congestion: 0.5, delay: 0.5 };
  return { congestion: c / s, delay: d / s };
}

export function SystemSettings() {
  // Core operator-tunable parameters
  const [wCongestion, setWCongestion] = useState(0.5);
  const [wDelay, setWDelay] = useState(0.5);
  const [capacityScale, setCapacityScale] = useState(2.0);
  const [scenarioLabel, setScenarioLabel] = useState<"Normal" | "Peak" | "Incident">("Normal");

  const [demandScale, setDemandScale] = useState(1.0);
  const [demandMode, setDemandMode] = useState<"absolute" | "relative">("relative");
  const [autoRecompute, setAutoRecompute] = useState(false);

  // Backend response preview (optional but useful)
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pareto, setPareto] = useState<ParetoResponse | null>(null);
  const lastRunRef = useRef<number | null>(null);

  const weights = useMemo(() => normalizeWeights(wCongestion, wDelay), [wCongestion, wDelay]);

  const activeSolution: ParetoSolution | null = useMemo(() => {
    // Prefer to show whichever solution corresponds to the larger weight.
    if (!pareto) return null;
    return weights.delay >= weights.congestion ? pareto.delay_optimal : pareto.congestion_optimal;
  }, [pareto, weights]);

  const applyPreset = (preset: Preset) => {
    if (preset === "balanced") {
      setWCongestion(0.5);
      setWDelay(0.5);
      return;
    }
    if (preset === "min_delay") {
      setWCongestion(0.0);
      setWDelay(1.0);
      return;
    }
    // min_congestion
    setWCongestion(1.0);
    setWDelay(0.0);
  };

  const resetDefaults = () => {
    setWCongestion(0.5);
    setWDelay(0.5);
    setCapacityScale(2.0);
    setScenarioLabel("Normal");
    setDemandScale(1.0);
    setDemandMode("relative");
    setAutoRecompute(false);
    setPareto(null);
    setErr(null);
  };

  const recompute = async () => {
    setLoading(true);
    setErr(null);
    try {
      // Note: backend may ignore some fields; safe to send for forward-compatibility.
      const body = {
        weights: { congestion: weights.congestion, delay: weights.delay },
        capacity_scale: capacityScale,
        demand_scale: demandScale,
        demand_mode: demandMode,
        scenario: scenarioLabel,
      };
      const res = await postPareto(body);
      setPareto(res);
      lastRunRef.current = Date.now();
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  };

  // Optional auto-recompute (debounced)
  useEffect(() => {
    if (!autoRecompute) return;

    const t = window.setTimeout(() => {
      void recompute();
    }, 450);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRecompute, weights.congestion, weights.delay, capacityScale, demandScale, demandMode, scenarioLabel]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-slate-900">System Settings</h1>
          <div className="mt-2 text-sm text-slate-600">
            Configure optimization behavior, assumptions, and execution controls.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 text-sm rounded border bg-white text-slate-700 hover:bg-slate-50"
            onClick={resetDefaults}
            type="button"
          >
            Reset to Defaults
          </button>

          <button
            className={`px-3 py-1.5 text-sm rounded border ${
              loading
                ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                : "bg-green-600 text-white border-green-600 hover:bg-green-700"
            }`}
            onClick={() => void recompute()}
            type="button"
            disabled={loading}
          >
            {loading ? "Recomputing…" : "Recompute Optimization"}
          </button>
        </div>
      </div>

      {err && (
        <div className="mt-4 border border-red-200 bg-red-50 text-red-700 text-sm rounded p-3">
          {err}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Operator controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Optimization Objective */}
          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-900">Optimization Objective</div>
                <div className="mt-1 text-xs text-slate-500">
                  Adjust the trade-off between congestion and delay. Weights are normalized automatically.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 text-sm rounded border bg-white text-slate-700 hover:bg-slate-50"
                  onClick={() => applyPreset("balanced")}
                  type="button"
                >
                  Balanced
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded border bg-white text-slate-700 hover:bg-slate-50"
                  onClick={() => applyPreset("min_delay")}
                  type="button"
                >
                  Min Delay
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded border bg-white text-slate-700 hover:bg-slate-50"
                  onClick={() => applyPreset("min_congestion")}
                  type="button"
                >
                  Min Congestion
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">Congestion Weight</div>
                  <div className="text-sm font-semibold text-slate-900">{weights.congestion.toFixed(2)}</div>
                </div>
                <input
                  className="mt-2 w-full"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={wCongestion}
                  onChange={(e) => setWCongestion(clamp(Number(e.target.value), 0, 1))}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">Delay Weight</div>
                  <div className="text-sm font-semibold text-slate-900">{weights.delay.toFixed(2)}</div>
                </div>
                <input
                  className="mt-2 w-full"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={wDelay}
                  onChange={(e) => setWDelay(clamp(Number(e.target.value), 0, 1))}
                />
              </div>
            </div>
          </div>

          {/* Capacity Assumptions */}
          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <div className="text-sm font-medium text-slate-900">Capacity Assumptions</div>
            <div className="mt-1 text-xs text-slate-500">
              Model-wide capacity scaling for stress testing and what-if analysis.
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">Capacity Scale</div>
                  <div className="text-sm font-semibold text-slate-900">{capacityScale.toFixed(1)}×</div>
                </div>
                <input
                  className="mt-2 w-full"
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={capacityScale}
                  onChange={(e) => setCapacityScale(clamp(Number(e.target.value), 0.5, 3.0))}
                />
                <div className="mt-2 text-xs text-slate-500">0.5× (constrained) → 3.0× (expanded)</div>
              </div>

              <div>
                <div className="text-sm text-slate-700">Scenario Label</div>
                <select
                  className="mt-2 w-full border rounded px-3 py-2 text-sm"
                  value={scenarioLabel}
                  onChange={(e) => setScenarioLabel(e.target.value as any)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Peak">Peak</option>
                  <option value="Incident">Incident</option>
                </select>
                <div className="mt-2 text-xs text-slate-500">Used for reporting/annotation (does not change topology).</div>
              </div>
            </div>
          </div>

          {/* Demand Modeling */}
          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <div className="text-sm font-medium text-slate-900">Demand Modeling</div>
            <div className="mt-1 text-xs text-slate-500">
              Control how node demand is interpreted and scaled for scenario testing.
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">Demand Multiplier</div>
                  <div className="text-sm font-semibold text-slate-900">{demandScale.toFixed(2)}×</div>
                </div>
                <input
                  className="mt-2 w-full"
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  value={demandScale}
                  onChange={(e) => setDemandScale(clamp(Number(e.target.value), 0.5, 2.0))}
                />
              </div>

              <div>
                <div className="text-sm text-slate-700">Interpretation Mode</div>
                <select
                  className="mt-2 w-full border rounded px-3 py-2 text-sm"
                  value={demandMode}
                  onChange={(e) => setDemandMode(e.target.value as any)}
                >
                  <option value="relative">Relative units (normalized)</option>
                  <option value="absolute">Absolute passengers</option>
                </select>
                <div className="mt-2 text-xs text-slate-500">
                  Primarily semantic today; useful for clarity in reporting and exports.
                </div>
              </div>
            </div>
          </div>

          {/* Execution Control */}
          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <div className="text-sm font-medium text-slate-900">Execution Control</div>
            <div className="mt-1 text-xs text-slate-500">
              Control when optimization runs and how results are refreshed.
            </div>

            <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={autoRecompute}
                  onChange={(e) => setAutoRecompute(e.target.checked)}
                />
                Auto-recompute on change
              </label>

              <div className="text-xs text-slate-500">
                {lastRunRef.current ? (
                  <>Last recompute: {new Date(lastRunRef.current).toLocaleString()}</>
                ) : (
                  <>No recompute run yet.</>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Engine transparency + live output preview */}
        <div className="space-y-6">
          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <div className="text-sm font-medium text-slate-900">Optimization Engine</div>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Solver</span>
                <span className="font-semibold">CVXPY</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Backend</span>
                <span className="font-semibold">GLPK</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Solve Type</span>
                <span className="font-semibold">Linear Relaxation</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Runtime Mode</span>
                <span className="font-semibold">Deterministic</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <div className="text-sm font-medium text-slate-900">Latest Output Preview</div>
            <div className="mt-1 text-xs text-slate-500">
              A quick sanity check that settings are driving computation.
            </div>

            {activeSolution ? (
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Capacity Scale</span>
                  <span className="font-semibold">{activeSolution.capacity_scale.toFixed(1)}×</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Objective</span>
                  <span className="font-semibold">{activeSolution.objective.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Delay</span>
                  <span className="font-semibold">{activeSolution.delay.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Congestion</span>
                  <span className="font-semibold">{activeSolution.congestion.toFixed(0)}</span>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Displayed solution: {weights.delay >= weights.congestion ? "Delay-optimal" : "Congestion-optimal"}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-500">
                No output yet. Click <span className="font-semibold">Recompute Optimization</span>.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
