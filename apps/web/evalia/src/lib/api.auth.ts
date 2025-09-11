// Standardized API calls for authentication
import { apiRequest } from "@/lib/api/request";

export async function checkAccessToken(accessToken: string): Promise<any> {
  // No body schema or response schema for now, can be added for validation
  return apiRequest("/auth/check-token", null, null, {
    method: "POST",
    body: { accessToken },
    auth: false, // token is sent in body, not header
    refreshOn401: false,
  });
}
