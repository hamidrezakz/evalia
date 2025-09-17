import type { Question } from "@/assessment/types/question-banks.types";

// Value types for each question kind
export type TextAnswerValue = string; // empty string means unanswered UI side
export type BooleanAnswerValue = boolean; // true / false (unanswered handled via status)
export type ScaleAnswerValue = number; // numeric scale point
export type SingleChoiceAnswerValue = string; // option value
export type MultiChoiceAnswerValue = string[]; // selected option values

export type AnswerValue =
  | TextAnswerValue
  | BooleanAnswerValue
  | ScaleAnswerValue
  | SingleChoiceAnswerValue
  | MultiChoiceAnswerValue;

export type QuestionAnswerMap = Record<number, AnswerRecord | undefined>;

export type QuestionStatus =
  | "UNANSWERED" // No local value & no remote answer yet
  | "SUBMITTING" // Currently sending answer to server
  | "ANSWERED" // Successfully persisted
  | "ERROR"; // Last submit errored (still holding local value)

export interface AnswerRecord {
  questionId: number;
  value: AnswerValue;
  status: QuestionStatus;
  // If we fetched an existing answer from backend, keep its id (opaque to component logic)
  backendId?: string | number;
  // Timestamp bookkeeping (optional, for future analytics/time spent)
  updatedAt?: number; // epoch ms local
  error?: string; // last error (if status === ERROR)
}

// Contract for loading a previously saved answer
export type LoadAnswerFn = (question: Question) => Promise<{
  id?: string | number;
  value: AnswerValue;
} | null>;

// Contract for submitting an answer (create or update)
export type SubmitAnswerFn = (
  question: Question,
  value: AnswerValue,
  ctx: { previous?: AnswerRecord | undefined }
) => Promise<{ id?: string | number; value?: AnswerValue }>;

// Contract for loading options for CHOICE questions (if not provided inline)
export interface OptionItem {
  value: string;
  label: string;
  order?: number;
}
export type LoadOptionSetFn = (optionSetId: number) => Promise<OptionItem[]>;

// Generated option strategies for internal types
export interface GeneratedOptionsConfig {
  // For BOOLEAN (default localized Persian labels can be overridden)
  booleanYesLabel?: string;
  booleanNoLabel?: string;
  // For SCALE fallback if question provides no explicit min/max (rare):
  defaultScaleMin?: number; // default 1
  defaultScaleMax?: number; // default 5
}

export interface AssessmentFormProps {
  questions: Question[]; // Render order is array order
  loadAnswer: LoadAnswerFn; // must resolve quickly; can return null
  submitAnswer: SubmitAnswerFn; // handles auto save
  loadOptionSet?: LoadOptionSetFn; // required when CHOICE questions have optionSetId
  generatedOptions?: GeneratedOptionsConfig; // override labels / defaults
  autoSubmitDebounceMs?: number; // debounce for text & scale typing (default 600)
  onQuestionStatusChange?: (record: AnswerRecord) => void;
  className?: string;
  // Provide initial preloaded answers (optional optimization) keyed by questionId
  initialAnswers?: Record<
    number,
    { id?: string | number; value: AnswerValue } | undefined
  >;
}

export interface UseAssessmentAnswersArgs {
  questions: Question[];
  loadAnswer: LoadAnswerFn;
  submitAnswer: SubmitAnswerFn;
  loadOptionSet?: LoadOptionSetFn;
  generatedOptions?: GeneratedOptionsConfig;
  autoSubmitDebounceMs?: number;
  onQuestionStatusChange?: (record: AnswerRecord) => void;
  initialAnswers?: AssessmentFormProps["initialAnswers"];
}

export interface UseAssessmentAnswersResult {
  answers: QuestionAnswerMap;
  setLocalValue: (q: Question, value: AnswerValue) => void;
  submit: (q: Question) => Promise<void>;
  ensureOptions: (q: Question) => Promise<OptionItem[] | null>;
  getOptionsSync: (questionId: number) => OptionItem[] | null | undefined;
  getDisplayState: (q: Question) => AnswerRecord; // always returns a record (creates ephemeral UNANSWERED if missing)
}
