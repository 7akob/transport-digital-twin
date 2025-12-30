# Transport Digital Twin

## Overview

This project implements the core simulation and optimisation engine for a simplified **Regional Transport Network (RTN)**, inspired by optimisation methods used in **Regional Heating Networks (RHN)**.

The system models a transport network as a directed graph, simulates passenger flow, computes congestion and delay, and performs optimisation to improve network performance under capacity constraints.

A fixed, Helsinki-inspired **20-node reference network** is used as the baseline scenario.

---

## Project structure (so far)
```
transport-digital-twin/
│
├── backend/
│   ├── __init__.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── main.py              # Send backend data to frontend with Flask
│   │
│   ├── data/
│   │   ├── input/               # Store custom network inputs (For future implementation) 
│   │   └── output/              # Data stored here as csv after simulation
│   │
│   ├── network/
│   │   ├── __init__.py
│   │   ├── export.py            # Export output to CSV
│   │   ├── init_network.py      # Build RTN graph (Digital Twin)
│   │   ├── simulate_flow.py     # Passenger flow + congestion/delay
│   │   ├── objective.py         # Objective function (congestion + delay)
│   │   └── optimize.py          # Optimisation loop & Pareto endpoints
│   │
│   └── README.md                # Backend docs 
│
├── frontend/                    # Here comes frontend
│
├── README.md                    # Project docs (the file you are reading)
└── requirements.txt             # Python dependencies
```