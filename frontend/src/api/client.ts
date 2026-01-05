// frontend/src/api/client.ts
import type { NetworkResponse, ParetoResponse } from "./types";

const API_BASE = "/api";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `${init?.method ?? "GET"} ${API_BASE}${path} failed: ${res.status} ${text}`
    );
  }

  return (await res.json()) as T;
}

export function getNetwork(): Promise<NetworkResponse> {
  return http<NetworkResponse>("/network");
}

export function postPareto(body: unknown = {}): Promise<ParetoResponse> {
  return http<ParetoResponse>("/pareto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Upload an Excel file (multipart/form-data). Do NOT set Content-Type manually.
export function uploadNetwork(file: File): Promise<{
  status: string;
  nodes: number;
  edges: number;
}> {
  const fd = new FormData();
  fd.append("file", file);

  return http("/upload-network", {
    method: "POST",
    body: fd,
  });
}
