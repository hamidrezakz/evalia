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
} from "./sessions.api";

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
  responses: (sessionId: number, extra?: string) =>
    [...sessionsKeys.byId(sessionId), "responses", extra || "base"] as const,
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
export function useAddAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addAssignment,
    onSuccess: (a: any) =>
      qc.invalidateQueries({ queryKey: sessionsKeys.assignments(a.sessionId) }),
  });
}
export function useBulkAssign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bulkAssign,
    onSuccess: (_r, vars: any) =>
      qc.invalidateQueries({
        queryKey: sessionsKeys.assignments(vars.sessionId),
      }),
  });
}
export function useUpdateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      updateAssignment(id, body),
    onSuccess: (a: any) =>
      qc.invalidateQueries({ queryKey: sessionsKeys.assignments(a.sessionId) }),
  });
}
export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKeys.all }),
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
