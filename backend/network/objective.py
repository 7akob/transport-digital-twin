def compute_objective(
    total_congestion,
    total_delay,
    w_congestion=0.6,
    w_delay=0.4
):
    return w_congestion * total_congestion + w_delay * total_delay
