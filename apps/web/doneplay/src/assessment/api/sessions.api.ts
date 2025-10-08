import { z } from "zod";
import { apiRequest } from "@/lib/api.client";
import {
  sessionSchema,
  listSessionsQuerySchema,
  buildSessionsQuery,
  assignmentSchema,
  responseSchema,
  listResponsesQuerySchema,
  type ListSessionsQuery,
  type Session,
  type Assignment,
  type AssessmentResponse,
  responsePerspectiveEnum,
  sessionStateEnum,
} from "../types/templates.types";

function buildSessionListPath(
  raw?: Partial<ListSessionsQuery>,
  orgId?: number | null
) {
  if (!raw) return `/sessions${orgId ? `?organizationId=${orgId}` : ""}`;
  const parsed = listSessionsQuerySchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid session list params");
  let base = "/sessions" + buildSessionsQuery(parsed.data);
  if (orgId) {
    // If organizationId was already provided in raw, avoid duplicating
    const already = /[?&]organizationId=/.test(base);
    if (!already) {
      base += base.includes("?")
        ? `&organizationId=${orgId}`
        : `?organizationId=${orgId}`;
    }
  }
  return base;
}
export async function listSessions(
  params?: Partial<ListSessionsQuery>,
  orgId?: number | null
) {
  const path = buildSessionListPath(params, orgId);
  const res = await apiRequest(path, null, null);
  return { data: res.data as Session[], meta: res.meta };
}
export async function getSession(
  id: number,
  orgId?: number | null
): Promise<Session> {
  const res = await apiRequest(
    `/sessions/${id}${orgId ? `?organizationId=${orgId}` : ""}`,
    null,
    sessionSchema
  );
  return res as unknown as Session;
}
export async function getFullSession(id: number, orgId?: number | null) {
  const res = await apiRequest(
    `/sessions/${id}/full${orgId ? `?organizationId=${orgId}` : ""}`,
    null,
    null
  );
  return res;
}
// Minimal metadata for a session: question count
export type SessionQuestionCount = {
  sessionId: number;
  templateId: number;
  total: number;
};
export async function getSessionQuestionCount(
  id: number,
  orgId?: number | null
): Promise<SessionQuestionCount> {
  const res = await apiRequest(
    `/sessions/${id}/question-count${orgId ? `?organizationId=${orgId}` : ""}`,
    null,
    null
  );
  // apiRequest returns envelope; prefer res.data if present
  const data = (res as any)?.data ?? res;
  return data as SessionQuestionCount;
}
export const createSessionBody = z.object({
  organizationId: z.number().int().positive(),
  templateId: z.number().int().positive(),
  name: z.string().min(2),
  description: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
  teamScopeId: z.number().int().positive().optional(),
  meta: z.any().optional(),
});
export type CreateSessionBody = z.infer<typeof createSessionBody>;
export async function createSession(
  body: CreateSessionBody,
  orgId?: number | null
) {
  const payload = { ...body } as any;
  if (orgId && !payload.organizationId) payload.organizationId = orgId;
  const res = await apiRequest(
    `/sessions${orgId ? `?organizationId=${orgId}` : ""}`,
    createSessionBody,
    sessionSchema,
    {
      body: payload,
    }
  );
  return res as unknown as Session;
}
export const updateSessionBody = createSessionBody.partial().extend({
  state: sessionStateEnum.optional(),
});
export type UpdateSessionBody = z.infer<typeof updateSessionBody>;
export async function updateSession(
  id: number,
  body: UpdateSessionBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    `/sessions/${id}${orgId ? `?organizationId=${orgId}` : ""}`,
    updateSessionBody,
    sessionSchema,
    { method: "PATCH", body }
  );
  return res as unknown as Session;
}
export async function deleteSession(id: number, orgId?: number | null) {
  await apiRequest(
    `/sessions/${id}${orgId ? `?organizationId=${orgId}` : ""}`,
    null,
    null,
    { method: "DELETE" }
  );
  return { id };
}

