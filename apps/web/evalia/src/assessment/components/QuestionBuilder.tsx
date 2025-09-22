"use client";
import React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
} from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Combobox from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useQuestionBanks,
  useQuestions,
  useOptionSets,
  useCreateQuestion,
  useOptionSetOptions,
} from "@/assessment/api/question-hooks";
// add update hook
import { useUpdateQuestion } from "@/assessment/api/question-hooks";
import type { Question } from "@/assessment/types/question-banks.types";

// Reuse existing preview components
import { QuestionText } from "@/app/dashboard/tests/take/components/QuestionText";
import { QuestionBoolean } from "@/app/dashboard/tests/take/components/QuestionBoolean";
import { QuestionSingleChoice } from "@/app/dashboard/tests/take/components/QuestionSingleChoice";
import { QuestionMultiChoice } from "@/app/dashboard/tests/take/components/QuestionMultiChoice";
import { QuestionScale } from "@/app/dashboard/tests/take/components/QuestionScale";

type BuilderState = {
  bankId: number | null;
  search: string;
  selectedQuestionId: number | null;
  // New question draft
  draftText: string;
  draftType: "TEXT" | "BOOLEAN" | "SINGLE_CHOICE" | "MULTI_CHOICE" | "SCALE";
  draftOptionSetId: number | null;
  draftMinScale?: number;
  draftMaxScale?: number;
};

