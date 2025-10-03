// Generic analysis types for AI export analyses layer.
// This allows components & hooks to work with any backend-provided analysis
// (e.g. glasser, disc, custom organizational indices) without coupling.

import { BackendAiExportPayload } from "../api/ai-export.api";

export interface BaseAnalysisResult {
  // marker interface – extends for future shared fields if needed
}

export interface GlasserAnalysisGeneric extends BaseAnalysisResult {
  needs: Array<{
    code: string;
    label: string;
    count: number;
    sum: number;
    average: number;
    questions: number[];
  }>;
  highest?: any[];
  lowest?: any[];
  answeredQuestions: number;
  totalQuestions: number;
}

export type AnyAnalysisResult = GlasserAnalysisGeneric | Record<string, any>;

export interface AnalysesMap {
  glasser?: GlasserAnalysisGeneric;
  [key: string]: AnyAnalysisResult | undefined;
}

export interface AnalysesEnvelope {
  analyses?: AnalysesMap;
}

export function extractAnalyses(
  payload?: BackendAiExportPayload
): AnalysesMap | undefined {
  if (!payload) return undefined;
  return (payload as any).analyses as AnalysesMap | undefined;
}
