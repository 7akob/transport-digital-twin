import pandas as pd
import os
from datetime import datetime


def export_results_to_csv(results, output_dir="backend/data/output"):
    os.makedirs(output_dir, exist_ok=True)

    rows = []

    for case, data in results.items():
        for edge in data["edges"]:
            rows.append({
                "case": case,
                "source": edge["source"],
                "target": edge["target"],
                "flow": edge["flow"],
                "capacity": edge["capacity"],
                "congestion": edge["congestion"],
                "delay": edge["delay"],
                "length": edge["length"],
            })

    df = pd.DataFrame(rows)

    filename = f"simulation_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    path = os.path.join(output_dir, filename)

    df.to_csv(path, index=False)
    return path
