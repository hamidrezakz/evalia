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
import {
  PlusCircle,
  Save,
  XCircle,
  RefreshCw,
  ListChecks,
  Eye,
  ArrowUp,
  ArrowDown,
  Trash2,
  FilePlus2,
} from "lucide-react";

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
  inlineOptions: {
    id: string;
    value: string; // machine / stored value
    label: string; // display label
  }[]; // local only
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
    inlineOptions: [],
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

  const isEditing = !!selectedQuestion;

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

  // Fetch options for selected/draft option set for live preview
  const selectedOptionSetId =
    selectedQuestion?.optionSetId ?? state.draftOptionSetId ?? null;
  const optionSetOptionsQ = useOptionSetOptions(selectedOptionSetId || null);
  const previewOptions = React.useMemo(() => {
    // Priority: selected option set -> inline options (draft) -> selected question inline
    if (selectedOptionSetId) {
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
    // Inline draft options
    if (state.inlineOptions.length) {
      return state.inlineOptions
        .filter((o) => o.value.trim() && o.label.trim())
        .map((o, idx) => ({
          id: idx,
          value: o.value.trim(),
          label: o.label.trim(),
        }));
    }
    // Fallback to existing selected question inline options
    if (selectedQuestion && !selectedQuestion.optionSetId) {
      const opts: any[] = (selectedQuestion as any).options || [];
      return opts.map((o: any) => ({
        id: o.id,
        value: o.value,
        label: o.label,
      }));
    }
    return [];
  }, [
    optionSetOptionsQ.data,
    selectedOptionSetId,
    state.inlineOptions,
    selectedQuestion,
  ]);

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

  const resetDraft = () => {
    setState((s) => ({
      ...s,
      draftText: "",
      draftType: "TEXT",
      draftOptionSetId: null,
      draftMinScale: 1,
      draftMaxScale: 5,
      inlineOptions: [],
    }));
  };

  const handleCreate = async () => {
    if (!state.bankId) return;
    // Validation: only require at least 2 filled options if inline used
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
        body.optionSetId = null; // explicit detach / inline usage
        if (state.inlineOptions.length) {
          body.options = state.inlineOptions
            .filter((o) => o.value.trim() && o.label.trim())
            .map((o, idx) => ({
              value: o.value.trim(),
              label: o.label.trim(),
              order: idx,
            }));
        } else {
          body.options = [];
        }
      }
    }
    await createQuestion.mutateAsync(body);
    setMessage("سؤال ایجاد شد");
    resetDraft();
    setTimeout(() => setMessage(null), 2500);
  };

  const handleUpdate = async () => {
    if (!selectedQuestion) return;
    if (
      (state.draftType === "SINGLE_CHOICE" ||
        state.draftType === "MULTI_CHOICE") &&
      !state.draftOptionSetId
    ) {
      const validInline = state.inlineOptions.filter(
        (o) => o.value.trim() && o.label.trim()
      );
      // برای ویرایش بعد از detach حداقل یک گزینه کافی است
      if (validInline.length < 1) {
        setMessage("حداقل یک گزینه نیاز است");
        setTimeout(() => setMessage(null), 2000);
        return;
      }
    }
    const body: any = {
      text: state.draftText || "",
      type: state.draftType,
    };
    if (
      state.draftType === "SINGLE_CHOICE" ||
      state.draftType === "MULTI_CHOICE"
    ) {
      if (state.draftOptionSetId) {
        body.optionSetId = state.draftOptionSetId;
        body.options = undefined; // ignore inline when set selected
      } else {
        body.optionSetId = null; // explicit detach
        if (state.inlineOptions.length) {
          body.options = state.inlineOptions
            .filter((o) => o.value.trim() && o.label.trim())
            .map((o, idx) => ({
              value: o.value.trim(),
              label: o.label.trim(),
              order: idx,
            }));
        } else {
          body.options = [];
        }
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
          <PanelTitle className="text-sm font-semibold flex items-center gap-2">
            <ListChecks className="size-4 text-primary" /> بانک سؤال و انتخاب
            سؤال
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
          <PanelTitle className="text-sm font-semibold flex items-center gap-2">
            <Eye className="size-4 text-primary" /> پیش‌نمایش و ساخت / ویرایش
            سؤال
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
              {isEditing ? (
                <div className="h-8 text-xs flex items-center rounded-md border px-2 bg-muted/40 select-none">
                  <span>{state.draftType}</span>
                </div>
              ) : (
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
              )}
            </div>
            {(state.draftType === "SINGLE_CHOICE" ||
              state.draftType === "MULTI_CHOICE") && (
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium flex items-center gap-2">
                  ست گزینه
                  {isEditing &&
                    selectedQuestion &&
                    !selectedQuestion.optionSetId &&
                    (selectedQuestion as any).options?.length > 0 && (
                      <span className="text-[9px] text-muted-foreground font-normal">
                        (دستی)
                      </span>
                    )}
                </Label>
                {/* Edit mode logic: */}
                {isEditing ? (
                  selectedQuestion?.optionSetId ? (
                    // Question originally uses option set: allow changing set but NOT converting to manual
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
                      placeholder="انتخاب / تغییر ست"
                      loading={optionSetsQ.isLoading}
                    />
                  ) : null
                ) : (
                  // Create mode: free to choose set
                  <Combobox
                    items={(optionSetsQ.data?.data as any[]) || []}
                    value={state.draftOptionSetId}
                    onChange={(v) =>
                      setState((s) => ({
                        ...s,
                        draftOptionSetId: (v as number) || null,
                        inlineOptions: (v as number) ? [] : s.inlineOptions,
                      }))
                    }
                    getKey={(o: any) => o.id}
                    getLabel={(o: any) => o.name}
                    placeholder="انتخاب ست گزینه"
                    loading={optionSetsQ.isLoading}
                  />
                )}
                {state.draftOptionSetId &&
                  !(!selectedQuestion?.optionSetId && isEditing) && (
                    <div className="mt-2 rounded-md border bg-muted/20 p-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-medium">
                          گزینه‌های ست انتخاب‌شده
                        </Label>
                        {/* Buttons removed in edit mode to forbid convert/detach */}
                      </div>
                      <div className="max-h-48 overflow-auto pr-1 space-y-1">
                        {(optionSetOptionsQ.data as any[])?.length ? (
                          (optionSetOptionsQ.data as any[])!.map(
                            (o: any, i: number) => (
                              <div
                                key={o.id || i}
                                className="text-[10px] flex items-center gap-2 rounded border bg-background/60 px-2 py-1">
                                <span className="font-mono text-[9px] opacity-60">
                                  {i + 1}.
                                </span>
                                <span className="truncate flex-1">
                                  {o.label}
                                </span>
                                <span className="text-[9px] text-muted-foreground ltr:font-mono direction-ltr">
                                  {o.value}
                                </span>
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-[10px] text-muted-foreground">
                            در حال بارگذاری یا بدون گزینه
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                {/* Inline options builder (only when no option set selected) */}
                {/* Inline builder only if (create mode with no set) OR (edit mode and original had manual options) */}
                {!state.draftOptionSetId &&
                  (!isEditing ||
                    (isEditing && !selectedQuestion?.optionSetId)) && (
                    <div className="mt-3 rounded-md border p-3 space-y-3 bg-muted/30">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-[10px] font-medium">
                          گزینه‌های دستی (Label و Value)
                        </Label>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[11px]"
                            icon={<PlusCircle className="size-3" />}
                            iconPosition="left"
                            onClick={() =>
                              setState((s) => ({
                                ...s,
                                inlineOptions: [
                                  ...s.inlineOptions,
                                  {
                                    id: crypto.randomUUID(),
                                    value: "",
                                    label: "",
                                  },
                                ],
                              }))
                            }>
                            افزودن
                          </Button>
                          {!isEditing && state.inlineOptions.length > 0 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[11px]"
                              icon={<Trash2 className="size-3" />}
                              iconPosition="left"
                              onClick={() =>
                                setState((s) => ({
                                  ...s,
                                  inlineOptions: [],
                                }))
                              }>
                              پاک‌سازی
                            </Button>
                          )}
                        </div>
                      </div>
                      {state.inlineOptions.length === 0 && (
                        <div className="text-[10px] text-muted-foreground">
                          {isEditing
                            ? "این سوال دستی است. گزینه جدید اضافه کنید."
                            : "حداقل دو گزینه (Label + Value) وارد کنید یا یک ست آماده انتخاب کنید."}
                        </div>
                      )}
                      <div className="space-y-4">
                        {state.inlineOptions.map((opt, idx) => (
                          <div
                            key={opt.id}
                            className="rounded-md border bg-background/60 p-2 space-y-2 shadow-sm relative">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>گزینه #{idx + 1}</span>
                              <div className="flex gap-1">
                                {idx > 0 && (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    icon={<ArrowUp className="size-3" />}
                                    onClick={() =>
                                      setState((s) => {
                                        const arr = [...s.inlineOptions];
                                        const t = arr[idx];
                                        arr[idx] = arr[idx - 1];
                                        arr[idx - 1] = t;
                                        return { ...s, inlineOptions: arr };
                                      })
                                    }
                                  />
                                )}
                                {idx < state.inlineOptions.length - 1 && (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    icon={<ArrowDown className="size-3" />}
                                    onClick={() =>
                                      setState((s) => {
                                        const arr = [...s.inlineOptions];
                                        const t = arr[idx];
                                        arr[idx] = arr[idx + 1];
                                        arr[idx + 1] = t;
                                        return { ...s, inlineOptions: arr };
                                      })
                                    }
                                  />
                                )}
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-red-500 hover:text-red-600"
                                  icon={<Trash2 className="size-3" />}
                                  onClick={() =>
                                    setState((s) => ({
                                      ...s,
                                      inlineOptions: s.inlineOptions.filter(
                                        (o) => o.id !== opt.id
                                      ),
                                    }))
                                  }
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">
                                Label (نمایش)
                              </Label>
                              <Input
                                placeholder="مثلاً: بسیار خوب"
                                className="h-8 text-[11px]"
                                value={opt.label}
                                onChange={(e) =>
                                  setState((s) => ({
                                    ...s,
                                    inlineOptions: s.inlineOptions.map((o) =>
                                      o.id === opt.id
                                        ? { ...o, label: e.target.value }
                                        : o
                                    ),
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">
                                Value (ذخیره)
                              </Label>
                              <Textarea
                                placeholder="value داخلی (مثلاً: excellent)"
                                className="min-h-[60px] text-[11px]"
                                value={opt.value}
                                onChange={(e) =>
                                  setState((s) => ({
                                    ...s,
                                    inlineOptions: s.inlineOptions.map((o) =>
                                      o.id === opt.id
                                        ? { ...o, value: e.target.value }
                                        : o
                                    ),
                                  }))
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      {state.inlineOptions.length >= 1 && (
                        <div className="text-[10px] text-muted-foreground flex flex-wrap gap-2">
                          <span>مجموع: {state.inlineOptions.length} گزینه</span>
                        </div>
                      )}
                    </div>
                  )}
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
                  <p className="text-[9px] text-muted-foreground pr-0.5">
                    عدد شروع مقیاس (پیشفرض 1)
                  </p>
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
                  <p className="text-[9px] text-muted-foreground pr-0.5">
                    آخرین عدد (باید بزرگ‌تر یا مساوی کمینه باشد)
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            {!selectedQuestion && (
              <Button
                onClick={handleCreate}
                disabled={
                  !state.bankId ||
                  !state.draftText ||
                  createQuestion.isPending ||
                  ((state.draftType === "SINGLE_CHOICE" ||
                    state.draftType === "MULTI_CHOICE") &&
                    !state.draftOptionSetId &&
                    state.inlineOptions.filter(
                      (o) => o.value.trim() && o.label.trim()
                    ).length < 2)
                }
                isLoading={createQuestion.isPending}
                size="sm"
                icon={<PlusCircle className="size-4" />}
                iconPosition="left">
                ایجاد سؤال
              </Button>
            )}
            {selectedQuestion && (
              <Button
                onClick={handleUpdate}
                disabled={
                  !state.draftText ||
                  updateQuestion.isPending ||
                  !isDirty ||
                  ((state.draftType === "SINGLE_CHOICE" ||
                    state.draftType === "MULTI_CHOICE") &&
                    !state.draftOptionSetId &&
                    state.inlineOptions.filter(
                      (o) => o.value.trim() && o.label.trim()
                    ).length < 1)
                }
                isLoading={updateQuestion.isPending}
                size="sm"
                icon={<Save className="size-4" />}
                variant={isDirty ? "default" : "secondary"}>
                ذخیره تغییرات
              </Button>
            )}
            {selectedQuestion && (
              <Button
                variant="ghost"
                size="sm"
                icon={<XCircle className="size-4" />}
                onClick={() =>
                  setState((s) => ({ ...s, selectedQuestionId: null }))
                }>
                لغو انتخاب
              </Button>
            )}
            {selectedQuestion && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<FilePlus2 className="size-4" />}
                iconPosition="left"
                onClick={() => {
                  resetDraft();
                  setState((s) => ({ ...s, selectedQuestionId: null }));
                }}>
                سؤال جدید
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<RefreshCw className="size-4" />}
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
