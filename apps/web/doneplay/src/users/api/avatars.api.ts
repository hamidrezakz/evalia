import { resolveApiBase } from "@/lib/api/helpers";

/**
 * Fetches the avatar image as a Blob and returns a browser object URL.
 * Automatically resolves relative URLs against API base.
 */
export async function fetchAvatarObjectUrl(urlOrPath: string): Promise<string> {
  if (!urlOrPath) throw new Error("No avatar url");
  const abs = urlOrPath.startsWith("/")
    ? resolveApiBase() + urlOrPath
    : urlOrPath;
  const resp = await fetch(abs, { credentials: "include" });
  if (!resp.ok) {
    throw new Error(`Failed to fetch avatar: ${resp.status}`);
  }
  const blob = await resp.blob();
  const objUrl = URL.createObjectURL(blob);
  return objUrl;
}
