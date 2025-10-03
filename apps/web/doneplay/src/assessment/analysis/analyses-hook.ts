import { useUserAiExport } from "../api/ai-export-hooks";
import { extractAnalyses, AnalysesMap } from "./analyses-types";

/**
 * useAssessmentAnalyses
 * Generic hook to access all analyses provided by backend AI export.
 * Returns the underlying query + extracted analyses map.
 */
export function useAssessmentAnalyses(
  sessionId: number | null,
  userId: number | null,
  perspective: string | null,
  subjectUserId?: number | null
) {
  const exportQuery = useUserAiExport(
    sessionId,
    userId,
    perspective,
    subjectUserId
  );
  const analyses: AnalysesMap | undefined = extractAnalyses(exportQuery.data);
  return { ...exportQuery, analyses };
}
