import pandas as pd
import networkx as nx


def load_network_from_excel(file_path):
    df_nodes = pd.read_excel(file_path, sheet_name="nodes")
    df_edges = pd.read_excel(file_path, sheet_name="edges")

    G = nx.DiGraph()

    # Add nodes
    for _, row in df_nodes.iterrows():
        G.add_node(
            row["id"],
            type=row["type"],
            demand=int(row["demand"])
        )

    # Add edges
    for _, row in df_edges.iterrows():
        G.add_edge(
            row["source"],
            row["target"],
            length=float(row["length"]),
            max_capacity=int(row["max_capacity"]),
            congestion_factor=1.0
        )

    return G
