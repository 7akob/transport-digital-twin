from flask import Flask, jsonify, request
from backend.network.optimize import pareto_endpoints
from backend.network.init_network import init_network, add_edges
from backend.network.export import save_pareto_results
import tempfile
from backend.network.load_excel import load_network_from_excel

app = Flask(__name__)

ACTIVE_GRAPH = None

@app.route("/health") # For debugging
def health():
    return jsonify({"status": "ok"})

@app.route("/pareto", methods=["POST"])
def pareto():
    if ACTIVE_GRAPH is None:
        return jsonify({"error": "No network uploaded"}), 400

    endpoints = pareto_endpoints(G=ACTIVE_GRAPH)
    save_pareto_results(endpoints)
    return jsonify(endpoints)

@app.route("/network", methods=["GET"])
def network():
    G = init_network()
    add_edges(G)

    nodes = [
        {
            "id": n,
            "type": d["type"],
            "demand": d["demand"]
        }
        for n, d in G.nodes(data=True)
    ]

    edges = [
        {
            "source": u,
            "target": v,
            "length": d["length"],
            "capacity": d["max_capacity"]
        }
        for u, v, d in G.edges(data=True)
    ]

    return jsonify({
        "nodes": nodes,
        "edges": edges
    })

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


if __name__ == "__main__":
    app.run(debug=True)