// Assignments
export const addAssignmentBody = z.object({
  sessionId: z.number().int().positive(),
  // respondent is the answering user
  userId: z.number().int().positive().optional(),
  respondentUserId: z.number().int().positive().optional(),
  // subject is the person being evaluated; defaults to respondent for SELF
  subjectUserId: z.number().int().positive().optional(),
  perspective: z.string().optional(),
});
export type AddAssignmentBody = z.infer<typeof addAssignmentBody>;
export async function addAssignment(
  body: AddAssignmentBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    `/assignments${orgId ? `?organizationId=${orgId}` : ""}`,
    addAssignmentBody,
    assignmentSchema,
    { body }
  );
  return res as unknown as Assignment;
}
export const bulkAssignBody = z.object({
  sessionId: z.number().int().positive(),
  // for bulk, respondent user ids; subjectUserId can be shared for all
  userIds: z.array(z.number().int().positive()).min(1).optional(),
  respondentUserIds: z.array(z.number().int().positive()).min(1).optional(),
  subjectUserId: z.number().int().positive().optional(),
  perspective: z.string().optional(),
});
export type BulkAssignBody = z.infer<typeof bulkAssignBody>;
const bulkAssignResultSchema = z.object({ created: z.number().int() });
export async function bulkAssign(body: BulkAssignBody, orgId?: number | null) {
  // Accept both envelope shapes by skipping responseSchema and validating manually
  const res = await apiRequest(
    `/assignments/bulk${orgId ? `?organizationId=${orgId}` : ""}`,
    bulkAssignBody,
    null,
    {
      method: "POST",
      body,
    }
  );
  const payload =
    res && typeof res === "object" && res !== null && "data" in res
      ? (res as any).data
      : res;
  const validated = bulkAssignResultSchema.safeParse(payload);
  if (!validated.success) {
    throw new Error(
      "Bulk assign response validation failed: " + validated.error.message
    );
  }
  return validated.data as { created: number };
}
export async function listAssignments(
  sessionId: number,
  orgId?: number | null
) {
  const res = await apiRequest(
    `/assignments/session/${sessionId}${
      orgId ? `?organizationId=${orgId}` : ""
    }`,
    null,
    z.array(assignmentSchema)
  );
  // apiRequest returns the standard envelope; when a responseSchema is provided
  // it replaces envelope.data with the validated inner data array
  return (res as any)?.data as Assignment[];
}
export const updateAssignmentBody = z.object({
  perspective: z.string().optional(),
});
export type UpdateAssignmentBody = z.infer<typeof updateAssignmentBody>;
export async function updateAssignment(
  id: number,
  body: UpdateAssignmentBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    `/assignments/${id}${orgId ? `?organizationId=${orgId}` : ""}`,
    updateAssignmentBody,
    assignmentSchema,
    { method: "PATCH", body }
  );
  return res as unknown as Assignment;
}
export async function deleteAssignment(id: number, orgId?: number | null) {
  await apiRequest(
    `/assignments/${id}${orgId ? `?organizationId=${orgId}` : ""}`,
    null,
    null,
    { method: "DELETE" }
  );
  return { id };
}

