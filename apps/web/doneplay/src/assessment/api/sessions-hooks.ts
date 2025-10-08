import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSessions,
  getSession,
  getFullSession,
  createSession,
  updateSession,
  deleteSession,
  addAssignment,
  bulkAssign,
  listAssignments,
  updateAssignment,
  deleteAssignment,
  upsertResponse,
  bulkUpsertResponses,
  listResponses,
  deleteResponse,
  listUserSessions,
  getUserPerspectives,
  getUserSessionQuestions,
  getUserProgress,
  getSessionQuestionCount,
} from "./sessions.api";
import { getUser } from "@/users/api/users.api";
import type { UserDetail } from "@/users/types/users.types";

export const sessionsKeys = {
  all: ["sessions"] as const,
  lists: () => ["sessions", "list"] as const,
  list: (params: Record<string, unknown> | undefined) =>
    [
      ...sessionsKeys.lists(),
      params
        ? JSON.stringify(
            Object.keys(params)
              .sort()
              .reduce((a: any, k) => {
                a[k] = (params as any)[k];
                return a;
              }, {})
          )
        : "all",
    ] as const,
  detail: () => ["sessions", "detail"] as const,
  byId: (id: number) => [...sessionsKeys.detail(), id] as const,
  full: (id: number) => [...sessionsKeys.byId(id), "full"] as const,
  questionCount: (id: number) =>
    [...sessionsKeys.byId(id), "question-count"] as const,
  assignments: (sessionId: number) =>
    [...sessionsKeys.byId(sessionId), "assignments"] as const,
  assignmentsDetailed: (sessionId: number) =>
    [...sessionsKeys.byId(sessionId), "assignments", "detailed"] as const,
  responses: (sessionId: number, extra?: string) =>
    [...sessionsKeys.byId(sessionId), "responses", extra || "base"] as const,
  userLists: (userId: number, params?: Record<string, unknown>) =>
    [
      ...sessionsKeys.all,
      "user",
      userId,
      params
        ? JSON.stringify(
            Object.keys(params)
              .sort()
              .reduce((a: any, k) => {
                a[k] = (params as any)[k];
                return a;
              }, {})
          )
        : "all",
    ] as const,
  userPerspectives: (sessionId: number, userId: number) =>
    [...sessionsKeys.byId(sessionId), "user", userId, "perspectives"] as const,
  userQuestions: (sessionId: number, userId: number, perspective: string) =>
    [
      ...sessionsKeys.byId(sessionId),
      "user",
      userId,
      "questions",
      perspective,
    ] as const,
  progressByAssignment: (assignmentId: number) =>
    ["responses", "progress", "assignment", assignmentId] as const,
  progressBySessionUser: (
    sessionId: number,
    userId: number,
    perspective?: string,
    subjectUserId?: number
  ) =>
    [
      "responses",
      "progress",
      "session",
      sessionId,
      "user",
      userId,
      perspective || "any",
      subjectUserId || "none",
    ] as const,
};

