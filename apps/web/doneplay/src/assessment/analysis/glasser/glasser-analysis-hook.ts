import { GlasserAnalysisResult } from "./glasser-types";
import { useAssessmentAnalyses } from "../analyses-hook";

export function useGlasserAnalysis(
  sessionId: number | null,
  userId: number | null,
  perspective: string | null,
  subjectUserId?: number | null
) {
  // Deprecated: Prefer using useAssessmentAnalyses directly in new code
  const query = useAssessmentAnalyses(
    sessionId,
    userId,
    perspective,
    subjectUserId
  );
  const analysis = (query.analyses?.glasser ||
    null) as GlasserAnalysisResult | null;
  return { ...query, analysis };
}
