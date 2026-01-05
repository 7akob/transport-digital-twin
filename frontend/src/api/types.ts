export type NetworkNode = {
  id: string;
  type?: string;
  demand?: number;
  [k: string]: unknown;
};

export type NetworkEdge = {
  source: string;
  target: string;
  length?: number;
  capacity?: number;

  // optional operational fields if backend provides them
  flow?: number;
  utilization?: number; // 0..1
  delay?: number;

  [k: string]: unknown;
};

export type NetworkResponse = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
};

// ---- Pareto (typed to match your actual /pareto response) ----

export type ParetoEdge = {
  source: string;
  target: string;
  length: number;
  capacity: number;
  flow: number;
  congestion: number;
  delay: number;
};

export type ParetoSolution = {
  capacity_scale: number;
  congestion: number;
  delay: number;
  objective: number;
  weights: { congestion: number; delay: number };
  edges: ParetoEdge[];
};

export type ParetoResponse = {
  congestion_optimal: ParetoSolution;
  delay_optimal: ParetoSolution;
};