export function QuestionBuilder() {
  const [state, setState] = React.useState<BuilderState>({
    bankId: null,
    search: "",
    selectedQuestionId: null,
    draftText: "",
    draftType: "TEXT",
    draftOptionSetId: null,
    draftMinScale: 1,
    draftMaxScale: 5,
  });

  const banksQ = useQuestionBanks();
  const questionsQ = useQuestions({
    bankId: state.bankId || undefined,
    search: state.search || undefined,
  });
  const optionSetsQ = useOptionSets();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();

  const selectedQuestion: Question | null = React.useMemo(() => {
    const arr = Array.isArray(questionsQ.data?.data)
      ? (questionsQ.data?.data as any as Question[])
      : [];
    return arr.find((q) => q.id === state.selectedQuestionId) || null;
  }, [questionsQ.data, state.selectedQuestionId]);

  // Populate form when selecting an existing question
  React.useEffect(() => {
    if (!selectedQuestion) return;
    setState((s) => ({
      ...s,
      draftText: selectedQuestion.text || "",
      draftType: selectedQuestion.type as any,
      draftOptionSetId: (selectedQuestion as any).optionSetId ?? null,
      draftMinScale: (selectedQuestion as any).minScale ?? 1,
      draftMaxScale: (selectedQuestion as any).maxScale ?? 5,
    }));
  }, [selectedQuestion?.id]);

  // Fetch options for selected/draft option set for live preview
  const selectedOptionSetId =
    selectedQuestion?.optionSetId ?? state.draftOptionSetId ?? null;
  const optionSetOptionsQ = useOptionSetOptions(selectedOptionSetId || null);
  const previewOptions = React.useMemo(() => {
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
  }, [optionSetOptionsQ.data]);

  function renderPreview() {
    const text = selectedQuestion?.text || state.draftText || "پیش‌نمایش سؤال";
    const type = selectedQuestion?.type || state.draftType;
    const name = "preview";
    switch (type) {
      case "TEXT":
        return (
          <QuestionText
            id={-1}
            value={undefined as any}
            onChange={() => {}}
            onSubmitNext={() => {}}
          />
        );
      case "BOOLEAN":
        return (
          <QuestionBoolean
            name={name}
            value={undefined as any}
            onChange={() => {}}
          />
        );
      case "SINGLE_CHOICE":
        return (
          <QuestionSingleChoice
            name={name}
            options={previewOptions}
            value={undefined as any}
            onChange={() => {}}
          />
        );
      case "MULTI_CHOICE":
        return (
          <QuestionMultiChoice
            options={previewOptions}
            value={undefined as any}
            onChange={() => {}}
          />
        );
      case "SCALE": {
        const min = selectedQuestion?.minScale ?? state.draftMinScale ?? 1;
        const max = selectedQuestion?.maxScale ?? state.draftMaxScale ?? 5;
        const opts = Array.from(
          { length: Math.max(0, (max ?? 5) - (min ?? 1) + 1) },
          (_, i) => {
            const n = (min ?? 1) + i;
            return { value: String(n), label: String(n) };
          }
        );
        return (
          <QuestionScale
            name={name}
            options={opts}
            value={undefined as any}
            onChange={() => {}}
          />
        );
      }
      default:
        return null;
    }
  }

  const handleCreate = async () => {
    if (!state.bankId) return;
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
      if (state.draftOptionSetId) body.optionSetId = state.draftOptionSetId;
    }
    await createQuestion.mutateAsync(body);
  };

  const handleUpdate = async () => {
    if (!selectedQuestion) return;
    const body: any = {
      text: state.draftText || "",
      type: state.draftType,
    };
    if (
      state.draftType === "SINGLE_CHOICE" ||
      state.draftType === "MULTI_CHOICE"
    ) {
      body.optionSetId = state.draftOptionSetId ?? undefined;
    } else {
      body.optionSetId = undefined;
    }
    if (state.draftType === "SCALE") {
      body.minScale = state.draftMinScale ?? 1;
      body.maxScale = state.draftMaxScale ?? 5;
    } else {
      body.minScale = undefined;
      body.maxScale = undefined;
    }
    await updateQuestion.mutateAsync({ id: selectedQuestion.id, body });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Pick bank and question from comboboxes */}
      <Panel>
        <PanelHeader>
          <PanelTitle>بانک سؤال و انتخاب سؤال</PanelTitle>
        </PanelHeader>
        <PanelContent className="flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>بانک سؤال</Label>
            <Combobox
              items={(banksQ.data?.data as any[]) || []}
              value={state.bankId}
              onChange={(v) =>
                setState((s) => ({
                  ...s,
                  bankId: (v as number) || null,
                  selectedQuestionId: null,
                }))
              }
              getKey={(b: any) => b.id}
              getLabel={(b: any) => b.name}
              placeholder="بانک را انتخاب کنید"
              loading={banksQ.isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>لیست سؤالات</Label>
            <Input
              placeholder="جستجو در سؤالات..."
              value={state.search}
              onChange={(e) =>
                setState((s) => ({ ...s, search: e.target.value }))
              }
            />
            <div className="max-h-64 overflow-auto rounded-md border divide-y">
              {Array.isArray(questionsQ.data?.data) &&
              questionsQ.data?.data.length ? (
                (questionsQ.data?.data as any[]).map((q) => (
                  <button
                    key={q.id}
                    className={
                      "w-full text-right px-3 py-2 hover:bg-muted/50 " +
                      (state.selectedQuestionId === q.id ? "bg-primary/5" : "")
                    }
                    onClick={() =>
                      setState((s) => ({ ...s, selectedQuestionId: q.id }))
                    }>
                    <div className="text-sm font-medium line-clamp-1">
                      {q.text}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {q.type}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-xs text-muted-foreground px-3 py-2">
                  {questionsQ.isLoading
                    ? "در حال بارگذاری..."
                    : "سوالی یافت نشد"}
                </div>
              )}
            </div>
          </div>
        </PanelContent>
      </Panel>

      {/* Right: Live preview and create new question */}
      <Panel>
        <PanelHeader>
          <PanelTitle>پیش‌نمایش و ساخت سؤال جدید</PanelTitle>
        </PanelHeader>
        <PanelContent className="flex-col gap-4">
          <div className="space-y-2">
            <Label>پیش‌نمایش</Label>
            <div className="rounded-md border p-4">
              {/* Show selected question text if exists, else draft text */}
              <div className="mb-3 text-sm font-medium">
                {selectedQuestion?.text || state.draftText || "پیش‌نمایش سؤال"}
              </div>
              {renderPreview()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2 md:col-span-2">
                <Label>متن سؤال جدید</Label>
                <Input
                  placeholder="متن سؤال..."
                  value={state.draftText}
                  onChange={(e) =>
                    setState((s) => ({ ...s, draftText: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>نوع سؤال</Label>
                <Select
                  value={state.draftType}
                  onValueChange={(v) =>
                    setState((s) => ({ ...s, draftType: v as any }))
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب نوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        "TEXT",
                        "BOOLEAN",
                        "SINGLE_CHOICE",
                        "MULTI_CHOICE",
                        "SCALE",
                      ] as const
                    ).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(state.draftType === "SINGLE_CHOICE" ||
                state.draftType === "MULTI_CHOICE") && (
                <div className="space-y-2">
                  <Label>ست گزینه</Label>
                  <Combobox
                    items={(optionSetsQ.data?.data as any[]) || []}
                    value={state.draftOptionSetId}
                    onChange={(v) =>
                      setState((s) => ({
                        ...s,
                        draftOptionSetId: (v as number) || null,
                      }))
                    }
                    getKey={(o: any) => o.id}
                    getLabel={(o: any) => o.name}
                    placeholder="ست گزینه را انتخاب کنید"
                    loading={optionSetsQ.isLoading}
                  />
                </div>
              )}
              {state.draftType === "SCALE" && (
                <>
                  <div className="space-y-2">
                    <Label>کمینه</Label>
                    <Input
                      type="number"
                      value={state.draftMinScale}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          draftMinScale: Number(e.target.value || 1),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>بیشینه</Label>
                    <Input
                      type="number"
                      value={state.draftMaxScale}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          draftMaxScale: Number(e.target.value || 5),
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-start gap-2 flex-wrap">
            <Button
              onClick={handleCreate}
              disabled={
                !state.bankId || !state.draftText || createQuestion.isPending
              }>
              {createQuestion.isPending ? "در حال ایجاد..." : "ایجاد سؤال"}
            </Button>
            {selectedQuestion && (
              <>
                <Button
                  onClick={handleUpdate}
                  disabled={!state.draftText || updateQuestion.isPending}>
                  {updateQuestion.isPending
                    ? "در حال ذخیره..."
                    : "ذخیره تغییرات"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setState((s) => ({ ...s, selectedQuestionId: null }))
                  }>
                  لغو انتخاب
                </Button>
              </>
            )}
          </div>
        </PanelContent>
      </Panel>
    </div>
  );
}

export default QuestionBuilder;
