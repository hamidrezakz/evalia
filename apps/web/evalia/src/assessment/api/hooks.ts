import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionBanksKeys, questionsKeys, optionSetsKeys } from "./query-keys";
import {
  listQuestionBanks,
  getQuestionBank,
  createQuestionBank,
  updateQuestionBank,
  deleteQuestionBank,
  type CreateQuestionBankBody,
  type UpdateQuestionBankBody,
} from "./question-banks.api";
import { getQuestionBankCount } from "./question-bank-count.api";
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
  createOptionSet,
  updateOptionSet,
  deleteOptionSet,
  listOptionSetOptions,
  bulkReplaceOptionSetOptions,
  updateOptionSetOption,
  deleteOptionSetOption,
  type CreateOptionSetBody,
  type UpdateOptionSetBody,
  type BulkReplaceOptionsBody,
  type UpdateOptionSetOptionBody,
} from "./option-sets.api";

// QUESTION BANKS
export function useQuestionBanks(params?: any) {
  return useQuery({
    queryKey: questionBanksKeys.list(params),
    queryFn: () => listQuestionBanks(params),
  });
}
export function useQuestionBank(id: number | null) {
  return useQuery({
    queryKey: id
      ? questionBanksKeys.byId(id)
      : ["question-banks", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getQuestionBank(id);
    },
    enabled: !!id,
  });
}
// Lightweight count (decoupled from full bank detail)
export function useQuestionBankCount(bankId: number | null) {
  return useQuery({
    queryKey: bankId
      ? questionBanksKeys.count(bankId)
      : ["question-banks", "count", "disabled"],
    queryFn: () => {
      if (!bankId) throw new Error("no bankId");
      return getQuestionBankCount(bankId);
    },
    enabled: !!bankId,
    staleTime: 30_000,
  });
}
export function useCreateQuestionBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuestionBankBody) => createQuestionBank(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionBanksKeys.all }),
  });
}
export function useUpdateQuestionBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateQuestionBankBody }) =>
      updateQuestionBank(id, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: questionBanksKeys.all });
      qc.setQueryData(questionBanksKeys.byId(data.id), data);
    },
  });
}
export function useDeleteQuestionBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteQuestionBank(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionBanksKeys.all }),
  });
}

// QUESTIONS
export function useQuestions(params?: any) {
  return useQuery({
    queryKey: questionsKeys.list(params),
    queryFn: () => listQuestions(params),
  });
}
export function useQuestion(id: number | null) {
  return useQuery({
    queryKey: id ? questionsKeys.byId(id) : ["questions", "detail", "disabled"],
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
    onSuccess: (_created, vars) => {
      qc.invalidateQueries({ queryKey: questionsKeys.all });
      // Invalidate count cache for the related bank
      if (vars?.bankId) {
        qc.invalidateQueries({
          queryKey: questionBanksKeys.count(vars.bankId),
        });
      }
    },
  });
}
export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateQuestionBody }) =>
      updateQuestion(id, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: questionsKeys.all });
      qc.setQueryData(questionsKeys.byId(data.id), data);
    },
  });
}
export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteQuestion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionsKeys.all }),
  });
}

// OPTION SETS
export function useOptionSets(params?: any) {
  return useQuery({
    queryKey: optionSetsKeys.list(params),
    queryFn: () => listOptionSets(params),
  });
}
export function useOptionSet(id: number | null) {
  return useQuery({
    queryKey: id
      ? optionSetsKeys.byId(id)
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
      ? optionSetsKeys.options(optionSetId)
      : ["option-sets", "options", "disabled"],
    queryFn: () => {
      if (!optionSetId) throw new Error("no optionSetId");
      return listOptionSetOptions(optionSetId);
    },
    enabled: !!optionSetId,
  });
}
export function useCreateOptionSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOptionSetBody) => createOptionSet(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: optionSetsKeys.all }),
  });
}
export function useUpdateOptionSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateOptionSetBody }) =>
      updateOptionSet(id, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: optionSetsKeys.all });
      qc.setQueryData(optionSetsKeys.byId(data.id), data);
    },
  });
}
export function useDeleteOptionSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteOptionSet(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: optionSetsKeys.all }),
  });
}
export function useBulkReplaceOptionSetOptions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      optionSetId,
      body,
    }: {
      optionSetId: number;
      body: BulkReplaceOptionsBody;
    }) => bulkReplaceOptionSetOptions(optionSetId, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: optionSetsKeys.options(vars.optionSetId),
      });
    },
  });
}
export function useUpdateOptionSetOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: UpdateOptionSetOptionBody;
    }) => updateOptionSetOption(id, body),
    onSuccess: () => {
      /* could optimistically update list via setQueryData */
    },
  });
}
export function useDeleteOptionSetOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteOptionSetOption(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: optionSetsKeys.all });
    },
  });
}
