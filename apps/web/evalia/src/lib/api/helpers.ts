import { ApiResponse } from "./types";

// Helper to extract typed data from ApiResponse
export function unwrap<T>(res: ApiResponse<T>): T {
  return res.data;
}