// Sessions (scoped by orgId)
export function useSessions(orgId: number | null, params?: any) {
  return useQuery({
    queryKey: orgId
      ? [...sessionsKeys.list(params), orgId]
      : ["sessions", "list", "disabled"],
    queryFn: () => listSessions(params, orgId || undefined),
    enabled: !!orgId,
  });
}
export function useSession(orgId: number | null, id: number | null) {
  return useQuery({
    queryKey:
      id && orgId
        ? [...sessionsKeys.byId(id), orgId]
        : id
        ? [...sessionsKeys.byId(id), "no-org"]
        : ["sessions", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getSession(id, orgId || undefined);
    },
    enabled: !!id, // allow guard fallback to infer orgId server-side
  });
}
export function useFullSession(orgId: number | null, id: number | null) {
  return useQuery({
    queryKey:
      id && orgId
        ? [...sessionsKeys.full(id), orgId]
        : id
        ? [...sessionsKeys.full(id), "no-org"]
        : ["sessions", "full", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getFullSession(id, orgId || undefined);
    },
    enabled: !!id,
  });
}
export function useSessionQuestionCount(
  orgId: number | null,
  id: number | null
) {
  return useQuery({
    queryKey:
      id && orgId
        ? [...sessionsKeys.questionCount(id), orgId]
        : id
        ? [...sessionsKeys.questionCount(id), "no-org"]
        : (["sessions", "question-count", "disabled"] as const),
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getSessionQuestionCount(id, orgId || undefined);
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
export function useCreateSession(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => {
      if (!orgId) throw new Error("orgId required");
      return createSession(body, orgId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKeys.all }),
  });
}
export function useUpdateSession(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => {
      if (!orgId) throw new Error("orgId required");
      return updateSession(id, body, orgId);
    },
    onSuccess: (s: any) => {
      qc.invalidateQueries({ queryKey: sessionsKeys.all });
      qc.setQueryData(sessionsKeys.byId(s.id), s);
    },
  });
}
export function useDeleteSession(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      if (!orgId) throw new Error("orgId required");
      return deleteSession(id, orgId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKeys.all }),
  });
}

// Assignments
export function useAssignments(orgId: number | null, sessionId: number | null) {
  return useQuery({
    queryKey:
      sessionId && orgId
        ? [...sessionsKeys.assignments(sessionId), orgId]
        : ["sessions", "assignments", "disabled"],
    queryFn: () => {
      if (!sessionId) throw new Error("no sessionId");
      return listAssignments(sessionId, orgId || undefined);
    },
    enabled: !!sessionId && !!orgId,
  });
}

// Enriched assignments with user basic details
export type EnrichedAssignment = {
  id: number;
  sessionId: number;
  userId?: number;
  respondentUserId?: number;
  subjectUserId?: number;
  perspective: string;
  createdAt?: string;
  updatedAt?: string;
  user: Pick<UserDetail, "id" | "fullName" | "phone" | "email"> | null;
  respondent?: Pick<UserDetail, "id" | "fullName" | "phone" | "email"> | null;
  subject?: Pick<UserDetail, "id" | "fullName" | "phone" | "email"> | null;
};

