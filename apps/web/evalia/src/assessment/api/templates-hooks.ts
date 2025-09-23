import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listTemplates,
  getTemplate,
  getFullTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createTemplateSection,
  listTemplateSections,
  updateTemplateSection,
  reorderTemplateSections,
  deleteTemplateSection,
  addTemplateQuestion,
  listTemplateSectionQuestions,
  updateTemplateQuestion,
  bulkSetTemplateSectionQuestions,
  deleteTemplateQuestion,
} from "./templates.api";
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
} from "./sessions.api";
import { getUser } from "@/users/api/users.api";
import type { UserDetail } from "@/users/types/users.types";

export const templatesKeys = {
  all: ["templates"] as const,
  lists: () => ["templates", "list"] as const,
  list: (params: Record<string, unknown> | undefined) =>
    [
      ...templatesKeys.lists(),
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
  detail: () => ["templates", "detail"] as const,
  byId: (id: number) => [...templatesKeys.detail(), id] as const,
  full: (id: number) => [...templatesKeys.byId(id), "full"] as const,
  sections: (templateId: number) =>
    [...templatesKeys.byId(templateId), "sections"] as const,
  sectionQuestions: (sectionId: number) =>
    ["template-section", sectionId, "questions"] as const,
};

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
};

// Templates
export function useTemplates(params?: any) {
  return useQuery({
    queryKey: templatesKeys.list(params),
    queryFn: () => listTemplates(params),
  });
}
export function useTemplate(id: number | null) {
  return useQuery({
    queryKey: id ? templatesKeys.byId(id) : ["templates", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getTemplate(id);
    },
    enabled: !!id,
  });
}
export function useFullTemplate(id: number | null) {
  return useQuery({
    queryKey: id ? templatesKeys.full(id) : ["templates", "full", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getFullTemplate(id);
    },
    enabled: !!id,
  });
}
export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: templatesKeys.all }),
  });
}
export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      updateTemplate(id, body),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: templatesKeys.all });
      qc.setQueryData(templatesKeys.byId(t.id), t);
    },
  });
}
export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: templatesKeys.all }),
  });
}

// Sections
export function useTemplateSections(templateId: number | null) {
  return useQuery({
    queryKey: templateId
      ? templatesKeys.sections(templateId)
      : ["templates", "sections", "disabled"],
    queryFn: () => {
      if (!templateId) throw new Error("no templateId");
      return listTemplateSections(templateId);
    },
    enabled: !!templateId,
  });
}
export function useCreateTemplateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTemplateSection,
    onSuccess: (sec: any) =>
      qc.invalidateQueries({
        queryKey: templatesKeys.sections(sec.templateId),
      }),
  });
}
export function useUpdateTemplateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      updateTemplateSection(id, body),
    onSuccess: (sec: any) =>
      qc.invalidateQueries({
        queryKey: templatesKeys.sections(sec.templateId),
      }),
  });
}
export function useReorderTemplateSections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, body }: { templateId: number; body: any }) =>
      reorderTemplateSections(templateId, body),
    onSuccess: (_r, vars) =>
      qc.invalidateQueries({
        queryKey: templatesKeys.sections(vars.templateId),
      }),
  });
}
export function useDeleteTemplateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTemplateSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: templatesKeys.all }),
  });
}

// Template Questions
export function useTemplateSectionQuestions(sectionId: number | null) {
  return useQuery({
    queryKey: sectionId
      ? templatesKeys.sectionQuestions(sectionId)
      : ["template-section", "questions", "disabled"],
    queryFn: () => {
      if (!sectionId) throw new Error("no sectionId");
      return listTemplateSectionQuestions(sectionId);
    },
    enabled: !!sectionId,
  });
}
export function useAddTemplateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addTemplateQuestion,
    onSuccess: (link: any) =>
      qc.invalidateQueries({
        queryKey: templatesKeys.sectionQuestions(link.sectionId),
      }),
  });
}
export function useUpdateTemplateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      updateTemplateQuestion(id, body),
    onSuccess: (link: any) =>
      qc.invalidateQueries({
        queryKey: templatesKeys.sectionQuestions(link.sectionId),
      }),
  });
}
export function useBulkSetSectionQuestions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, body }: { sectionId: number; body: any }) =>
      bulkSetTemplateSectionQuestions(sectionId, body),
    onSuccess: (_links, vars) =>
      qc.invalidateQueries({
        queryKey: templatesKeys.sectionQuestions(vars.sectionId),
      }),
  });
}
export function useDeleteTemplateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTemplateQuestion,
    onSuccess: () => qc.invalidateQueries({ queryKey: templatesKeys.all }),
  });
}

// Sessions
export function useSessions(params?: any) {
  return useQuery({
    queryKey: sessionsKeys.list(params),
    queryFn: () => listSessions(params),
  });
}
export function useSession(id: number | null) {
  return useQuery({
    queryKey: id ? sessionsKeys.byId(id) : ["sessions", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getSession(id);
    },
    enabled: !!id,
  });
}
export function useFullSession(id: number | null) {
  return useQuery({
    queryKey: id ? sessionsKeys.full(id) : ["sessions", "full", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getFullSession(id);
    },
    enabled: !!id,
  });
}
export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKeys.all }),
  });
}
export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      updateSession(id, body),
    onSuccess: (s: any) => {
      qc.invalidateQueries({ queryKey: sessionsKeys.all });
      qc.setQueryData(sessionsKeys.byId(s.id), s);
    },
  });
}
export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKeys.all }),
  });
}

