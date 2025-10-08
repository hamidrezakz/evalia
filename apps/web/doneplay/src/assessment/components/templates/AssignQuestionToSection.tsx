"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelAction,
  PanelContent,
  PanelDescription,
} from "@/components/ui/panel";
// Removed inline combobox UI imports after refactor
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
  useTemplateSections,
  useAddTemplateQuestion,
  useTemplateSectionQuestions,
} from "@/assessment/api/templates-hooks";
import type {
  Template,
  TemplateSection,
} from "@/assessment/types/templates.types";
import type { Question } from "@/assessment/types/question-banks.types";
import { ResponsePerspectiveEnum, type ResponsePerspective } from "@/lib/enums";

type FormVals = {
  sectionId: number | null;
  questionId: number | null;
  perspectives: ResponsePerspective[];
  required: boolean;
  order: number | null;
};

function getZodEnumOptions(z: unknown): string[] {
  const anyEnum: any = z as any;
  if (Array.isArray(anyEnum?.options)) return anyEnum.options as string[];
  if (anyEnum?.enum && typeof anyEnum.enum === "object") {
    return Object.values(anyEnum.enum as Record<string, string>);
  }
  return [];
}

import SectionCombobox from "../combobox/SectionCombobox";
import QuestionSearchCombobox from "../combobox/QuestionSearchCombobox";
import { QuestionBankCombobox } from "@/assessment/components/questions/create/question-bank-combobox";
import { useQuestions, useUpdateQuestion } from "@/assessment/api/hooks";
import { useOrgState } from "@/organizations/organization/context/org-context";
import BankQuestionsPreview from "@/assessment/components/questions/bank-questions-preview";
// Edit2 imported above with Plus

