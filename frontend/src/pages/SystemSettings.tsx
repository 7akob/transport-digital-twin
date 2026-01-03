export function SystemSettings() {
  return (
    <div>
      <h1 className="text-3xl font-light text-slate-900">
        System Settings
      </h1>

      <div className="mt-6 border rounded-lg p-6 shadow-sm">
        <div className="text-sm font-medium text-slate-700">Algorithm and Cost Control</div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-slate-700">Prediction Model</label>
            <select className="mt-2 w-full border rounded px-3 py-2 text-sm">
              <option>Baseline</option>
              <option>Prophet</option>
              <option>LSTM (placeholder)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-700">Computational Unit (Optimization)</label>
            <select className="mt-2 w-full border rounded px-3 py-2 text-sm">
              <option>Classical (CPU)</option>
              <option>Classical (Cloud GPU)</option>
              <option>Hybrid (placeholder)</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm text-slate-700">Solver Libraries</label>
          <input
            className="mt-2 w-full border rounded px-3 py-2 text-sm"
            value="CVXPY, GLPK (for linear relaxation)"
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
