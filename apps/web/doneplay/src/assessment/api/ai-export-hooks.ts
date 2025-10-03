import { useQuery } from "@tanstack/react-query";
import { getUserAiExport, type BackendAiExportPayload } from "./ai-export.api";

export const aiExportKeys = {
  root: ["ai-export"] as const,
  byParams: (
    sessionId: number,
    userId: number,
    perspective: string,
    subjectUserId?: number
  ) =>
    [
      "ai-export",
      sessionId,
      userId,
      perspective,
      subjectUserId || "self",
    ] as const,
};

export function useUserAiExport(
  sessionId: number | null,
  userId: number | null,
  perspective: string | null,
  subjectUserId?: number | null
) {
  // Backend cache TTL ~30s, so we can keep staleTime in sync or slightly shorter.
  // cacheTime larger to retain data between navigations for a short period.
  return useQuery<BackendAiExportPayload | undefined>({
    queryKey:
      sessionId && userId && perspective
        ? aiExportKeys.byParams(
            sessionId,
            userId,
            perspective,
            subjectUserId || undefined
          )
        : ["ai-export", "disabled"],
    enabled: !!sessionId && !!userId && !!perspective,
    queryFn: () => {
      if (!sessionId || !userId || !perspective)
        return Promise.resolve(undefined);
      return getUserAiExport(
        sessionId,
        userId,
        perspective,
        subjectUserId || undefined
      );
    },
    staleTime: 25_000, // slightly below backend TTL to allow natural refresh when user active
    // react-query v5 renamed cacheTime -> gcTime
    gcTime: 120_000, // keep in memory for quick tab revisits
  });
}