export function useAssignmentsDetailed(
  orgId: number | null,
  sessionId: number | null
) {
  return useQuery({
    queryKey:
      sessionId && orgId
        ? [...sessionsKeys.assignmentsDetailed(sessionId), orgId]
        : ["sessions", "assignments", "detailed", "disabled"],
    queryFn: async (): Promise<EnrichedAssignment[]> => {
      if (!sessionId) throw new Error("no sessionId");
      const raw = await listAssignments(sessionId, orgId || undefined);
      const assignments: any[] = Array.isArray(raw) ? raw : [];
      const needsFetch = assignments.some(
        (a) => !(a.user && a.user.id) && !(a.respondent && a.respondent.id)
      );
      let map = new Map<number, UserDetail | null>();
      if (needsFetch) {
        const userIds = Array.from(
          new Set(
            assignments
              .map((a: any) => a.respondentUserId ?? a.userId)
              .filter(Boolean)
          )
        ) as number[];
        const users = await Promise.all(
          userIds.map((id) =>
            getUser(id)
              .then((u) => u as UserDetail)
              .catch(() => null)
          )
        );
        map = new Map<number, UserDetail | null>();
        userIds.forEach((id, idx) => map.set(id, users[idx]));
      }
      return assignments.map((a: any) => {
        const respondentId = a.respondentUserId ?? a.userId;
        const subjectId = a.subjectUserId ?? respondentId;
        const existingRespondent = a.user || a.respondent || null;
        const fetchedRespondent = respondentId ? map.get(respondentId) : null;
        const ru = existingRespondent || fetchedRespondent || null;
        const rpick = ru
          ? {
              id: ru.id,
              fullName: (ru as any).fullName,
              phone: (ru as any).phone,
              email: (ru as any).email,
            }
          : null;
        const spick = a.subject
          ? {
              id: a.subject.id,
              fullName: (a.subject as any).fullName,
              phone: (a.subject as any).phone,
              email: (a.subject as any).email,
            }
          : null;
        return {
          id: a.id,
          sessionId: a.sessionId,
          userId: a.userId,
          respondentUserId: a.respondentUserId,
          subjectUserId: a.subjectUserId,
          perspective: a.perspective,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          user: rpick,
          respondent: rpick,
          subject: spick,
        } as EnrichedAssignment;
      });
    },
    enabled: !!sessionId && Number.isFinite(sessionId),
    staleTime: 0,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
export function useAddAssignment(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => {
      if (!orgId) throw new Error("orgId required");
      return addAssignment(body, orgId);
    },
    onSuccess: (a: any, vars: any) => {
      const sessionId = (a && a.sessionId) || vars?.sessionId;
      if (!sessionId) return;
      try {
        const key = sessionsKeys.assignmentsDetailed(sessionId);
        const existing =
          qc.getQueryData<EnrichedAssignment[] | undefined>(key) || [];
        const optimistic: EnrichedAssignment = {
          id: a.id,
          sessionId: sessionId,
          userId: a.userId,
          respondentUserId:
            a.respondentUserId ||
            a.userId ||
            vars?.respondentUserId ||
            vars?.userId,
          subjectUserId:
            a.subjectUserId || a.respondentUserId || a.userId || null,
          perspective: a.perspective || vars?.perspective || "SELF",
          createdAt: a.createdAt || new Date().toISOString(),
          updatedAt: a.updatedAt || new Date().toISOString(),
          user: null,
          respondent: null,
          subject: null,
        };
        const withoutDup = existing.filter((it) => it.id !== optimistic.id);
        qc.setQueryData(key, [...withoutDup, optimistic]);
      } catch {}
      qc.invalidateQueries({ queryKey: sessionsKeys.assignments(sessionId) });
      qc.invalidateQueries({
        queryKey: sessionsKeys.assignmentsDetailed(sessionId),
      });
      qc.refetchQueries({
        queryKey: sessionsKeys.assignmentsDetailed(sessionId),
      });
    },
  });
}
export function useBulkAssign(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => {
      if (!orgId) throw new Error("orgId required");
      return bulkAssign(body, orgId);
    },
    onSuccess: (_r, vars: any) => {
      qc.invalidateQueries({
        queryKey: sessionsKeys.assignments(vars.sessionId),
      });
      qc.invalidateQueries({
        queryKey: sessionsKeys.assignmentsDetailed(vars.sessionId),
      });
    },
  });
}
export function useUpdateAssignment(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => {
      if (!orgId) throw new Error("orgId required");
      return updateAssignment(id, body, orgId);
    },
    onSuccess: (a: any) => {
      qc.invalidateQueries({ queryKey: sessionsKeys.assignments(a.sessionId) });
      qc.invalidateQueries({
        queryKey: sessionsKeys.assignmentsDetailed(a.sessionId),
      });
    },
  });
}
export function useDeleteAssignment(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      if (!orgId) throw new Error("orgId required");
      return deleteAssignment(id, orgId);
    },
    onSuccess: (_res, _vars, _ctx) => {
      qc.invalidateQueries({ queryKey: sessionsKeys.all });
    },
  });
}