export default function AssignQuestionToSection({
  template,
}: {
  template: Template | null;
}) {
  const templateId = template?.id ?? null;
  const { activeOrganizationId } = useOrgState();
  const [bankId, setBankId] = React.useState<number | null>(null);
  const { data: sections } = useTemplateSections(
    activeOrganizationId,
    templateId
  );
  const sectionList: TemplateSection[] = React.useMemo(() => {
    const raw: any = sections as any;
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : [];
    return (list as TemplateSection[])
      .slice()
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [sections]);

  // Question search is now handled inside QuestionSearchCombobox

  const perspectiveOptions = React.useMemo(
    () => ResponsePerspectiveEnum.values as ResponsePerspective[],
    []
  );

  const addMut = useAddTemplateQuestion(activeOrganizationId);
  const [justAdded, setJustAdded] = React.useState(false);
  const updateQuestion = useUpdateQuestion(activeOrganizationId);
  const { handleSubmit, setValue, watch, reset } = useForm<FormVals>({
    defaultValues: {
      sectionId: null,
      questionId: null,
      perspectives: [],
      required: false,
      order: null,
    },
  });

  const sectionId = watch("sectionId");
  const questionId = watch("questionId");
  const perspectives = watch("perspectives");
  const required = watch("required");
  const order = watch("order");

  // Prefill order as max(current)+1 when section changes
  const { data: sectionQuestions } = useTemplateSectionQuestions(
    activeOrganizationId,
    sectionId || null
  );
  React.useEffect(() => {
    if (!sectionId) return;
    const list: any[] = Array.isArray(sectionQuestions)
      ? (sectionQuestions as any)
      : [];
    const maxOrder = list.reduce(
      (acc, it: any) => Math.max(acc, it?.order ?? 0),
      -1
    );
    const suggested = Math.max(0, maxOrder + 1);
    setValue("order", suggested);
  }, [sectionId, sectionQuestions, setValue]);

  const onSubmit = handleSubmit(async (vals) => {
    if (!vals.sectionId || !vals.questionId || vals.perspectives.length === 0)
      return;
    await addMut.mutateAsync({
      sectionId: vals.sectionId,
      questionId: vals.questionId,
      perspectives: vals.perspectives,
      required: !!vals.required,
      order:
        typeof vals.order === "number" ? Math.max(0, vals.order) : undefined,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
    reset({
      sectionId: vals.sectionId,
      questionId: null,
      perspectives: [],
      required: false,
      order: typeof vals.order === "number" ? vals.order + 1 : null,
    });
  });

  // Questions list moved to reusable BankQuestionsPreview component

  return (
    <Panel>
      <PanelHeader
        className="flex-row items-center justify-between gap-2"
        dir="rtl">
        <div className="space-y-1">
          <PanelTitle className="text-sm font-semibold flex items-center gap-2 tracking-tight">
            اختصاص سوال به سکشن
          </PanelTitle>
          <PanelDescription className="text-[11px] leading-relaxed">
            یک سکشن، سوال بانک (اختیاری) و سوال را انتخاب کنید. سپس نقش‌های
            پاسخ‌دهی، الزامی بودن و ترتیب را تنظیم کنید.
          </PanelDescription>
        </div>
        <PanelAction>
          <Button
            size="sm"
            onClick={onSubmit}
            isLoading={addMut.isPending}
            disabled={!sectionId || !questionId || perspectives.length === 0}
            icon={<Plus className="h-4 w-4" />}>
            افزودن
          </Button>
        </PanelAction>
      </PanelHeader>
      <PanelContent className="flex-col gap-5 text-right text-xs" dir="rtl">
        {/* Top selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium">سکشن</Label>
            <SectionCombobox
              items={sectionList}
              value={sectionId}
              onChange={(id) => setValue("sectionId", id)}
              placeholder="انتخاب سکشن"
              disabled={!templateId}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[11px] font-medium">
              بانک سوال (اختیاری)
            </Label>
            <QuestionBankCombobox
              value={bankId}
              onChange={(id) => setBankId(id)}
              placeholder="انتخاب بانک سوال"
            />
            <Label className="text-[11px] font-medium mt-2">سوال</Label>
            <QuestionSearchCombobox
              value={questionId}
              onChange={(id) => setValue("questionId", id)}
              placeholder="جستجو و انتخاب سوال"
              bankId={bankId}
            />
          </div>
        </div>

        {justAdded && (
          <div className="flex items-center gap-2 text-[11px] text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" /> سوال با موفقیت افزوده شد.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Perspectives */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
              <Label className="text-[11px] font-medium mb-1 md:mb-0">
                نقش‌های پاسخ‌دهی
              </Label>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setValue("perspectives", perspectiveOptions)}
                  disabled={perspectiveOptions.length === 0}>
                  انتخاب همه
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setValue("perspectives", [])}>
                  پاک‌سازی
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {perspectiveOptions.map((p) => {
                const checked = perspectives.includes(p);
                return (
                  <label
                    key={p}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] cursor-pointer transition-colors",
                      checked
                        ? "border-primary/50 bg-primary/5"
                        : "hover:bg-muted/40"
                    )}>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        const isOn = Boolean(v);
                        const next = isOn
                          ? [...perspectives, p]
                          : perspectives.filter((x) => x !== p);
                        setValue("perspectives", next);
                      }}
                      className="h-4 w-4"
                    />
                    <span>{ResponsePerspectiveEnum.t(p as any)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Meta & ordering */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[11px] font-medium">الزامی بودن</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={required}
                  onCheckedChange={(v) => setValue("required", Boolean(v))}
                />
                <span className="text-[10px] text-muted-foreground">
                  اگر فعال باشد پاسخ ضروری است.
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-medium">ترتیب نمایش</Label>
              <Input
                type="number"
                inputMode="numeric"
                className="h-8 text-xs"
                value={order ?? ""}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setValue("order", Number.isFinite(n) ? n : null);
                }}
                placeholder="مثلا 0 یا 1"
              />
              <p className="text-[10px] text-muted-foreground leading-snug">
                خالی = افزودن در انتهای لیست
              </p>
            </div>
          </div>
        </div>

        {bankId ? (
          <div className="mt-4">
            <BankQuestionsPreview
              bankId={bankId}
              editable
              onPick={(qid) => setValue("questionId", qid)}
            />
          </div>
        ) : null}
      </PanelContent>
    </Panel>
  );
}

// moved BankQuestionRow into BankQuestionsPreview component
