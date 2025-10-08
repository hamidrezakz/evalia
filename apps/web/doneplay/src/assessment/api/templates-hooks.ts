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
// Session hooks moved to sessions-hooks.ts to keep this file template-focused.

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

// Templates
export function useTemplates(orgId: number | null, params?: any) {
  return useQuery({
    queryKey: orgId
      ? [...templatesKeys.list(params), orgId]
      : ["templates", "list", "disabled"],
    queryFn: () => listTemplates(params, orgId || undefined),
    enabled: !!orgId,
    // Keep list data warm for short period to avoid flicker when navigating back
    staleTime: 60 * 1000,
    // Avoid aggressive refetch on window focus while building templates
    refetchOnWindowFocus: false,
    // NOTE: keepPreviousData removed (older @tanstack/react-query version) – emulate manually in consumer if needed
  });
}
export function useTemplate(orgId: number | null, id: number | null) {
  return useQuery({
    queryKey:
      id && orgId
        ? [...templatesKeys.byId(id), orgId]
        : ["templates", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getTemplate(id, orgId || undefined);
    },
    enabled: !!id && !!orgId,
  });
}
export function useFullTemplate(orgId: number | null, id: number | null) {
  return useQuery({
    queryKey:
      id && orgId
        ? [...templatesKeys.full(id), orgId]
        : ["templates", "full", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getFullTemplate(id, orgId || undefined);
    },
    enabled: !!id && !!orgId,
  });
}
export function useCreateTemplate(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => {
      if (!orgId) throw new Error("orgId required");
      return createTemplate(body, orgId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: templatesKeys.all }),
  });
}
export function useUpdateTemplate(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => {
      if (!orgId) throw new Error("orgId required");
      return updateTemplate(id, body, orgId);
    },
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: templatesKeys.all });
      qc.setQueryData(templatesKeys.byId(t.id), t);
    },
  });
}
export function useDeleteTemplate(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      if (!orgId) throw new Error("orgId required");
      return deleteTemplate(id, orgId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: templatesKeys.all }),
  });
}

// Sections
export function useTemplateSections(
  orgId: number | null,
  templateId: number | null
) {
  return useQuery({
    queryKey: templateId
      ? templatesKeys.sections(templateId)
      : ["templates", "sections", "disabled"],
    queryFn: () => {
      if (!templateId) throw new Error("no templateId");
      return listTemplateSections(templateId, orgId || undefined);
    },
    enabled: !!templateId && !!orgId,
  });
}
export function useCreateTemplateSection(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => {
      if (!orgId) throw new Error("orgId required");
      return createTemplateSection(body, orgId);
    },
    // Optimistically add new section to current cache for its template
    onMutate: async (vars: any) => {
      await qc.cancelQueries({
        queryKey: templatesKeys.sections(vars.templateId),
      });
      const previous = qc.getQueryData<any>(
        templatesKeys.sections(vars.templateId)
      );
      if (previous && Array.isArray(previous)) {
        const optimistic = {
          id: Math.random() * -1000000, // temp negative-ish id
          name: vars.name || "بخش جدید",
          templateId: vars.templateId,
          description: vars.description || null,
          order: previous.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        qc.setQueryData(templatesKeys.sections(vars.templateId), [
          ...previous,
          optimistic,
        ]);
      }
      return { previous };
    },
    onError: (_err, vars: any, ctx: any) => {
      if (ctx?.previous) {
        qc.setQueryData(templatesKeys.sections(vars.templateId), ctx.previous);
      }
    },
    onSuccess: (sec: any) => {
      // Replace optimistic list with authoritative data
      qc.invalidateQueries({
        queryKey: templatesKeys.sections(sec.templateId),
      });
      // Also refresh any full template detail queries (nested structure consumers)
      qc.invalidateQueries({ queryKey: templatesKeys.full(sec.templateId) });
    },
  });
}
export function useUpdateTemplateSection(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => {
      if (!orgId) throw new Error("orgId required");
      return updateTemplateSection(id, body, orgId);
    },
    onSuccess: (sec: any) =>
      qc.invalidateQueries({
        queryKey: templatesKeys.sections(sec.templateId),
      }),
  });
}
export function useReorderTemplateSections(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, body }: { templateId: number; body: any }) => {
      if (!orgId) throw new Error("orgId required");
      return reorderTemplateSections(templateId, body, orgId);
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({
        queryKey: templatesKeys.sections(vars.templateId),
      });
      const prev = qc.getQueryData<any>(
        templatesKeys.sections(vars.templateId)
      );
      if (prev && Array.isArray(prev)) {
        const idOrder: number[] = vars.body?.sectionIds || [];
        const mapped = [...prev]
          .slice()
          .sort(
            (a: any, b: any) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id)
          );
        qc.setQueryData(templatesKeys.sections(vars.templateId), mapped);
      }
      return { prev };
    },
    onError: (_e, vars, ctx) => {
      if (ctx?.prev)
        qc.setQueryData(templatesKeys.sections(vars.templateId), ctx.prev);
    },
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({
        queryKey: templatesKeys.sections(vars.templateId),
      });
    },
  });
}

