"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  CheckCircle2,
  X,
  ListChecks,
  HelpCircle,
  Layers,
  SquareCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelAction,
  PanelContent,
  PanelDescription,
} from "@/components/ui/panel";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
  useTemplateSections,
  useAddTemplateQuestion,
} from "@/assessment/api/templates-hooks";
import { useQuestions } from "@/assessment/api/hooks";
import type {
  Template,
  TemplateSection,
} from "@/assessment/types/templates.types";
import type { Question } from "@/assessment/types/question-banks.types";
import { responsePerspectiveEnum } from "@/assessment/types/templates.types";

type FormVals = {
  sectionId: number | null;
  questionId: number | null;
  perspectives: string[];
  required: boolean;
};

function getZodEnumOptions(z: unknown): string[] {
  const anyEnum: any = z as any;
  if (Array.isArray(anyEnum?.options)) return anyEnum.options as string[];
  if (anyEnum?.enum && typeof anyEnum.enum === "object") {
    return Object.values(anyEnum.enum as Record<string, string>);
  }
  return [];
}

function Combobox<
  T extends { id: number; label?: string; name?: string; text?: string }
>(props: {
  items: T[];
  value: number | null;
  onChange: (id: number | null, item?: T) => void;
  placeholder: string;
  getLabel?: (it: T) => string;
  disabled?: boolean;
}) {
  const { items, value, onChange, placeholder, getLabel, disabled } = props;
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const selected = items.find((i) => i.id === value) || null;
  const labelOf = (it: T) =>
    getLabel ? getLabel(it) : it.label || it.name || it.text || String(it.id);

  const filtered = items.filter((it) =>
    labelOf(it).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full"
          disabled={disabled}>
          <span className="flex items-center gap-2 truncate">
            <ListChecks className="w-4 h-4 text-muted-foreground" />
            {selected ? labelOf(selected) : placeholder}
          </span>
          <SquareCheck className="ms-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="جستجو..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>موردی یافت نشد</CommandEmpty>
            <CommandGroup>
              {filtered.map((it) => (
                <CommandItem
                  key={it.id}
                  value={String(it.id)}
                  onSelect={() => {
                    const next = it.id === value ? null : it.id;
                    onChange(next, next ? it : undefined);
                    setOpen(false);
                  }}>
                  <div className="flex w-full flex-row justify-between items-center">
                    <span className="truncate flex-1">{labelOf(it)}</span>
                    <span className="flex-shrink-0">
                      <CheckCircle2
                        className={cn(
                          "ml-2 h-4 w-4",
                          value === it.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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

  const [qSearch, setQSearch] = React.useState("");
  const { data: qData, isLoading: qLoading } = useQuestions({
    search: qSearch,
    pageSize: 50,
  });
  const questionList: Question[] = (qData?.data as Question[]) || [];

  const perspectiveOptions = React.useMemo(
    () => getZodEnumOptions(responsePerspectiveEnum),
    []
  );

  const addMut = useAddTemplateQuestion();
  const { handleSubmit, setValue, watch, reset } = useForm<FormVals>({
    defaultValues: {
      sectionId: null,
      questionId: null,
      perspectives: [],
      required: false,
    },
  });

  const sectionId = watch("sectionId");
  const questionId = watch("questionId");
  const perspectives = watch("perspectives");
  const required = watch("required");

  const onSubmit = handleSubmit(async (vals) => {
    if (!vals.sectionId || !vals.questionId || vals.perspectives.length === 0)
      return;
    await addMut.mutateAsync({
      sectionId: vals.sectionId,
      questionId: vals.questionId,
      perspectives: vals.perspectives,
      required: vals.required,
    });
    reset({
      sectionId: vals.sectionId,
      questionId: null,
      perspectives: [],
      required: false,
    });
  });

  return (
    <Panel>
      <PanelHeader className="flex-row items-center justify-between gap-2">
        <div>
          <PanelTitle className="text-base">اختصاص سوال به سکشن</PanelTitle>
          <PanelDescription>
            سوال را انتخاب کنید، پرسپکتیوها و الزامی‌بودن را مشخص کنید، سپس ثبت
            کنید.
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
            <Plus className="h-4 w-4 ms-1" /> افزودن
          </Button>
        </PanelAction>
      </PanelHeader>
      <PanelContent className="flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-2">
            <Label>سکشن تمپلیت</Label>
            <Combobox
              items={sectionList}
              value={sectionId}
              onChange={(id) => setValue("sectionId", id)}
              placeholder="انتخاب سکشن"
              getLabel={(s) => s.title}
              disabled={!templateId}
            />
          </div>
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label>سوال</Label>
            </div>
            <Combobox
              items={questionList}
              value={questionId}
              onChange={(id) => setValue("questionId", id)}
              placeholder={qLoading ? "در حال بارگذاری..." : "انتخاب سوال"}
              getLabel={(q) => q.text}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Label className="mb-2 block">پرسپکتیوها</Label>
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
                    <span>{p}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-1 space-y-2">
            <Label className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> الزامی بودن
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
          </div>
        </div>
      </PanelContent>
    </Panel>
  );
}
