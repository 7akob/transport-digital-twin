import networkx as nx

def init_network():
    G = nx.DiGraph()

    nodes = {
        "Kamppi": {"type": "sink", "demand": 200},
        "Pasila": {"type": "sink", "demand": 150},
        "Kallio": {"type": "sink", "demand": 120},
        "Töölö": {"type": "sink", "demand": 80},
        "Itäkeskus": {"type": "sink", "demand": 100},
        "Depot_West": {"type": "source", "demand": -300},
        "Depot_East": {"type": "source", "demand": -250},
        "Transfer_1": {"type": "ghost", "demand": 0},
    }

    for name, attrs in nodes.items():
        G.add_node(name, **attrs)

    return G

def add_edges(G):
    edges = [
        ("Depot_West", "Kamppi", 10),
        ("Kamppi", "Töölö", 5),
        ("Kamppi", "Kallio", 7),
        ("Kallio", "Pasila", 6),
        ("Pasila", "Itäkeskus", 12),
        ("Depot_East", "Itäkeskus", 8),
        ("Kamppi", "Transfer_1", 3),
        ("Transfer_1", "Pasila", 4),
    ]

    for u, v, length in edges:
        G.add_edge(
            u, v,
            length=length,
            max_capacity=100,
            congestion_factor=1.0
        )

if __name__ == "__main__":
    G = init_network()
    add_edges(G)

    print("Nodes:")
    for n, d in G.nodes(data=True):
        print(n, d)

    print("\nEdges:")
    for u, v, d in G.edges(data=True):
        print(u, "->", v, d)

