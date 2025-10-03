export interface AnalysisQuestionView {
  number: number;
  numeric: number | null;
  answer: string | null;
  type: string;
}

export interface AssessmentAnalysisContext {
  template: any; // Prisma template (light)
  questions: AnalysisQuestionView[]; // flattened ordered questions
  answered: number; // count answered questions
  total: number; // total questions
}

export interface AssessmentAnalysisService {
  // Unique key placed under analyses[key]
  key: string;
  // Whether this service should run for given template (id-based or meta-based)
  supports(template: any): boolean;
  // Perform analysis and return serializable result
  analyze(ctx: AssessmentAnalysisContext): any;
}
