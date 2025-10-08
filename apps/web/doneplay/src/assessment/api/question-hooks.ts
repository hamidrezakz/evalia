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
    queryKey: [...questionKeys.banks.list(params), orgId || "no-org"],
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
export function useQuestions(
  orgId: number | null,
  params?: any,
  opts?: { enabledIfNoBank?: boolean }
) {
  const requireBank = opts?.enabledIfNoBank === false; // meaning: disable when no bankId
  const bankIdPresent = params && params.bankId != null;
  const enabled = requireBank ? !!params?.bankId : true;
  return useQuery({
    queryKey: [...questionKeys.questions.list(params), orgId || "no-org"],
    queryFn: () => listQuestions(params, orgId || undefined),
    enabled,
  });
}
export function useQuestion(orgId: number | null, id: number | null) {
  return useQuery({
    queryKey: id
      ? [...questionKeys.questions.byId(id), orgId || "no-org"]
      : ["questions", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getQuestion(id, orgId || undefined);
    },
    enabled: !!id, // allow regardless of orgId
  });
}
export function useCreateQuestion(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuestionBody) =>
      createQuestion(body, orgId || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: questionKeys.questions.all });
    },
  });
}
export function useUpdateQuestion(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateQuestionBody }) =>
      updateQuestion(id, body, orgId || undefined),
    onSuccess: (q: any) => {
      qc.invalidateQueries({ queryKey: questionKeys.questions.all });
      qc.setQueryData(questionKeys.questions.byId(q.id), q);
    },
  });
}
export function useDeleteQuestion(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteQuestion(id, orgId || undefined),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: questionKeys.questions.all }),
  });
}

// Option Sets
export function useOptionSets(orgId: number | null, params?: any) {
  return useQuery({
    queryKey: [...questionKeys.optionSets.list(params), orgId || "no-org"],
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
      ? [...questionKeys.optionSets.options(optionSetId), orgId || "no-org"]
      : ["option-sets", "options", "disabled"],
    queryFn: () => {
      if (!optionSetId) throw new Error("no id");
      return listOptionSetOptions(optionSetId, orgId || undefined);
    },
    enabled: !!optionSetId && !!orgId,
  });
}
