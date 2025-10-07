import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listQuestionBanks,
  getQuestionBank,
  createQuestionBank,
  updateQuestionBank,
  deleteQuestionBank,
} from "./question-banks.api";
import {
  listQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type CreateQuestionBody,
  type UpdateQuestionBody,
} from "./questions.api";
import {
  listOptionSets,
  getOptionSet,
  bulkReplaceOptionSetOptions,
  listOptionSetOptions,
} from "./option-sets.api";

export const questionKeys = {
  banks: {
    all: ["question-banks"] as const,
    list: (params?: Record<string, unknown>) =>
      [
        "question-banks",
        "list",
        params ? JSON.stringify(params) : "all",
      ] as const,
    byId: (id: number) => ["question-banks", "detail", id] as const,
  },
  questions: {
    all: ["questions"] as const,
    list: (params?: Record<string, unknown>) =>
      ["questions", "list", params ? JSON.stringify(params) : "all"] as const,
    byId: (id: number) => ["questions", "detail", id] as const,
  },
  optionSets: {
    all: ["option-sets"] as const,
    list: (params?: Record<string, unknown>) =>
      ["option-sets", "list", params ? JSON.stringify(params) : "all"] as const,
    byId: (id: number) => ["option-sets", "detail", id] as const,
    options: (optionSetId: number) =>
      ["option-sets", optionSetId, "options"] as const,
  },
};

// Question Banks
export function useQuestionBanks(orgId: number | null, params?: any) {
  return useQuery({
    queryKey: questionKeys.banks.list(params),
    queryFn: () => listQuestionBanks(params, orgId || undefined),
    enabled: !!orgId,
  });
}
export function useQuestionBank(orgId: number | null, id: number | null) {
  return useQuery({
    queryKey: id
      ? questionKeys.banks.byId(id)
      : ["question-banks", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getQuestionBank(id, orgId || undefined);
    },
    enabled: !!id && !!orgId,
  });
}

// Questions
export function useQuestions(orgId: number | null, params?: any) {
  return useQuery({
    queryKey: questionKeys.questions.list(params),
    queryFn: () => listQuestions(params, orgId || undefined),
    enabled: !!orgId,
  });
}
export function useQuestion(orgId: number | null, id: number | null) {
  return useQuery({
    queryKey: id
      ? questionKeys.questions.byId(id)
      : ["questions", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getQuestion(id, orgId || undefined);
    },
    enabled: !!id && !!orgId,
  });
}
export function useCreateQuestion(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuestionBody) => {
      if (!orgId) throw new Error("orgId required");
      return createQuestion(body, orgId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: questionKeys.questions.all });
    },
  });
}
export function useUpdateQuestion(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateQuestionBody }) => {
      if (!orgId) throw new Error("orgId required");
      return updateQuestion(id, body, orgId);
    },
    onSuccess: (q: any) => {
      qc.invalidateQueries({ queryKey: questionKeys.questions.all });
      qc.setQueryData(questionKeys.questions.byId(q.id), q);
    },
  });
}
export function useDeleteQuestion(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      if (!orgId) throw new Error("orgId required");
      return deleteQuestion(id, orgId);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: questionKeys.questions.all }),
  });
}

// Option Sets
export function useOptionSets(orgId: number | null, params?: any) {
  return useQuery({
    queryKey: questionKeys.optionSets.list(params),
    queryFn: () => listOptionSets(params, orgId || undefined),
    enabled: !!orgId,
  });
}
export function useOptionSet(orgId: number | null, id: number | null) {
  return useQuery({
    queryKey: id
      ? questionKeys.optionSets.byId(id)
      : ["option-sets", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getOptionSet(id, orgId || undefined);
    },
    enabled: !!id && !!orgId,
  });
}
export function useOptionSetOptions(
  orgId: number | null,
  optionSetId: number | null
) {
  return useQuery({
    queryKey: optionSetId
      ? questionKeys.optionSets.options(optionSetId)
      : ["option-sets", "options", "disabled"],
    queryFn: () => {
      if (!optionSetId) throw new Error("no id");
      return listOptionSetOptions(optionSetId, orgId || undefined);
    },
    enabled: !!optionSetId && !!orgId,
  });
}
