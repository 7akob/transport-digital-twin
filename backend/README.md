# Backend for Transport Digital Twin

## Purpose
This backend implements the core simulation and optimisation engine for a simplified Regional Transport Network (RTN), inspired by optimisation methods used in Regional Heating Networks (RHN).

It is responsible for:
- building the transport network (Digital Twin)
- simulating passenger flow
- computing congestion and delay
- optimising network parameters
- producing Pareto-optimal solutions

The backend is self-contained, runs locally, and does not depend on the frontend.

## Core Concept

| RHN (Heating) | RTN (Transport)    |
| ------------- | ------------------ |
| Heat sources  | Bus depots         |
| Heat demand   | Passenger demand   |
| Pipes         | Roads              |
| Heat flow     | Passenger flow     |
| Pressure loss | Congestion         |
| Thermal loss  | Delay              |
| Pump power    | Transport capacity |

## How to run

1. Activate viritual envoirement
```
source myvenv/bin/activate
```

2. Install dependecies
```
pip install -r requirements.txt
```

3. Start backend sevrver
```
python -m backend.api.main
```

## Available endpoints

### /health
For debugging and testing purposes, response visible in a regular browser.
Succesful response should look like:
```json
{
"status": "ok"
}
```

### POST /pareto
Runs the transport network optimisation and returns Paretp-optimal endpoint solutions:
- congestion-optimal
- delay-optimal

Since this endpoint is reached through POST, test it with curl:
```
curl -X POST http://127.0.0.1:5000/pareto
```

Example response:
```json
{
  "congestion_optimal": {
    "capacity_scale": 2.0,
    "congestion": 350,
    "delay": 72.5,
    "objective": 350.0,
    "weights": {
      "congestion": 1.0,
      "delay": 0.0
    }
  },
  "delay_optimal": {
    "capacity_scale": 2.0,
    "congestion": 350,
    "delay": 72.5,
    "objective": 72.5,
    "weights": {
      "congestion": 0.0,
      "delay": 1.0
    }
  }
}
```

## GET /network
This returns the network used in the simulation in json format, example:
```json
{
  "nodes": [
    { "id": "Kamppi", "type": "sink", "demand": 90 },
    { "id": "Transfer_Central", "type": "ghost", "demand": 0 }
  ],
  "edges": [
    { "source": "Kamppi", "target": "Transfer_Central", "length": 3, "capacity": 100 }
  ]
}
```

## Notes
- The backend runs fully locally
- No database or cloud services are required