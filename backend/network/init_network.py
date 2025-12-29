import networkx as nx

def init_network():
    G = nx.DiGraph()

    nodes = {
    # Sources
    "Depot_West": {"type": "source", "demand": -330},
    "Depot_East": {"type": "source", "demand": -320},

    # Ghost / Transfers
    "Transfer_Central": {"type": "ghost", "demand": 0},
    "Transfer_North": {"type": "ghost", "demand": 0},
    "Transfer_East": {"type": "ghost", "demand": 0},

    # Sinks (districts)
    "Kamppi": {"type": "sink", "demand": 90},
    "Pasila": {"type": "sink", "demand": 85},
    "Kallio": {"type": "sink", "demand": 55},
    "Töölö": {"type": "sink", "demand": 40},
    "Hakaniemi": {"type": "sink", "demand": 35},
    "Sörnäinen": {"type": "sink", "demand": 35},
    "Kalasatama": {"type": "sink", "demand": 35},
    "Itäkeskus": {"type": "sink", "demand": 70},
    "Herttoniemi": {"type": "sink", "demand": 35},
    "Lauttasaari": {"type": "sink", "demand": 35},
    "Munkkiniemi": {"type": "sink", "demand": 30},
    "Pitäjänmäki": {"type": "sink", "demand": 30},
    "Oulunkylä": {"type": "sink", "demand": 25},
    "Malmi": {"type": "sink", "demand": 45},
    "Arabianranta": {"type": "sink", "demand": 25},
}


    for name, attrs in nodes.items():
        G.add_node(name, **attrs)

    return G

def add_edges(G):
    edges = [
        # Depot connections
        ("Depot_West", "Lauttasaari", 6),
        ("Depot_West", "Kamppi", 8),
        ("Depot_East", "Itäkeskus", 7),

        # Central corridor (WEST → CENTER → EAST)
        ("Lauttasaari", "Kamppi", 4),
        ("Kamppi", "Transfer_Central", 3),
        ("Transfer_Central", "Hakaniemi", 3),
        ("Hakaniemi", "Transfer_East", 4),
        ("Transfer_East", "Itäkeskus", 6),

        # Inner city branches
        ("Kamppi", "Töölö", 3),
        ("Töölö", "Transfer_North", 4),

        ("Hakaniemi", "Sörnäinen", 2),
        ("Sörnäinen", "Kalasatama", 3),
        ("Kalasatama", "Herttoniemi", 4),

        # Northern corridor
        ("Transfer_North", "Pasila", 3),
        ("Pasila", "Oulunkylä", 4),
        ("Oulunkylä", "Malmi", 5),

        # Secondary branches
        ("Pasila", "Arabianranta", 3),
        ("Arabianranta", "Pitäjänmäki", 5),
        ("Pitäjänmäki", "Munkkiniemi", 6),
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

