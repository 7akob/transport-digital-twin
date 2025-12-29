from init_network import init_network, add_edges
from simulate_flow import assign_passenger_flow, compute_metrics
from objective import compute_objective


def run_simulation(capacity_scale=1.0):
    G = init_network()
    add_edges(G)

    # scale capacities (this is the optimisation parameter)
    for u, v, d in G.edges(data=True):
        d["max_capacity"] = int(d["max_capacity"] * capacity_scale)

    assign_passenger_flow(G)
    congestion, delay = compute_metrics(G)
    objective = compute_objective(congestion, delay)

    return {
        "capacity_scale": capacity_scale,
        "congestion": congestion,
        "delay": delay,
        "objective": objective
    }

def optimize_capacity():
    best_result = None

    # try a few capacity values
    for scale in [0.5, 0.8, 1.0, 1.2, 1.5, 2.0]:
        result = run_simulation(capacity_scale=scale)
        print(
            f"Scale={scale} | "
            f"Congestion={result['congestion']} | "
            f"Delay={result['delay']:.2f} | "
            f"Objective={result['objective']:.2f}"
        )

        if best_result is None or result["objective"] < best_result["objective"]:
            best_result = result

    return best_result

if __name__ == "__main__":
    best = optimize_capacity()

    print("\nBEST SOLUTION FOUND")
    for k, v in best.items():
        print(f"{k}: {v}")
