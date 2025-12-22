import networkx as nx
from init_network import init_network, add_edges

def assign_passenger_flow(G):
    # initialize flow on all edges
    for u, v in G.edges():
        G[u][v]["flow"] = 0

    # find depots and sinks
    depots = [n for n, d in G.nodes(data=True) if d["type"] == "source"]
    sinks = [n for n, d in G.nodes(data=True) if d["type"] == "sink"]

    for sink in sinks:
        demand = G.nodes[sink]["demand"]

        # find nearest depot
        shortest_path = None
        shortest_length = float("inf")

        for depot in depots:
            try:
                path = nx.shortest_path(G, depot, sink, weight="length")
                length = nx.shortest_path_length(G, depot, sink, weight="length")
                if length < shortest_length:
                    shortest_length = length
                    shortest_path = path
            except nx.NetworkXNoPath:
                continue

        if shortest_path is None:
            continue

        # push demand through path
        for i in range(len(shortest_path) - 1):
            u = shortest_path[i]
            v = shortest_path[i + 1]
            G[u][v]["flow"] += demand


def compute_metrics(G):
    total_congestion = 0
    total_delay = 0

    for u, v, d in G.edges(data=True):
        flow = d.get("flow", 0)
        capacity = d["max_capacity"]
        length = d["length"]

        congestion = max(0, flow - capacity)
        delay = length * (1 + congestion / capacity)

        d["congestion"] = congestion
        d["delay"] = delay

        total_congestion += congestion
        total_delay += delay

    return total_congestion, total_delay

if __name__ == "__main__":
    G = init_network()
    add_edges(G)

    assign_passenger_flow(G)
    congestion, delay = compute_metrics(G)

    print("\nEdge results:")
    for u, v, d in G.edges(data=True):
        print(
            f"{u} -> {v} | flow={d['flow']} "
            f"| congestion={d['congestion']} "
            f"| delay={d['delay']:.2f}"
        )

    print("\nTOTAL METRICS")
    print("Total congestion:", congestion)
    print("Total delay:", delay)