// Assignments
export function useAssignments(sessionId: number | null) {
  return useQuery({
    queryKey: sessionId
      ? sessionsKeys.assignments(sessionId)
      : ["sessions", "assignments", "disabled"],
    queryFn: () => {
      if (!sessionId) throw new Error("no sessionId");
      return listAssignments(sessionId);
    },
    enabled: !!sessionId,
  });
}

// Enriched assignments with user basic details (fullName, phone, email)
export type EnrichedAssignment = {
  id: number;
  sessionId: number;
  userId: number;
  perspective: string;
  createdAt?: string;
  updatedAt?: string;
  user: Pick<UserDetail, "id" | "fullName" | "phone" | "email"> | null;
};

export function useAssignmentsDetailed(sessionId: number | null) {
  return useQuery({
    queryKey: sessionId
      ? sessionsKeys.assignmentsDetailed(sessionId)
      : ["sessions", "assignments", "detailed", "disabled"],
    queryFn: async (): Promise<EnrichedAssignment[]> => {
      if (!sessionId) throw new Error("no sessionId");
      const raw = await listAssignments(sessionId);
      // raw is already the inner array (fixed listAssignments); each item may already include user
      const assignments: any[] = Array.isArray(raw) ? raw : [];
      // Detect if API already provides user object to avoid N+1 calls
      const needsFetch = assignments.some((a) => !a.user || !a.user.id);
      let map = new Map<number, UserDetail | null>();
      if (needsFetch) {
        const userIds = Array.from(
          new Set(assignments.map((a: any) => a.userId).filter(Boolean))
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
        const existing = a.user || null;
        const fetched = map.get(a.userId) || null;
        const u = existing || fetched || null;
        const pick = u
          ? {
              id: u.id,
              fullName: (u as any).fullName,
              phone: (u as any).phone,
              email: (u as any).email,
            }
          : null;
        return {
          id: a.id,
          sessionId: a.sessionId,
          userId: a.userId,
          perspective: a.perspective,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          user: pick,
        } as EnrichedAssignment;
      });
    },
    enabled: !!sessionId && Number.isFinite(sessionId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
export function useAddAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addAssignment,
    onSuccess: (a: any) => {
      qc.invalidateQueries({ queryKey: sessionsKeys.assignments(a.sessionId) });
      qc.invalidateQueries({
        queryKey: sessionsKeys.assignmentsDetailed(a.sessionId),
      });
    },
  });
}
export function useBulkAssign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bulkAssign,
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
export function useUpdateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      updateAssignment(id, body),
    onSuccess: (a: any) => {
      qc.invalidateQueries({ queryKey: sessionsKeys.assignments(a.sessionId) });
      qc.invalidateQueries({
        queryKey: sessionsKeys.assignmentsDetailed(a.sessionId),
      });
    },
  });
}
export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAssignment,
    onSuccess: (_res, _vars, _ctx) => {
      // We don't have sessionId here; conservatively invalidate all assignments caches
      qc.invalidateQueries({ queryKey: sessionsKeys.all });
    },
  });
}

// Responses
export function useResponses(params: any) {
  const sessionId = params?.sessionId;
  return useQuery({
    queryKey: sessionId
      ? sessionsKeys.responses(sessionId, JSON.stringify(params))
      : ["sessions", "responses", "disabled"],
    queryFn: () => listResponses(params),
    enabled: !!sessionId,
  });
}
export function useUpsertResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertResponse,
    onSuccess: (r: any) =>
      qc.invalidateQueries({ queryKey: sessionsKeys.responses(r.sessionId) }),
  });
}
export function useBulkUpsertResponses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bulkUpsertResponses,
    onSuccess: (ret: any) => {
      if (ret.items && ret.items[0])
        qc.invalidateQueries({
          queryKey: sessionsKeys.responses(ret.items[0].sessionId),
        });
    },
  });
}
export function useDeleteResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteResponse,
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKeys.all }),
  });
}

// --- User-centric hooks ---
export function useUserSessions(userId: number | null, params?: any) {
  return useQuery({
    queryKey: userId
      ? sessionsKeys.userLists(userId, params)
      : ["sessions", "user", "disabled"],
    queryFn: () => {
      if (!userId) throw new Error("no userId");
      return listUserSessions(userId, params);
    },
    enabled: !!userId,
  });
}

export function useUserPerspectives(
  sessionId: number | null,
  userId: number | null
) {
  return useQuery({
    queryKey:
      sessionId && userId
        ? sessionsKeys.userPerspectives(sessionId, userId)
        : ["sessions", "user", "perspectives", "disabled"],
    queryFn: () => {
      if (!sessionId || !userId) throw new Error("no ids");
      return getUserPerspectives(sessionId, userId);
    },
    enabled: !!sessionId && !!userId,
  });
}

export function useUserSessionQuestions(
  sessionId: number | null,
  userId: number | null,
  perspective: string | null
) {
  return useQuery({
    queryKey:
      sessionId && userId && perspective
        ? sessionsKeys.userQuestions(sessionId, userId, perspective)
        : ["sessions", "user", "questions", "disabled"],
    queryFn: () => {
      if (!sessionId || !userId || !perspective)
        throw new Error("missing inputs");
      return getUserSessionQuestions(sessionId, userId, perspective as any);
    },
    enabled: !!sessionId && !!userId && !!perspective,
  });
}
