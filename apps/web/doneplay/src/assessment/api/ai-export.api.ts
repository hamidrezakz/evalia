import { apiRequest } from "@/lib/api.client";

export interface BackendAiExportMetaOptionValue {
  value: string;
  numeric: number;
}
export interface BackendAiExportMeta {
  generatedAt: string;
  sessionId: number;
  sessionName: string;
  perspective: string;
  assignmentId: number;
  totalQuestions: number;
  answered: number;
  unanswered: number;
  optionSet?: { values: BackendAiExportMetaOptionValue[] };
}
export interface BackendAiExportQuestion {
  number: number;
  templateQuestionId: number;
  text: string;
  type: string; // added (SCALE | SINGLE_CHOICE | MULTI_CHOICE | TEXT ...)
  answer: string | null;
  answers?: string[] | null; // for multi choice
  selected?: { value: string; numeric?: number | null }[]; // detailed multi-choice
  numeric?: number | null;
  required: boolean;
  scaleRange?: { min: number; max: number };
}

export interface BackendAiExportTemplateInfo {
  id: number;
  slug: string;
  name: string;
  templateMeta: any; // contains glasserScoring etc.
}

export interface BackendAiExportAnalyses {
  glasser?: any; // shape defined by backend Glasser analysis
  [key: string]: any;
}

export interface BackendAiExportPayload {
  template?: BackendAiExportTemplateInfo;
  meta: BackendAiExportMeta;
  questions: BackendAiExportQuestion[];
  analyses?: BackendAiExportAnalyses;
}

export async function getUserAiExport(
  sessionId: number,
  userId: number,
  perspective: string,
  subjectUserId?: number
): Promise<BackendAiExportPayload> {
  const url = `/sessions/${sessionId}/user/${userId}/ai-export?perspective=${encodeURIComponent(
    perspective
  )}${
    subjectUserId
      ? `&subjectUserId=${encodeURIComponent(String(subjectUserId))}`
      : ""
  }`;
  const res = await apiRequest(url, null, null);
  // backend returns { success, data } envelope
  const data = (res as any)?.data ?? res;
  return data as BackendAiExportPayload;
}
