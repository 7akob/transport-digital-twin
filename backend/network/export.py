import pandas as pd
from pathlib import Path


def save_pareto_results(endpoints, out_dir="backend/data/output"):
    Path(out_dir).mkdir(parents=True, exist_ok=True)

    # ---- Summary CSV ----
    summary_rows = []
    for name, res in endpoints.items():
        summary_rows.append({
            "solution": name,
            "capacity_scale": res["capacity_scale"],
            "total_congestion": res["congestion"],
            "total_delay": res["delay"],
            "objective": res["objective"],
            "w_congestion": res["weights"]["congestion"],
            "w_delay": res["weights"]["delay"],
        })

    summary_df = pd.DataFrame(summary_rows)
    summary_df.to_csv(f"{out_dir}/pareto_summary.csv", index=False)

    # ---- Edge-level CSVs ----
    for name, res in endpoints.items():
        edge_df = pd.DataFrame(res["edges"])
        edge_df.to_csv(f"{out_dir}/edges_{name}.csv", index=False)
