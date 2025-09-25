import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersKeys } from "./users-query-keys";
import { fetchAvatarObjectUrl } from "./avatars.api";
import { resolveApiBase } from "@/lib/api/helpers";

/**
 * useAvatarImage
 * - Input: relative or absolute URL like "/uploads/1.jpg" or "https://.../uploads/1.jpg"
 * - Behavior: fetches image as Blob, returns an object URL for <img/AvatarImage src>
 * - Caching: caches per-absUrl; provides a 10min stale and 1h gc time
 * - Cleanup: revokes old object URLs when query result changes/unmounts
 */
export function useAvatarImage(urlOrPath: string | null | undefined) {
  const absUrl = useMemo(() => {
    if (!urlOrPath) return null as string | null;
    return urlOrPath.startsWith("/") ? resolveApiBase() + urlOrPath : urlOrPath;
  }, [urlOrPath]);
  const lastUrlRef = useRef<string | null>(null);
  const q = useQuery({
    queryKey: absUrl
      ? usersKeys.avatarImage(absUrl)
      : ["users", "avatar-image", "disabled"],
    queryFn: async () => {
      if (!absUrl) return null as string | null;
      try {
        return await fetchAvatarObjectUrl(absUrl);
      } catch (_e) {
        return null;
      }
    },
    enabled: !!absUrl,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // If React Query returns a cached blob URL but we just mounted (no lastUrlRef),
  // that blob URL may have been revoked on previous unmount. Treat it as stale:
  //  - temporarily use absUrl as src so image still shows
  //  - trigger a refetch to get a fresh Blob/object URL
  const staleBlob = useMemo(() => {
    const v = q.data ?? null;
    return Boolean(
      v && typeof v === "string" && v.startsWith("blob:") && !lastUrlRef.current
    );
  }, [q.data]);

  useEffect(() => {
    if (staleBlob && q.refetch) {
      // Fire and forget; ignore errors, we'll keep using absUrl fallback
      q.refetch();
    }
  }, [staleBlob]);

  // Revoke previous object URL on change/unmount
  useEffect(() => {
    // Ignore setting/revoking when data is considered stale blob
    if (staleBlob) return;
    const curr = (q.data ?? null) as string | null;
    const prev = lastUrlRef.current;
    if (prev && prev !== curr) {
      try {
        URL.revokeObjectURL(prev);
      } catch {}
    }
    lastUrlRef.current = curr;
    return () => {
      const v = lastUrlRef.current;
      if (v) {
        try {
          URL.revokeObjectURL(v);
        } catch {}
        lastUrlRef.current = null;
      }
    };
  }, [q.data, staleBlob]);

  const src = (staleBlob ? absUrl : q.data) ?? absUrl;
  return {
    objectUrl: (staleBlob ? null : q.data ?? null) as string | null,
    src,
    isLoading: q.isLoading,
    error: q.error,
  };
}
