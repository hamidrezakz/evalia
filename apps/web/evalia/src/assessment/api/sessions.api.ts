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
export const updateSessionBody = createSessionBody
  .partial()
  .extend({
    state: z
      .enum(["SCHEDULED", "IN_PROGRESS", "ANALYZING", "COMPLETED", "CANCELLED"])
      .optional(),
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
  const res = await apiRequest(
    "/assignments/bulk",
    bulkAssignBody,
    bulkAssignResultSchema,
    { method: "POST", body }
  );
  return res as unknown as { created: number };
}
export async function listAssignments(sessionId: number) {
  const res = await apiRequest(
    `/assignments/session/${sessionId}`,
    null,
    z.array(assignmentSchema)
  );
  return res as unknown as Assignment[];
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
