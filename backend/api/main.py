from flask import Flask, jsonify
from backend.network.optimize import pareto_endpoints
from backend.network.init_network import init_network, add_edges

app = Flask(__name__)

@app.route("/health") # For debugging
def health():
    return jsonify({"status": "ok"})

@app.route("/pareto", methods=["POST"])
def pareto():
    return jsonify(pareto_endpoints())

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

if __name__ == "__main__":
    app.run(debug=True)
