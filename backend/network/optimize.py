import copy
from backend.network.simulate_flow import assign_passenger_flow, compute_metrics
from backend.network.objective import compute_objective


def run_simulation(
    G,
    capacity_scale=1.0,
    w_congestion=0.6,
    w_delay=0.4
):
    # IMPORTANT: copy graph so we don't mutate ACTIVE_GRAPH
    G = copy.deepcopy(G)

    # Scale capacities (optimization parameter)
    for u, v, d in G.edges(data=True):
        d["max_capacity"] = int(d["max_capacity"] * capacity_scale)

    # Run simulation
    assign_passenger_flow(G)
    congestion, delay = compute_metrics(G)

    objective = compute_objective(
        congestion,
        delay,
        w_congestion=w_congestion,
        w_delay=w_delay
    )

    # Collect edge-level results (for frontend & CSV export)
    edges = []
    for u, v, d in G.edges(data=True):
        edges.append({
            "source": u,
            "target": v,
            "flow": d.get("flow", 0),
            "capacity": d["max_capacity"],
            "congestion": d.get("congestion", 0),
            "delay": d.get("delay", 0),
            "length": d["length"]
        })

    return {
        "capacity_scale": capacity_scale,
        "congestion": congestion,
        "delay": delay,
        "objective": objective,
        "weights": {
            "congestion": w_congestion,
            "delay": w_delay
        },
        "edges": edges
    }


def pareto_endpoints(G, capacity_scale=None):
    """
    Compute two Pareto endpoints:
    - congestion-optimal
    - delay-optimal
    """

    endpoints = {}

    cases = {
        "congestion_optimal": (1.0, 0.0),
        "delay_optimal": (0.0, 1.0),
    }

    scales = [capacity_scale] if capacity_scale else [0.5, 0.8, 1.0, 1.2, 1.5, 2.0]

    for name, (wc, wd) in cases.items():
        best = None

        for scale in scales:
            result = run_simulation(
                G=G,
                capacity_scale=scale,
                w_congestion=wc,
                w_delay=wd
            )

            if best is None or result["objective"] < best["objective"]:
                best = result

        endpoints[name] = best

    return endpoints