// Responses
export const upsertResponseBody = z.object({
  assignmentId: z.number().int().positive(),
  sessionId: z.number().int().positive(),
  templateQuestionId: z.number().int().positive(),
  scaleValue: z.number().optional(),
  optionValue: z.string().optional(),
  optionValues: z.array(z.string()).optional(),
  textValue: z.string().optional(),
});
export type UpsertResponseBody = z.infer<typeof upsertResponseBody>;
export async function upsertResponse(
  body: UpsertResponseBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    `/responses${orgId ? `?organizationId=${orgId}` : ""}`,
    upsertResponseBody,
    responseSchema,
    { body }
  );
  return res as unknown as AssessmentResponse;
}
export const bulkUpsertResponsesBody = z.object({
  items: z.array(upsertResponseBody).min(1),
});
export type BulkUpsertResponsesBody = z.infer<typeof bulkUpsertResponsesBody>;
const bulkUpsertResultSchema = z.object({
  count: z.number().int(),
  items: z.array(responseSchema),
});
export async function bulkUpsertResponses(
  body: BulkUpsertResponsesBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    `/responses/bulk${orgId ? `?organizationId=${orgId}` : ""}`,
    bulkUpsertResponsesBody,
    bulkUpsertResultSchema,
    { method: "POST", body }
  );
  return res as unknown as { count: number; items: AssessmentResponse[] };
}
export async function listResponses(params: any, orgId?: number | null) {
  const parsed = listResponsesQuerySchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid responses list params");
  const { sessionId, ...rest } = parsed.data;
  const entries: [string, string][] = [];
  for (const [k, v] of Object.entries(rest)) {
    if (v == null) continue;
    entries.push([k, String(v)]);
  }
  const qs = entries
    .map((e) => `${encodeURIComponent(e[0])}=${encodeURIComponent(e[1])}`)
    .join("&");
  const res = await apiRequest(
    `/responses?sessionId=${sessionId}${qs ? "&" + qs : ""}${
      orgId ? `&orgId=${orgId}` : ""
    }`,
    null,
    null
  );
  return { data: res.data as AssessmentResponse[], meta: res.meta };
}
export async function getResponse(id: number, orgId?: number | null) {
  const res = await apiRequest(
    `/responses/${id}${orgId ? `?organizationId=${orgId}` : ""}`,
    null,
    responseSchema
  );
  return res as unknown as AssessmentResponse;
}
export async function deleteResponse(id: number, orgId?: number | null) {
  await apiRequest(
    `/responses/${id}${orgId ? `?organizationId=${orgId}` : ""}`,
    null,
    null,
    { method: "DELETE" }
  );
  return { id };
}

// --- Progress API ---
export type ProgressStatus =
  | "NOT_ASSIGNED"
  | "NO_QUESTIONS"
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED";
export interface UserProgress {
  total: number;
  answered: number;
  percent: number; // 0..100
  status: ProgressStatus;
  context?: any;
}
export async function getUserProgress(
  params:
    | { assignmentId: number }
    | {
        sessionId: number;
        userId: number;
        perspective?: string;
        subjectUserId?: number;
      },
  orgId?: number | null
) {
  const entries = Object.entries(params).map(
    ([k, v]) => [k, String(v)] as [string, string]
  );
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  const res = await apiRequest(
    `/responses/progress/by?${qs}${orgId ? `&orgId=${orgId}` : ""}`,
    null,
    null
  );
  return (res as any)?.data as UserProgress;
}

// --- User-centric session APIs ---
// List sessions for a user (for sidebar) with available perspectives per session
export const listUserSessionsQuerySchema = z.object({
  state: sessionStateEnum.optional(),
  organizationId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  pageSize: z.coerce.number().int().positive().max(100).default(20).optional(),
});
export type ListUserSessionsQuery = z.infer<typeof listUserSessionsQuerySchema>;
function buildListUserSessionsQuery(params: Partial<ListUserSessionsQuery>) {
  const entries: [string, string][] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "") continue;
    entries.push([k, String(v)]);
  }
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

const userSessionListItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  state: sessionStateEnum,
  organizationId: z.number().int().positive(),
  templateId: z.number().int().positive(),
  startAt: z.string(),
  endAt: z.string(),
  assignedAt: z.string().optional().nullable(),
  perspectives: z.array(responsePerspectiveEnum).default([]),
});
export type UserSessionListItem = z.infer<typeof userSessionListItemSchema>;

