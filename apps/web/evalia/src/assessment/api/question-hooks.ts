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
export function useQuestionBanks(params?: any) {
  return useQuery({
    queryKey: questionKeys.banks.list(params),
    queryFn: () => listQuestionBanks(params),
  });
}
export function useQuestionBank(id: number | null) {
  return useQuery({
    queryKey: id
      ? questionKeys.banks.byId(id)
      : ["question-banks", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getQuestionBank(id);
    },
    enabled: !!id,
  });
}

// Questions
export function useQuestions(params?: any) {
  return useQuery({
    queryKey: questionKeys.questions.list(params),
    queryFn: () => listQuestions(params),
  });
}
export function useQuestion(id: number | null) {
  return useQuery({
    queryKey: id
      ? questionKeys.questions.byId(id)
      : ["questions", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getQuestion(id);
    },
    enabled: !!id,
  });
}
export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuestionBody) => createQuestion(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: questionKeys.questions.all });
    },
  });
}
export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateQuestionBody }) =>
      updateQuestion(id, body),
    onSuccess: (q: any) => {
      qc.invalidateQueries({ queryKey: questionKeys.questions.all });
      qc.setQueryData(questionKeys.questions.byId(q.id), q);
    },
  });
}
export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteQuestion(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: questionKeys.questions.all }),
  });
}

// Option Sets
export function useOptionSets(params?: any) {
  return useQuery({
    queryKey: questionKeys.optionSets.list(params),
    queryFn: () => listOptionSets(params),
  });
}
export function useOptionSet(id: number | null) {
  return useQuery({
    queryKey: id
      ? questionKeys.optionSets.byId(id)
      : ["option-sets", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getOptionSet(id);
    },
    enabled: !!id,
  });
}
export function useOptionSetOptions(optionSetId: number | null) {
  return useQuery({
    queryKey: optionSetId
      ? questionKeys.optionSets.options(optionSetId)
      : ["option-sets", "options", "disabled"],
    queryFn: () => {
      if (!optionSetId) throw new Error("no id");
      return listOptionSetOptions(optionSetId);
    },
    enabled: !!optionSetId,
  });
}
