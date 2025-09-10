import { getUser } from "@/app/users/api/users.api";
import type { AuthUser } from "./types";

export async function fetchUserById(userId: number): Promise<AuthUser | null> {
  if (!userId) return null as any;
  const data = await getUser(userId);
  return data as AuthUser; // adapt if envelope shape differs
}
