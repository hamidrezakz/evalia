"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  FileText,
  LayoutList,
  Users,
  ListChecks,
  Hash,
  Asterisk,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function AssignQuestionToSection({
  template,
}: {
  template: Template | null;
}) {
  const templateId = template?.id ?? null;
  const { data: sections } = useTemplateSections(templateId);
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

  const addMut = useAddTemplateQuestion();
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
    reset({
      sectionId: vals.sectionId,
      questionId: null,
      perspectives: [],
      required: false,
      order: typeof vals.order === "number" ? vals.order + 1 : null,
    });
  });

  return (
    <Panel>
      <PanelHeader className="flex-row items-center justify-between gap-2">
        <div>
          <PanelTitle className="text-base flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            اختصاص سوال به بخش قالب
          </PanelTitle>
          <PanelDescription>
            سوال را انتخاب کنید، پرسپکتیوهای پاسخ‌دهی و الزامی بودن را مشخص
            کنید، سپس افزودن را بزنید.
          </PanelDescription>
        </div>
        <PanelAction>
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={
              addMut.isPending ||
              !sectionId ||
              !questionId ||
              perspectives.length === 0
            }>
            <Plus className="h-4 w-4 ms-1" /> افزودن سوال
          </Button>
        </PanelAction>
      </PanelHeader>
      <PanelContent className="flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="lg:col-span-1 space-y-2">
            <Label className="flex items-center gap-2">
              <LayoutList className="h-4 w-4" /> بخش قالب (سکشن)
            </Label>
            <SectionCombobox
              items={sectionList}
              value={sectionId}
              onChange={(id) => setValue("sectionId", id)}
              placeholder="انتخاب سکشن"
              disabled={!templateId}
            />
          </div>
          <div className="lg:col-span-2 space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> سوال
            </Label>
            <QuestionSearchCombobox
              value={questionId}
              onChange={(id) => setValue("questionId", id)}
              placeholder="انتخاب سوال"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10">
          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" /> پرسپکتیوها (نقش پاسخ‌دهی)
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setValue("perspectives", perspectiveOptions)}
                  disabled={perspectiveOptions.length === 0}>
                  انتخاب همه
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setValue("perspectives", [])}>
                  پاک‌سازی
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {perspectiveOptions.map((p) => {
                const checked = perspectives.includes(p);
                return (
                  <label
                    key={p}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-xs cursor-pointer",
                      checked ? "border-primary/50 bg-primary/5" : ""
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
                    />
                    <span>{ResponsePerspectiveEnum.t(p as any)}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-1 space-y-4">
            <Label className="flex items-center gap-2">
              <Asterisk className="h-4 w-4" /> الزامی بودن
            </Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={required}
                onCheckedChange={(v) => setValue("required", Boolean(v))}
              />
              <span className="text-xs text-muted-foreground">
                در صورت فعال بودن، پاسخ به سوال ضروری است.
              </span>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Hash className="h-4 w-4" /> ترتیب سوال
              </Label>
              <Input
                type="number"
                inputMode="numeric"
                value={order ?? ""}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setValue("order", Number.isFinite(n) ? n : null);
                }}
                placeholder="مثلا 0، 1، 2 ..."
              />
              <p className="text-xs text-muted-foreground">
                در صورت خالی بودن، به صورت پیش‌فرض در انتهای لیست قرار می‌گیرد.
              </p>
            </div>
          </div>
        </div>
      </PanelContent>
    </Panel>
  );
}
