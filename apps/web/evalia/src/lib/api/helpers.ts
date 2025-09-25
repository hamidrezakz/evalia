import { ApiResponse } from "./types";

// Helper to extract typed data from ApiResponse
export function unwrap<T>(res: ApiResponse<T>): T {
  return res.data;
}

// Resolve API base URL for both dev and prod
export function resolveApiBase(): string {
  let raw = process.env.NEXT_PUBLIC_API_BASE;
  if (raw && raw.trim()) {
    if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw.replace(/^\/+/, "");
    return raw.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    if (port === "3000") return `${protocol}//${hostname}:4000`;
    return `${protocol}//${hostname}${port ? ":" + port : ""}`;
  }
  return "http://localhost:4000";
}
