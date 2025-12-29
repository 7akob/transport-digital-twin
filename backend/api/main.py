from flask import Flask, jsonify
from backend.network.optimize import pareto_endpoints

app = Flask(__name__)

@app.route("/health") # For debugging
def health():
    return jsonify({"status": "ok"})

@app.route("/pareto", methods=["POST"])
def pareto():
    return jsonify(pareto_endpoints())

if __name__ == "__main__":
    app.run(debug=True)
