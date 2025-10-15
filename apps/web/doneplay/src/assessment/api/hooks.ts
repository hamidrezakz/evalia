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
export function useQuestionBanks(orgId: number | null, params?: any) {
  return useQuery({
    queryKey: questionBanksKeys.list(params),
    queryFn: () => listQuestionBanks(params, orgId || undefined),
    enabled: !!orgId,
  });
}
export function useQuestionBank(orgId: number | null, id: number | null) {
  return useQuery({
    queryKey: id
      ? questionBanksKeys.byId(id)
      : ["question-banks", "detail", "disabled"],
    queryFn: () => {
      if (!id) throw new Error("no id");
      return getQuestionBank(id, orgId || undefined);
    },
    enabled: !!id && !!orgId,
  });
}
// Lightweight count (decoupled from full bank detail)
export function useQuestionBankCount(
  orgId: number | null,
  bankId: number | null
) {
  return useQuery({
    queryKey: bankId
      ? [...questionBanksKeys.count(bankId), orgId]
      : ["question-banks", "count", "disabled"],
    queryFn: () => {
      if (!bankId) throw new Error("no bankId");
      return getQuestionBankCount(bankId, orgId || undefined);
    },
    enabled: !!bankId && !!orgId,
    staleTime: 30_000,
  });
}
export function useCreateQuestionBank(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuestionBankBody) => {
      if (!orgId) throw new Error("orgId required");
      return createQuestionBank(body, orgId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: questionBanksKeys.all }),
  });
}
export function useUpdateQuestionBank(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: UpdateQuestionBankBody;
    }) => {
      if (!orgId) throw new Error("orgId required");
      return updateQuestionBank(id, body, orgId);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: questionBanksKeys.all });
      qc.setQueryData(questionBanksKeys.byId(data.id), data);
    },
  });
}
export function useDeleteQuestionBank(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      if (!orgId) throw new Error("orgId required");
      return deleteQuestionBank(id, orgId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: questionBanksKeys.all }),
  });
}

// QUESTIONS
export function useQuestions(orgId: number | null, params?: any) {
  return useQuery({
    queryKey: questionsKeys.list(params),
    queryFn: () => listQuestions(params, orgId || undefined),
    enabled: !!orgId,
  });
}
export function useQuestion(orgId: number | null, id: number | null) {
  return useQuery({
    queryKey: id ? questionsKeys.byId(id) : ["questions", "detail", "disabled"],
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
    onSuccess: (_created, vars) => {
      qc.invalidateQueries({ queryKey: questionsKeys.all });
      if (vars?.bankId) {
        qc.invalidateQueries({
          queryKey: questionBanksKeys.count(vars.bankId),
        });
      }
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
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: questionsKeys.all });
      qc.setQueryData(questionsKeys.byId(data.id), data);
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
    onSuccess: () => qc.invalidateQueries({ queryKey: questionsKeys.all }),
  });
}

// OPTION SETS
export function useOptionSets(orgId: number | null, params?: any) {
  return useQuery({
    queryKey: optionSetsKeys.list(params),
    queryFn: () => listOptionSets(params, orgId || undefined),
    enabled: !!orgId,
  });
}
export function useOptionSet(orgId: number | null, id: number | null) {
  return useQuery({
    queryKey: id
      ? optionSetsKeys.byId(id)
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
      ? optionSetsKeys.options(optionSetId)
      : ["option-sets", "options", "disabled"],
    queryFn: () => {
      if (!optionSetId) throw new Error("no optionSetId");
      return listOptionSetOptions(optionSetId, orgId || undefined);
    },
    enabled: !!optionSetId && !!orgId,
  });
}
export function useCreateOptionSet(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOptionSetBody) => {
      if (!orgId) throw new Error("orgId required");
      return createOptionSet(body, orgId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: optionSetsKeys.all }),
  });
}
export function useUpdateOptionSet(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateOptionSetBody }) => {
      if (!orgId) throw new Error("orgId required");
      return updateOptionSet(id, body, orgId);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: optionSetsKeys.all });
      qc.setQueryData(optionSetsKeys.byId(data.id), data);
    },
  });
}
export function useDeleteOptionSet(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      if (!orgId) throw new Error("orgId required");
      return deleteOptionSet(id, orgId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: optionSetsKeys.all }),
  });
}
export function useBulkReplaceOptionSetOptions(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      optionSetId,
      body,
    }: {
      optionSetId: number;
      body: BulkReplaceOptionsBody;
    }) => {
      if (!orgId) throw new Error("orgId required");
      return bulkReplaceOptionSetOptions(optionSetId, body, orgId);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: optionSetsKeys.options(vars.optionSetId),
      });
    },
  });
}
export function useUpdateOptionSetOption(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: UpdateOptionSetOptionBody;
    }) => {
      if (!orgId) throw new Error("orgId required");
      return updateOptionSetOption(id, body, orgId);
    },
    onSuccess: () => {
      // could optimistically update cache if needed
    },
  });
}
export function useDeleteOptionSetOption(orgId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      if (!orgId) throw new Error("orgId required");
      return deleteOptionSetOption(id, orgId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: optionSetsKeys.all });
    },
  });
}
