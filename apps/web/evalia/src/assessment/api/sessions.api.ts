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

function buildSessionListPath(raw?: Partial<ListSessionsQuery>) {
  if (!raw) return "/sessions";
  const parsed = listSessionsQuerySchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid session list params");
  return "/sessions" + buildSessionsQuery(parsed.data);
}
export async function listSessions(params?: Partial<ListSessionsQuery>) {
  const path = buildSessionListPath(params);
  const res = await apiRequest(path, null, null);
  return { data: res.data as Session[], meta: res.meta };
}
export async function getSession(id: number): Promise<Session> {
  const res = await apiRequest(`/sessions/${id}`, null, sessionSchema);
  return res as unknown as Session;
}
export async function getFullSession(id: number) {
  const res = await apiRequest(`/sessions/${id}/full`, null, null);
  return res;
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
export async function createSession(body: CreateSessionBody) {
  const res = await apiRequest("/sessions", createSessionBody, sessionSchema, {
    body,
  });
  return res as unknown as Session;
}
export const updateSessionBody = createSessionBody.partial().extend({
  state: sessionStateEnum.optional(),
});
export type UpdateSessionBody = z.infer<typeof updateSessionBody>;
export async function updateSession(id: number, body: UpdateSessionBody) {
  const res = await apiRequest(
    `/sessions/${id}`,
    updateSessionBody,
    sessionSchema,
    { method: "PATCH", body }
  );
  return res as unknown as Session;
}
export async function deleteSession(id: number) {
  await apiRequest(`/sessions/${id}`, null, null, { method: "DELETE" });
  return { id };
}

// Assignments
export const addAssignmentBody = z.object({
  sessionId: z.number().int().positive(),
  userId: z.number().int().positive(),
  perspective: z.string().optional(),
});
export type AddAssignmentBody = z.infer<typeof addAssignmentBody>;
export async function addAssignment(body: AddAssignmentBody) {
  const res = await apiRequest(
    "/assignments",
    addAssignmentBody,
    assignmentSchema,
    { body }
  );
  return res as unknown as Assignment;
}
export const bulkAssignBody = z.object({
  sessionId: z.number().int().positive(),
  userIds: z.array(z.number().int().positive()).min(1),
  perspective: z.string().optional(),
});
export type BulkAssignBody = z.infer<typeof bulkAssignBody>;
const bulkAssignResultSchema = z.object({ created: z.number().int() });
export async function bulkAssign(body: BulkAssignBody) {
  // Accept both envelope shapes by skipping responseSchema and validating manually
  const res = await apiRequest("/assignments/bulk", bulkAssignBody, null, {
    method: "POST",
    body,
  });
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
export async function listAssignments(sessionId: number) {
  const res = await apiRequest(
    `/assignments/session/${sessionId}`,
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
export async function updateAssignment(id: number, body: UpdateAssignmentBody) {
  const res = await apiRequest(
    `/assignments/${id}`,
    updateAssignmentBody,
    assignmentSchema,
    { method: "PATCH", body }
  );
  return res as unknown as Assignment;
}
export async function deleteAssignment(id: number) {
  await apiRequest(`/assignments/${id}`, null, null, { method: "DELETE" });
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
export async function upsertResponse(body: UpsertResponseBody) {
  const res = await apiRequest(
    "/responses",
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
export async function bulkUpsertResponses(body: BulkUpsertResponsesBody) {
  const res = await apiRequest(
    "/responses/bulk",
    bulkUpsertResponsesBody,
    bulkUpsertResultSchema,
    { method: "POST", body }
  );
  return res as unknown as { count: number; items: AssessmentResponse[] };
}
export async function listResponses(params: any) {
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
    `/responses?sessionId=${sessionId}${qs ? "&" + qs : ""}`,
    null,
    null
  );
  return { data: res.data as AssessmentResponse[], meta: res.meta };
}
export async function getResponse(id: number) {
  const res = await apiRequest(`/responses/${id}`, null, responseSchema);
  return res as unknown as AssessmentResponse;
}
export async function deleteResponse(id: number) {
  await apiRequest(`/responses/${id}`, null, null, { method: "DELETE" });
  return { id };
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
  perspectives: z.array(responsePerspectiveEnum).default([]),
});
export type UserSessionListItem = z.infer<typeof userSessionListItemSchema>;

export async function listUserSessions(
  userId: number,
  params: Partial<ListUserSessionsQuery> = {}
) {
  const parsed = listUserSessionsQuerySchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid user sessions list params");
  const qs = buildListUserSessionsQuery(parsed.data);
  const res = await apiRequest(
    `/sessions/user/${userId}${qs}`,
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
export async function getUserPerspectives(sessionId: number, userId: number) {
  const res = await apiRequest(
    `/sessions/${sessionId}/user/${userId}/perspectives`,
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
  perspective: z.infer<typeof responsePerspectiveEnum>
) {
  const res = await apiRequest(
    `/sessions/${sessionId}/user/${userId}/questions?perspective=${encodeURIComponent(
      perspective
    )}`,
    null,
    userSessionQuestionsSchema
  );
  return (res as any)?.data as UserSessionQuestions;
}
