from backend.network.init_network import init_network, add_edges
from backend.network.simulate_flow import assign_passenger_flow, compute_metrics, extract_edge_metrics
from backend.network.objective import compute_objective


def run_simulation(capacity_scale=1.0, w_congestion=0.6, w_delay=0.4):
    G = init_network()
    add_edges(G)

    for u, v, d in G.edges(data=True):
        d["max_capacity"] = int(d["max_capacity"] * capacity_scale)

    assign_passenger_flow(G)
    congestion, delay = compute_metrics(G)

    edge_metrics = extract_edge_metrics(G)


    objective = compute_objective(
        congestion,
        delay,
        w_congestion=w_congestion,
        w_delay=w_delay
    )

    return {
    "capacity_scale": capacity_scale,
    "congestion": congestion,
    "delay": delay,
    "objective": objective,
    "edges": edge_metrics,
    "weights": {
        "congestion": w_congestion,
        "delay": w_delay
        }
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

def pareto_endpoints():
    endpoints = {}

    cases = {
        "congestion_optimal": (1.0, 0.0),
        "delay_optimal": (0.0, 1.0),
    }

    for name, (wc, wd) in cases.items():
        best = None

        for scale in [0.5, 0.8, 1.0, 1.2, 1.5, 2.0]:
            result = run_simulation(
                capacity_scale=scale,
                w_congestion=wc,
                w_delay=wd
            )

            if best is None or result["objective"] < best["objective"]:
                best = result

        endpoints[name] = best

    return endpoints


if __name__ == "__main__":
    endpoints = pareto_endpoints()

    print("\nPARETO ENDPOINTS")
    for name, result in endpoints.items():
        print(f"\n{name.upper()}")
        for k, v in result.items():
            print(f"{k}: {v}")