export async function listUserSessions(
  userId: number,
  params: Partial<ListUserSessionsQuery> = {},
  orgId?: number | null
) {
  const parsed = listUserSessionsQuerySchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid user sessions list params");
  const qs = buildListUserSessionsQuery(parsed.data);
  const res = await apiRequest(
    // Backend DTO expects 'organizationId' (ListUserSessionsQueryDto); previously we sent 'orgId' causing 400.
    `/sessions/user/${userId}${qs}${
      orgId
        ? qs
          ? `&organizationId=${orgId}`
          : `?organizationId=${orgId}`
        : ""
    }`,
    null,
    z.array(userSessionListItemSchema)
  );
  return {
    data: (res as any)?.data as UserSessionListItem[],
    meta: (res as any)?.meta,
  };
}

// List perspectives available to a user in a session
const userPerspectivesSchema = z.object({
  sessionId: z.number().int().positive(),
  userId: z.number().int().positive(),
  perspectives: z.array(responsePerspectiveEnum).default([]),
});
export type UserPerspectives = z.infer<typeof userPerspectivesSchema>;
export async function getUserPerspectives(
  sessionId: number,
  userId: number,
  orgId?: number | null
) {
  const res = await apiRequest(
    `/sessions/${sessionId}/user/${userId}/perspectives${
      orgId ? `?organizationId=${orgId}` : ""
    }`,
    null,
    userPerspectivesSchema
  );
  return (res as any)?.data as UserPerspectives;
}

// Get ordered questions for a user in a session for a chosen perspective
import {
  questionSchema,
  optionSetSchema,
  optionSetOptionSchema,
} from "../types/question-banks.types";
const questionWithOptionsSchema = questionSchema.extend({
  options: z
    .array(
      z.object({
        id: z.number(),
        value: z.string(),
        label: z.string(),
        order: z.number().optional(),
      })
    )
    .optional(),
  optionSet: optionSetSchema
    .extend({ options: z.array(optionSetOptionSchema).optional() })
    .nullable()
    .optional(),
});
const userQuestionLinkSchema = z.object({
  templateQuestionId: z.number().int().positive(),
  questionId: z.number().int().positive(),
  required: z.boolean(),
  order: z.number().int().nonnegative(),
  question: questionWithOptionsSchema,
});
const userQuestionsSectionSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  order: z.number().int().nonnegative(),
  questions: z.array(userQuestionLinkSchema),
});
const userSessionQuestionsSchema = z.object({
  session: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    state: sessionStateEnum,
  }),
  assignment: z.object({
    id: z.number().int().positive(),
    perspective: responsePerspectiveEnum,
  }),
  sections: z.array(userQuestionsSectionSchema),
  responses: z
    .array(
      z.object({
        id: z.number().int().positive(),
        assignmentId: z.number().int().positive(),
        sessionId: z.number().int().positive(),
        templateQuestionId: z.number().int().positive(),
        scaleValue: z.number().nullable().optional(),
        optionValue: z.string().nullable().optional(),
        optionValues: z.array(z.string()).optional(),
        textValue: z.string().nullable().optional(),
        createdAt: z.string(),
        updatedAt: z.string().optional(),
      })
    )
    .optional(),
});
export type UserSessionQuestions = z.infer<typeof userSessionQuestionsSchema>;
export async function getUserSessionQuestions(
  sessionId: number,
  userId: number,
  perspective: z.infer<typeof responsePerspectiveEnum>,
  subjectUserId?: number,
  orgId?: number | null
) {
  const res = await apiRequest(
    `/sessions/${sessionId}/user/${userId}/questions?perspective=${encodeURIComponent(
      perspective
    )}${
      subjectUserId
        ? `&subjectUserId=${encodeURIComponent(String(subjectUserId))}`
        : ""
    }${orgId ? `&organizationId=${orgId}` : ""}`,
    null,
    userSessionQuestionsSchema
  );
  return (res as any)?.data as UserSessionQuestions;
}
