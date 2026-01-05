import type { NetworkResponse, ParetoResponse } from "./types";

const API_BASE = "/api";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json().catch(() => null);
      const msg = data?.error ?? "Request failed";
      throw new Error(msg);
    }

    // If backend accidentally returns HTML, show generic message
    throw new Error("Request failed");
  }

  return (await res.json()) as T;
}

async function httpBlob(path: string, init?: RequestInit): Promise<Blob> {
  const res = await fetch(`${API_BASE}${path}`, init);

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json().catch(() => null);
      const msg = data?.error ?? "Request failed";
      throw new Error(msg);
    }

    throw new Error("Request failed");
  }

  return await res.blob();
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

// Download latest optimization results as a CSV (Blob).
export function downloadResults(): Promise<Blob> {
  return httpBlob("/download-results", { method: "GET" });
}
