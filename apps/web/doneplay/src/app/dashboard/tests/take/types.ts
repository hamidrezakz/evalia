export type AnswerValue =
  | { kind: "TEXT"; text: string }
  | { kind: "BOOLEAN"; value: boolean }
  | { kind: "SINGLE_CHOICE"; value: string }
  | { kind: "MULTI_CHOICE"; values: string[] }
  | { kind: "SCALE"; value: number };

export type AnswerMap = Record<number, AnswerValue>;

export type FlatQuestion = {
  sectionId: number;
  sectionTitle: string;
  linkId: number; // templateQuestionId
  questionId: number;
  order: number;
  required: boolean;
  type: string;
  text: string;
  options: Array<{ id: number; value: string; label: string; order?: number }>;
};
