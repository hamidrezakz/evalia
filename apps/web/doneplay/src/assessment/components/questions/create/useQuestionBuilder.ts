"use client";
import * as React from "react";
import {
  useQuestionBanks,
  useQuestions,
  useOptionSets,
  useCreateQuestion,
  useOptionSetOptions,
  useUpdateQuestion,
} from "@/assessment/api/question-hooks";
import { useOrgState } from "@/organizations/organization/context/org-context";
import type { Question } from "@/assessment/types/question-banks.types";

export type DraftType =
  | "TEXT"
  | "BOOLEAN"
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "SCALE";

export interface BuilderState {
  bankId: number | null;
  search: string;
  selectedQuestionId: number | null;
  draftText: string;
  draftType: DraftType;
  draftOptionSetId: number | null;
  draftMinScale?: number;
  draftMaxScale?: number;
  inlineOptions: { id: string; value: string; label: string }[];
}

export function useQuestionBuilder() {
  const [state, setState] = React.useState<BuilderState>({
    bankId: null,
    search: "",
    selectedQuestionId: null,
    draftText: "",
    draftType: "TEXT",
    draftOptionSetId: null,
    draftMinScale: 1,
    draftMaxScale: 5,
    inlineOptions: [],
  });

  const [message, setMessage] = React.useState<string | null>(null);
  const { activeOrganizationId } = useOrgState();

  const banksQ = useQuestionBanks(activeOrganizationId);
  const questionsQ = useQuestions(
    activeOrganizationId,
    {
      bankId: state.bankId || undefined,
      search: state.search || undefined,
      pageSize: 200,
    },
    { enabledIfNoBank: false }
  );
  const optionSetsQ = useOptionSets(activeOrganizationId);
  const createQuestion = useCreateQuestion(activeOrganizationId);
  const updateQuestion = useUpdateQuestion(activeOrganizationId);

  React.useEffect(() => {
    if (state.bankId && activeOrganizationId) {
      const t = setTimeout(() => {
        try {
          (questionsQ as any).refetch?.();
        } catch {}
      }, 10);
      return () => clearTimeout(t);
    }
  }, [state.bankId, activeOrganizationId]);

  const selectedQuestion: Question | null = React.useMemo(() => {
    const arr = Array.isArray(questionsQ.data?.data)
      ? (questionsQ.data?.data as any as Question[])
      : [];
    return arr.find((q) => q.id === state.selectedQuestionId) || null;
  }, [questionsQ.data, state.selectedQuestionId]);

  const optionSetId =
    selectedQuestion?.optionSetId ?? state.draftOptionSetId ?? null;
  const optionSetOptionsQ = useOptionSetOptions(
    activeOrganizationId,
    optionSetId || null
  );

  React.useEffect(() => {
    if (!selectedQuestion) return;
    setState((s) => ({
      ...s,
      draftText: selectedQuestion.text || "",
      draftType: selectedQuestion.type as any,
      draftOptionSetId: (selectedQuestion as any).optionSetId ?? null,
      draftMinScale: (selectedQuestion as any).minScale ?? 1,
      draftMaxScale: (selectedQuestion as any).maxScale ?? 5,
      inlineOptions: selectedQuestion.optionSetId
        ? []
        : (Array.isArray((selectedQuestion as any).options)
            ? (selectedQuestion as any).options
            : []
          ).map((o: any) => ({
            id: String(o.id),
            value: String(o.value),
            label: String(o.label),
          })),
    }));
  }, [selectedQuestion?.id]);

  const previewOptions = React.useMemo(() => {
    if (optionSetId) {
      const raw = optionSetOptionsQ.data as any;
      const arr: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      return arr.map((o: any) => ({
        id: o.id,
        value: String(o.value),
        label: String(o.label),
      }));
    }
    if (state.inlineOptions.length) {
      return state.inlineOptions
        .filter((o) => o.value.trim() && o.label.trim())
        .map((o, idx) => ({
          id: idx,
          value: o.value.trim(),
          label: o.label.trim(),
        }));
    }
    if (selectedQuestion && !selectedQuestion.optionSetId) {
      const opts: any[] = (selectedQuestion as any).options || [];
      return opts.map((o: any) => ({
        id: o.id,
        value: o.value,
        label: o.label,
      }));
    }
    return [] as { id: any; value: string; label: string }[];
  }, [
    optionSetOptionsQ.data,
    optionSetId,
    state.inlineOptions,
    selectedQuestion,
  ]);

  const isEditing = !!selectedQuestion;
  const isDirty = React.useMemo(() => {
    if (!selectedQuestion) return !!state.draftText && !!state.bankId;
    return (
      state.draftText !== (selectedQuestion.text || "") ||
      state.draftType !== selectedQuestion.type ||
      (selectedQuestion.optionSetId || null) !== state.draftOptionSetId ||
      (selectedQuestion.minScale || 1) !== (state.draftMinScale || 1) ||
      (selectedQuestion.maxScale || 5) !== (state.draftMaxScale || 5) ||
      (!selectedQuestion.optionSetId &&
        JSON.stringify(
          (selectedQuestion as any).options?.map((o: any) => ({
            value: o.value,
            label: o.label,
          })) || []
        ) !==
          JSON.stringify(
            state.inlineOptions.map((o) => ({ value: o.value, label: o.label }))
          ))
    );
  }, [
    selectedQuestion,
    state.draftText,
    state.draftType,
    state.draftOptionSetId,
    state.draftMinScale,
    state.draftMaxScale,
    state.bankId,
    state.inlineOptions,
  ]);

  function resetDraft() {
    setState((s) => ({
      ...s,
      draftText: "",
      draftType: "TEXT",
      draftOptionSetId: null,
      draftMinScale: 1,
      draftMaxScale: 5,
      inlineOptions: [],
    }));
  }

  async function handleCreate() {
    if (!state.bankId) return;
    if (
      (state.draftType === "SINGLE_CHOICE" ||
        state.draftType === "MULTI_CHOICE") &&
      !state.draftOptionSetId
    ) {
      const validInline = state.inlineOptions.filter(
        (o) => o.value.trim() && o.label.trim()
      );
      if (validInline.length < 2) {
        setMessage("حداقل دو گزینه نیاز است");
        setTimeout(() => setMessage(null), 2000);
        return;
      }
    }
    const body: any = {
      bankId: state.bankId,
      text: state.draftText || "",
      type: state.draftType,
    };
    if (state.draftType === "SCALE") {
      body.minScale = state.draftMinScale ?? 1;
      body.maxScale = state.draftMaxScale ?? 5;
    }
    if (
      state.draftType === "SINGLE_CHOICE" ||
      state.draftType === "MULTI_CHOICE"
    ) {
      if (state.draftOptionSetId) {
        body.optionSetId = state.draftOptionSetId;
      } else {
        body.optionSetId = null;
        body.options = state.inlineOptions
          .filter((o) => o.value.trim() && o.label.trim())
          .map((o, idx) => ({
            value: o.value.trim(),
            label: o.label.trim(),
            order: idx,
          }));
      }
    }
    await createQuestion.mutateAsync(body);
    setMessage("سؤال ایجاد شد");
    resetDraft();
    setTimeout(() => setMessage(null), 2500);
  }

  async function handleUpdate() {
    if (!selectedQuestion) return;
    if (
      (state.draftType === "SINGLE_CHOICE" ||
        state.draftType === "MULTI_CHOICE") &&
      !state.draftOptionSetId
    ) {
      const validInline = state.inlineOptions.filter(
        (o) => o.value.trim() && o.label.trim()
      );
      if (validInline.length < 1) {
        setMessage("حداقل یک گزینه نیاز است");
        setTimeout(() => setMessage(null), 2000);
        return;
      }
    }
    const body: any = { text: state.draftText || "", type: state.draftType };
    if (
      state.draftType === "SINGLE_CHOICE" ||
      state.draftType === "MULTI_CHOICE"
    ) {
      if (state.draftOptionSetId) {
        body.optionSetId = state.draftOptionSetId;
        body.options = undefined;
      } else {
        body.optionSetId = null;
        body.options = state.inlineOptions
          .filter((o) => o.value.trim() && o.label.trim())
          .map((o, idx) => ({
            value: o.value.trim(),
            label: o.label.trim(),
            order: idx,
          }));
      }
    } else {
      body.optionSetId = null;
    }
    if (state.draftType === "SCALE") {
      body.minScale = state.draftMinScale ?? 1;
      body.maxScale = state.draftMaxScale ?? 5;
    } else {
      body.minScale = undefined;
      body.maxScale = undefined;
    }
    await updateQuestion.mutateAsync({ id: selectedQuestion.id, body });
    setMessage("تغییرات ذخیره شد");
    setTimeout(() => setMessage(null), 2000);
  }

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        if (selectedQuestion) handleUpdate();
        else handleCreate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleCreate, handleUpdate, selectedQuestion]);

  return {
    state,
    setState,
    message,
    setMessage,
    banksQ,
    questionsQ,
    optionSetsQ,
    optionSetOptionsQ,
    selectedQuestion,
    isEditing,
    isDirty,
    previewOptions,
    handleCreate,
    handleUpdate,
    resetDraft,
    createIsPending: (createQuestion as any)?.isPending ?? false,
    updateIsPending: (updateQuestion as any)?.isPending ?? false,
  } as const;
}
