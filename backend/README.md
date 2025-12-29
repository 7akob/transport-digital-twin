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