export function useDeleteTemplateSection(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      if (!orgId) throw new Error("orgId required");
      return deleteTemplateSection(id, orgId);
    },
    onSuccess: async (res: { id: number }) => {
      // Try to find which template this section belonged to by scanning cached section lists
      const sectionQueries = qc.getQueryCache().findAll({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey.includes("sections"),
      });
      let foundTemplateId: number | null = null;
      for (const q of sectionQueries) {
        const data: any = q.state.data;
        if (Array.isArray(data) && data.some((s: any) => s.id === res.id)) {
          const key = q.queryKey as any[];
          // key structure: ['templates','detail', templateId,'sections']
          const tid = key.find((k) => typeof k === "number");
          if (typeof tid === "number") {
            foundTemplateId = tid;
            // remove it optimistically
            qc.setQueryData(
              q.queryKey,
              data.filter((s: any) => s.id !== res.id)
            );
            break;
          }
        }
      }
      if (foundTemplateId) {
        qc.invalidateQueries({
          queryKey: templatesKeys.sections(foundTemplateId),
        });
        qc.invalidateQueries({ queryKey: templatesKeys.full(foundTemplateId) });
      } else {
        // fallback
        qc.invalidateQueries({ queryKey: templatesKeys.all });
      }
    },
  });
}

// Template Questions
export function useTemplateSectionQuestions(
  orgId: number | null,
  sectionId: number | null
) {
  return useQuery({
    queryKey: sectionId
      ? templatesKeys.sectionQuestions(sectionId)
      : ["template-section", "questions", "disabled"],
    queryFn: () => {
      if (!sectionId) throw new Error("no sectionId");
      return listTemplateSectionQuestions(sectionId, orgId || undefined);
    },
    enabled: !!sectionId && !!orgId,
  });
}
export function useAddTemplateQuestion(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => {
      if (!orgId) throw new Error("orgId required");
      return addTemplateQuestion(body, orgId);
    },
    onSuccess: (link: any) =>
      qc.invalidateQueries({
        queryKey: templatesKeys.sectionQuestions(link.sectionId),
      }),
  });
}
export function useUpdateTemplateQuestion(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => {
      if (!orgId) throw new Error("orgId required");
      return updateTemplateQuestion(id, body, orgId);
    },
    onSuccess: (link: any) =>
      qc.invalidateQueries({
        queryKey: templatesKeys.sectionQuestions(link.sectionId),
      }),
  });
}
export function useBulkSetSectionQuestions(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, body }: { sectionId: number; body: any }) => {
      if (!orgId) throw new Error("orgId required");
      return bulkSetTemplateSectionQuestions(sectionId, body, orgId);
    },
    onSuccess: (_links, vars) =>
      qc.invalidateQueries({
        queryKey: templatesKeys.sectionQuestions(vars.sectionId),
      }),
  });
}
export function useDeleteTemplateQuestion(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      if (!orgId) throw new Error("orgId required");
      return deleteTemplateQuestion(id, orgId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: templatesKeys.all }),
  });
}
