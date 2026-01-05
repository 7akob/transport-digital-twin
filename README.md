# Transport Digital Twin
## Overview

This project implements an end-to-end Transport Digital Twin for a simplified Regional Transport Network (RTN), inspired by optimisation methods commonly used in Regional Heating Networks (RHN).

The system combines:

- a network simulation engine (passenger flow, congestion, delay),

- a multi-objective optimisation backend (Pareto optimisation),

- and a web-based frontend for visualisation and operational decision support.

A fixed, Helsinki-inspired reference transport network is used as the baseline scenario.
## Project structure 
```
transport-digital-twin/
│
├── backend/
│ ├── init.py
│ │
│ ├── api/
│ │ ├── init.py
│ │ └── main.py # Flask API (/network, /pareto)
│ │
│ ├── data/
│ │ ├── input/ # Custom network inputs (future)
│ │ └── output/ # CSV outputs after simulation
│ │
│ ├── network/
│ │ ├── init.py
│ │ ├── export.py # Export simulation results
│ │ ├── init_network.py # Build RTN graph (digital twin)
│ │ ├── simulate_flow.py # Passenger flow, congestion & delay
│ │ ├── objective.py # Objective functions
│ │ └── optimize.py # Optimisation & Pareto solutions
│ │
│ └── README.md # Backend documentation
│
├── frontend/
│ ├── src/
│ │ ├── api/
│ │ │ ├── client.ts # Backend API client
│ │ │ └── types.ts # Shared data types
│ │ │
│ │ ├── components/
│ │ │ ├── AppLayout.tsx # Main layout wrapper
│ │ │ ├── Sidebar.tsx # Navigation sidebar
│ │ │ └── NetworkGraph.tsx # Network visualisation component
│ │ │ └── NavCard.tsx 
│ │ │ 
│ │ └── pages/
│ │ ├── CommandCenter.tsx # Operational overview dashboard
│ │ ├── TopologyView.tsx # Network topology view
│ │ ├── OperationsView.tsx# Optimisation & live status view
│ │ └── SystemSettings.tsx# System configuration placeholder
│ │
│ └── README.md # Frontend notes
│
├── README.md # Project documentation (this file)
└── requirements.txt # Python dependencies

```

---
# How to Run

## Backend (Python / Flask)

You may use PyCharm or the command line.

### Option A — Using PyCharm (recommended for development)

1. Open the project in PyCharm
2. Configure the Python interpreter  
   - PyCharm will prompt you to create a virtual environment
3. Install dependencies:

       pip install -r requirements.txt

Run the backend:

       python -m backend.api.main 

The backend will run at:  
http://127.0.0.1:5000

---

### Option B — Using the command line

       cd backend
       python -m venv .venv

Activate the virtual environment:

**Windows**

       .venv\Scripts\activate

**macOS / Linux**

       source .venv/bin/activate

Install dependencies and run the backend:

       pip install -r requirements.txt
       python -m backend.api.main 

The backend will run at:  
http://127.0.0.1:5000

---

## Frontend (React + Vite)

       cd frontend
       npm install
       npm run dev

The frontend will run at:  
http://localhost:5173

---

### Notes

- If you are using PyCharm, the virtual environment is usually created and managed automatically.
- If running from the command line or another editor, creating a virtual environment manually is recommended.
