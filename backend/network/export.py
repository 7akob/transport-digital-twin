from pathlib import Path
import csv
from datetime import datetime

def export_results_to_csv(results, output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = output_dir / f"simulation_results_{timestamp}.csv"

    with open(file_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)

        writer.writerow([
            "case", "source", "target", "flow",
            "capacity", "congestion", "delay", "length"
        ])

        for case, data in results.items():
            for e in data["edges"]:
                writer.writerow([
                    case,
                    e["source"],
                    e["target"],
                    e["flow"],
                    e["capacity"],
                    e["congestion"],
                    e["delay"],
                    e["length"],
                ])

    return file_path
