"use client";
import React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
} from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Save, XCircle, RefreshCw } from "lucide-react";

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

  const [message, setMessage] = React.useState<string | null>(null);
  const isDirty = React.useMemo(() => {
    if (!selectedQuestion) return !!state.draftText && !!state.bankId;
    return (
      state.draftText !== (selectedQuestion.text || "") ||
      state.draftType !== selectedQuestion.type ||
      (selectedQuestion.optionSetId || null) !== state.draftOptionSetId ||
      (selectedQuestion.minScale || 1) !== (state.draftMinScale || 1) ||
      (selectedQuestion.maxScale || 5) !== (state.draftMaxScale || 5)
    );
  }, [
    selectedQuestion,
    state.draftText,
    state.draftType,
    state.draftOptionSetId,
    state.draftMinScale,
    state.draftMaxScale,
    state.bankId,
  ]);

  const resetDraft = () => {
    setState((s) => ({
      ...s,
      draftText: "",
      draftType: "TEXT",
      draftOptionSetId: null,
      draftMinScale: 1,
      draftMaxScale: 5,
    }));
  };

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
    setMessage("سؤال ایجاد شد");
    resetDraft();
    setTimeout(() => setMessage(null), 2500);
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
    setMessage("تغییرات ذخیره شد");
    setTimeout(() => setMessage(null), 2000);
  };

  // Keyboard shortcut (Ctrl+Enter) save / create
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" dir="rtl">
      {/* Left: Pick bank and question from comboboxes */}
      <Panel>
        <PanelHeader className="flex-row items-center justify-between gap-2">
          <PanelTitle className="text-sm font-semibold">
            بانک سؤال و انتخاب سؤال
          </PanelTitle>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {banksQ.isLoading && <span>لود بانک‌ها...</span>}
            {questionsQ.isLoading && <span>لود سوالات...</span>}
          </div>
        </PanelHeader>
        <PanelContent className="flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-medium">بانک سؤال</Label>
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
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-medium">لیست سؤالات</Label>
            <Input
              placeholder="جستجو..."
              className="h-8 text-xs"
              value={state.search}
              onChange={(e) =>
                setState((s) => ({ ...s, search: e.target.value }))
              }
            />
            <div className="max-h-72 overflow-auto rounded-md border divide-y">
              {Array.isArray(questionsQ.data?.data) &&
              questionsQ.data?.data.length ? (
                (questionsQ.data?.data as any[]).map((q) => {
                  const active = state.selectedQuestionId === q.id;
                  return (
                    <button
                      key={q.id}
                      className={
                        "group w-full text-right px-3 py-2 transition-colors text-xs " +
                        (active
                          ? "bg-primary/5 border-s-2 border-primary/60"
                          : "hover:bg-muted/40")
                      }
                      onClick={() =>
                        setState((s) => ({ ...s, selectedQuestionId: q.id }))
                      }>
                      <div className="flex items-center gap-2">
                        <span className="font-medium line-clamp-1 flex-1 text-start">
                          {q.text || "(بدون متن)"}
                        </span>
                        <Badge
                          variant={active ? "default" : "secondary"}
                          className="text-[9px] py-0 px-1.5">
                          {q.type}
                        </Badge>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-[11px] text-muted-foreground px-3 py-2">
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
        <PanelHeader className="flex-row items-center justify-between gap-2">
          <PanelTitle className="text-sm font-semibold">
            پیش‌نمایش و ساخت / ویرایش سؤال
          </PanelTitle>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {selectedQuestion && (
              <Badge variant="outline" className="text-[9px]">
                ویرایش #{selectedQuestion.id}
              </Badge>
            )}
            {isDirty && selectedQuestion && (
              <span className="text-amber-500">تغییرات ذخیره نشده</span>
            )}
            {message && (
              <span className="text-green-600 dark:text-green-400">
                {message}
              </span>
            )}
          </div>
        </PanelHeader>
        <PanelContent className="flex-col gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium">پیش‌نمایش</Label>
            <div className="rounded-md border p-4 bg-background/40">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-xs font-medium line-clamp-2 flex-1">
                  {selectedQuestion?.text ||
                    state.draftText ||
                    "پیش‌نمایش سؤال"}
                </div>
                <Badge variant="secondary" className="text-[9px]">
                  {selectedQuestion?.type || state.draftType}
                </Badge>
              </div>
              {renderPreview()}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[11px] font-medium">صورت سؤال</Label>
              <Textarea
                placeholder="متن سؤال..."
                className="min-h-[90px] resize-y text-xs"
                value={state.draftText}
                onChange={(e) =>
                  setState((s) => ({ ...s, draftText: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium">نوع</Label>
              <Select
                value={state.draftType}
                onValueChange={(v) =>
                  setState((s) => ({ ...s, draftType: v as any }))
                }>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="انتخاب نوع" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {(
                    [
                      "TEXT",
                      "BOOLEAN",
                      "SINGLE_CHOICE",
                      "MULTI_CHOICE",
                      "SCALE",
                    ] as const
                  ).map((t) => (
                    <SelectItem key={t} value={t} className="text-xs py-1">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(state.draftType === "SINGLE_CHOICE" ||
              state.draftType === "MULTI_CHOICE") && (
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium">ست گزینه</Label>
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
                  placeholder="انتخاب ست گزینه"
                  loading={optionSetsQ.isLoading}
                />
              </div>
            )}
            {state.draftType === "SCALE" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium">کمینه</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs"
                    value={state.draftMinScale}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        draftMinScale: Number(e.target.value || 1),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium">بیشینه</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs"
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
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <Button
              onClick={handleCreate}
              disabled={
                !state.bankId || !state.draftText || createQuestion.isPending
              }
              isLoading={createQuestion.isPending}
              size="sm"
              icon={<PlusCircle className="h-4 w-4" />}>
              ایجاد
            </Button>
            {selectedQuestion && (
              <Button
                onClick={handleUpdate}
                disabled={
                  !state.draftText || updateQuestion.isPending || !isDirty
                }
                isLoading={updateQuestion.isPending}
                size="sm"
                icon={<Save className="h-4 w-4" />}
                variant={isDirty ? "default" : "secondary"}>
                ذخیره تغییرات
              </Button>
            )}
            {selectedQuestion && (
              <Button
                variant="ghost"
                size="sm"
                icon={<XCircle className="h-4 w-4" />}
                onClick={() =>
                  setState((s) => ({ ...s, selectedQuestionId: null }))
                }>
                لغو انتخاب
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={resetDraft}
              disabled={createQuestion.isPending || updateQuestion.isPending}>
              ریست فرم
            </Button>
          </div>
          <div className="flex justify-end w-full -mt-1">
            <span className="text-[10px] text-muted-foreground" dir="ltr">
              Ctrl+Enter → Save
            </span>
          </div>
        </PanelContent>
      </Panel>
    </div>
  );
}

export default QuestionBuilder;
