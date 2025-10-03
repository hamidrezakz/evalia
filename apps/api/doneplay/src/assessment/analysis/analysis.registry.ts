import { AssessmentAnalysisService } from './types';
import { GlasserAnalysisService } from './glasser.analysis.service';

// Register all available analysis services here.
// New custom analyses: create a service implementing AssessmentAnalysisService and add instance below.
const SERVICES: AssessmentAnalysisService[] = [new GlasserAnalysisService()];

export function getTemplateAnalyses(
  template: any,
): AssessmentAnalysisService[] {
  if (!template) return [];
  return SERVICES.filter((s) => {
    try {
      return s.supports(template);
    } catch {
      return false;
    }
  });
}
