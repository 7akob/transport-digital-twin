from flask import Flask, jsonify, request, send_file
from backend.network.optimize import pareto_endpoints
from backend.network.init_network import init_network, add_edges
from backend.network.export import export_results_to_csv
from flask_cors import CORS
import tempfile
from backend.network.load_excel import load_network_from_excel

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

    endpoints = pareto_endpoints(G=ACTIVE_GRAPH)
    export_results_to_csv(endpoints)

    LATEST_RESULTS = endpoints  # 👈 store for download
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
    if LATEST_RESULTS is None:
        return jsonify({"error": "No results available"}), 400

    file_path = export_results_to_csv(LATEST_RESULTS)

    return send_file(
        file_path,
        as_attachment=True,
        download_name="transport_simulation_results.csv"
    )

if __name__ == "__main__":
    app.run(debug=True)
