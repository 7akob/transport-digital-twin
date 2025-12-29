# Transport Digital Twin

## Overview

This project implements the core simulation and optimisation engine for a simplified Regional Transport Network (RTN), inspired by optimisation methods used in Regional Heating Networks (RHN).

The system models a transport network as a graph, simulates passenger flow, computes congestion and delay, and performs iterative optimisation to improve network performance.

## Project structure (so far)
```
transport-digital-twin/
│
├── backend/
│   ├── network/
│   │   ├── __init__.py
│   │   ├── init_network.py      # Build RTN graph (Digital Twin)
│   │   ├── simulate_flow.py     # Passenger flow + congestion/delay
│   │   ├── objective.py         # Objective function (congestion + delay)
│   │   └── optimize.py          # Optimisation loop & Pareto endpoints
│   │
│   ├── api/
│   │   └── main.py              # Send backend data to frontend with FastAPI
│   └── README.md                # Backend docs 
│
├── frontend/
│   └── README.md                # Frontend docs
│
├── README.md                    
└── requirements.txt             # Python dependencies
```