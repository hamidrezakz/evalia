import { useQuery } from "@tanstack/react-query";
import { getUserAiExport, type BackendAiExportPayload } from "./ai-export.api";

export const aiExportKeys = {
  root: ["ai-export"] as const,
  byParams: (
    sessionId: number,
    userId: number,
    perspective: string,
    subjectUserId?: number,
    orgId?: number | null
  ) =>
    [
      "ai-export",
      sessionId,
      userId,
      perspective,
      subjectUserId || "self",
      orgId || "no-org",
    ] as const,
};

export function useUserAiExport(
  sessionId: number | null,
  userId: number | null,
  perspective: string | null,
  subjectUserId?: number | null,
  orgId?: number | null
) {
  // Backend cache TTL ~30s, so we can keep staleTime in sync or slightly shorter.
  // cacheTime larger to retain data between navigations for a short period.
  return useQuery<BackendAiExportPayload | undefined>({
    queryKey:
      sessionId && userId && perspective && orgId
        ? aiExportKeys.byParams(
            sessionId,
            userId,
            perspective,
            subjectUserId || undefined,
            orgId
          )
        : ["ai-export", "disabled"],
    enabled: !!sessionId && !!userId && !!perspective && !!orgId,
    queryFn: () => {
      if (!sessionId || !userId || !perspective || !orgId)
        return Promise.resolve(undefined);
      return getUserAiExport(
        sessionId,
        userId,
        perspective,
        subjectUserId || undefined,
        orgId || undefined
      );
    },
    staleTime: 25_000, // slightly below backend TTL to allow natural refresh when user active
    // react-query v5 renamed cacheTime -> gcTime
    gcTime: 120_000, // keep in memory for quick tab revisits
  });
}