// Responses
export function useResponses(orgId: number | null, params: any) {
  const sessionId = params?.sessionId;
  return useQuery({
    queryKey:
      sessionId && orgId
        ? [...sessionsKeys.responses(sessionId, JSON.stringify(params)), orgId]
        : ["sessions", "responses", "disabled"],
    queryFn: () => listResponses(params, orgId || undefined),
    enabled: !!sessionId && !!orgId,
  });
}
export function useUpsertResponse(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => {
      if (!orgId) throw new Error("orgId required");
      return upsertResponse(body, orgId);
    },
    onSuccess: (r: any) =>
      qc.invalidateQueries({ queryKey: sessionsKeys.responses(r.sessionId) }),
  });
}
export function useBulkUpsertResponses(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => {
      if (!orgId) throw new Error("orgId required");
      return bulkUpsertResponses(body, orgId);
    },
    onSuccess: (ret: any) => {
      if (ret.items && ret.items[0])
        qc.invalidateQueries({
          queryKey: sessionsKeys.responses(ret.items[0].sessionId),
        });
    },
  });
}
export function useDeleteResponse(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      if (!orgId) throw new Error("orgId required");
      return deleteResponse(id, orgId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKeys.all }),
  });
}

// Progress
export function useAssignmentProgress(
  orgId: number | null,
  assignmentId: number | null
) {
  return useQuery({
    queryKey: assignmentId
      ? sessionsKeys.progressByAssignment(assignmentId)
      : (["responses", "progress", "assignment", "disabled"] as const),
    queryFn: async () => {
      if (!assignmentId) throw new Error("no assignmentId");
      return await getUserProgress({ assignmentId }, orgId || undefined);
    },
    enabled: !!assignmentId && !!orgId,
    staleTime: 30 * 1000,
  });
}
export function useUserSessionProgress(
  orgId: number | null,
  sessionId: number | null,
  userId: number | null,
  opts?: { perspective?: string; subjectUserId?: number }
) {
  return useQuery({
    queryKey:
      sessionId && userId && orgId
        ? sessionsKeys.progressBySessionUser(
            sessionId,
            userId,
            opts?.perspective,
            opts?.subjectUserId
          )
        : ["responses", "progress", "session", "disabled"],
    queryFn: async () => {
      if (!sessionId || !userId) throw new Error("missing ids");
      return await getUserProgress(
        {
          sessionId,
          userId,
          perspective: opts?.perspective,
          subjectUserId: opts?.subjectUserId,
        } as any,
        orgId || undefined
      );
    },
    enabled: !!sessionId && !!userId && !!orgId,
    staleTime: 30 * 1000,
  });
}

// User-centric
export function useUserSessions(
  orgId: number | null,
  userId: number | null,
  params?: any
) {
  return useQuery({
    queryKey:
      userId && orgId
        ? [...sessionsKeys.userLists(userId, params), orgId]
        : ["sessions", "user", "disabled"],
    queryFn: () => {
      if (!userId) throw new Error("no userId");
      return listUserSessions(userId, params, orgId || undefined);
    },
    enabled: !!userId && !!orgId,
  });
}
export function useUserPerspectives(
  orgId: number | null,
  sessionId: number | null,
  userId: number | null
) {
  return useQuery({
    queryKey:
      sessionId && userId && orgId
        ? [...sessionsKeys.userPerspectives(sessionId, userId), orgId]
        : ["sessions", "user", "perspectives", "disabled"],
    queryFn: () => {
      if (!sessionId || !userId) throw new Error("no ids");
      return getUserPerspectives(sessionId, userId, orgId || undefined);
    },
    enabled: !!sessionId && !!userId && !!orgId,
  });
}
export function useUserSessionQuestions(
  orgId: number | null,
  sessionId: number | null,
  userId: number | null,
  perspective: string | null,
  subjectUserId?: number | null
) {
  return useQuery({
    queryKey:
      sessionId && userId && perspective && orgId
        ? [
            ...sessionsKeys.userQuestions(sessionId, userId, perspective),
            subjectUserId ?? "no-subject",
            orgId,
          ]
        : ["sessions", "user", "questions", "disabled"],
    queryFn: () => {
      if (!sessionId || !userId || !perspective)
        throw new Error("missing inputs");
      return getUserSessionQuestions(
        sessionId,
        userId,
        perspective as any,
        subjectUserId ?? undefined,
        orgId || undefined
      );
    },
    enabled: !!sessionId && !!userId && !!perspective && !!orgId,
  });
}
