from flask import Flask, jsonify, request, send_file
from backend.network.optimize import pareto_endpoints, run_simulation
from backend.network.init_network import init_network, add_edges
from backend.network.export import export_results_to_csv
from flask_cors import CORS
import tempfile
from backend.network.load_excel import load_network_from_excel
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

ACTIVE_GRAPH = None
LATEST_RESULTS = None

@app.route("/health") # For debugging
def health():
    return jsonify({"status": "ok"})

@app.route("/pareto", methods=["POST"])
def pareto():
    global LATEST_RESULTS

    if ACTIVE_GRAPH is None:
        return jsonify({"error": "No network uploaded"}), 400

    data = request.get_json(force=True, silent=True) or {}

    weights = data.get("weights", {})
    w_congestion = float(weights.get("congestion", 0.5))
    w_delay = float(weights.get("delay", 0.5))
    capacity_scale = float(data.get("capacity_scale", 1.0))

    # Pareto endpoints
    endpoints = pareto_endpoints(
        G=ACTIVE_GRAPH,
        capacity_scale=capacity_scale
    )

    # User-selected weighted solution (for UI preview)
    selected = run_simulation(
        G=ACTIVE_GRAPH,
        capacity_scale=capacity_scale,
        w_congestion=w_congestion,
        w_delay=w_delay
    )

    endpoints["selected_solution"] = selected

    LATEST_RESULTS = endpoints

    return jsonify(endpoints)


@app.route("/network", methods=["GET"])
def network():
    global ACTIVE_GRAPH

    # If user uploaded a network, serve it
    if ACTIVE_GRAPH is not None:
        G = ACTIVE_GRAPH
    else:
        G = init_network()
        add_edges(G)

    nodes = [
        {"id": n, "type": d.get("type"), "demand": d.get("demand")}
        for n, d in G.nodes(data=True)
    ]

    edges = [
        {
            "source": u,
            "target": v,
            "length": d.get("length"),
            "capacity": d.get("max_capacity") or d.get("capacity"),
        }
        for u, v, d in G.edges(data=True)
    ]

    return jsonify({"nodes": nodes, "edges": edges})


@app.route("/upload-network", methods=["POST"])
def upload_network():
    global ACTIVE_GRAPH

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename.endswith(".xlsx"):
        return jsonify({"error": "Only .xlsx files supported"}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
        file.save(tmp.name)
        ACTIVE_GRAPH = load_network_from_excel(tmp.name)

    return jsonify({
        "status": "network uploaded",
        "nodes": ACTIVE_GRAPH.number_of_nodes(),
        "edges": ACTIVE_GRAPH.number_of_edges()
    })

@app.route("/download-results", methods=["GET"])
def download_results():
    global LATEST_RESULTS

    if LATEST_RESULTS is None:
        return jsonify({"error": "No results available"}), 400

    output_dir = PROJECT_ROOT / "backend" / "data" / "output"

    file_path = export_results_to_csv(
        LATEST_RESULTS,
        output_dir=output_dir
    )

    return send_file(
        file_path,
        mimetype="text/csv",
        as_attachment=True,
        download_name=file_path.name
    )

if __name__ == "__main__":
    app.run(debug=True)
