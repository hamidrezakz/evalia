// Glasser analysis dedicated type definitions.
// Central place for strongly-typed consumption of backend-provided Glasser analysis.
// If backend schema evolves (e.g. adds version, weights, normalized scores), extend here.

export interface GlasserNeedStat {
  code: string;
  label: string;
  count: number;
  sum: number;
  average: number;
  questions: number[]; // indices (1-based) of contributing questions
}

export interface GlasserAnalysisResult {
  needs: GlasserNeedStat[];
  highest?: GlasserNeedStat[];
  lowest?: GlasserNeedStat[];
  answeredQuestions: number;
  totalQuestions: number;
  // Optional future fields:
  version?: number;
  generatedAt?: string; // if backend decides to stamp
}

export function isGlasserAnalysis(obj: any): obj is GlasserAnalysisResult {
  return (
    !!obj &&
    Array.isArray(obj.needs) &&
    typeof obj.answeredQuestions === "number"
  );
}
