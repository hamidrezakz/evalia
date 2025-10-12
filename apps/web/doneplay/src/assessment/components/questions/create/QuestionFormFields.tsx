"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Combobox from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  ArrowUp,
  ArrowDown,
  Trash2,
  FileText,
  Shapes,
  Layers,
  ListOrdered,
  ListPlus,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { QuestionTypeCombobox } from "./question-type-combobox";
import { Separator } from "@/components/ui/separator";

export type DraftType =
  | "TEXT"
  | "BOOLEAN"
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "SCALE";

export interface QuestionFormFieldsProps {
  isEditing: boolean;
  draftText: string;
  onTextChange: (v: string) => void;
  draftType: DraftType;
  onTypeChange: (t: DraftType) => void;
  draftOptionSetId: number | null;
  onOptionSetChange: (id: number | null) => void;
  optionSets: any[];
  optionSetsLoading?: boolean;
  optionSetOptions: any[];
  inlineOptions: { id: string; value: string; label: string }[];
  onInlineOptionsChange: (
    opts: { id: string; value: string; label: string }[]
  ) => void;
  draftMinScale?: number;
  draftMaxScale?: number;
  onMinScaleChange: (n: number) => void;
  onMaxScaleChange: (n: number) => void;
  originalHadManualOptions?: boolean;
}

export function QuestionFormFields(props: QuestionFormFieldsProps) {
  const {
    isEditing,
    draftText,
    onTextChange,
    draftType,
    onTypeChange,
    draftOptionSetId,
    onOptionSetChange,
    optionSets,
    optionSetsLoading,
    optionSetOptions,
    inlineOptions,
    onInlineOptionsChange,
    draftMinScale,
    draftMaxScale,
    onMinScaleChange,
    onMaxScaleChange,
    originalHadManualOptions,
  } = props;

  const needsOptionSet =
    draftType === "SINGLE_CHOICE" || draftType === "MULTI_CHOICE";
  const needsScale = draftType === "SCALE";

  function moveInline(idx: number, dir: -1 | 1) {
    onInlineOptionsChange(
      ((arr) => {
        const next = [...arr];
        const t = next[idx];
        next[idx] = next[idx + dir];
        next[idx + dir] = t;
        return next;
      })(inlineOptions)
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-1.5 md:col-span-2">
        <Label className="text-[11px] font-medium flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" /> صورت سؤال
        </Label>
        <Textarea
          placeholder="متن سؤال..."
          className="min-h-[90px] resize-y text-xs"
          value={draftText}
          onChange={(e) => onTextChange(e.target.value)}
        />
      </div>

      <div className="space-y-1.5 md:col-span-2">
        <Label className="text-[11px] font-medium flex items-center gap-2">
          <Shapes className="w-4 h-4 text-muted-foreground" /> نوع
        </Label>
        {isEditing ? (
          <div className="h-8 text-xs flex items-center rounded-md border px-2 bg-muted/40 select-none">
            {/* read-only; badge will be handled in preview header */}
            <span>{draftType}</span>
          </div>
        ) : (
          <QuestionTypeCombobox
            value={draftType}
            onChange={(v) => onTypeChange((v as DraftType) || draftType)}
            placeholder="انتخاب نوع"
          />
        )}
      </div>

      {needsOptionSet && (
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-[11px] font-medium flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" /> ست گزینه
          </Label>
          {isEditing ? (
            // only allow change when question originally used option set
            originalHadManualOptions ? null : (
              <Combobox
                items={(optionSets as any[]) || []}
                value={draftOptionSetId}
                onChange={(v) => onOptionSetChange((v as number) || null)}
                getKey={(o: any) => o.id}
                getLabel={(o: any) => o.name}
                placeholder="انتخاب / تغییر ست"
                loading={optionSetsLoading}
              />
            )
          ) : (
            <Combobox
              items={(optionSets as any[]) || []}
              value={draftOptionSetId}
              onChange={(v) => onOptionSetChange((v as number) || null)}
              getKey={(o: any) => o.id}
              getLabel={(o: any) => o.name}
              placeholder="انتخاب ست گزینه"
              loading={optionSetsLoading}
            />
          )}

          {draftOptionSetId &&
            !(isEditing && originalHadManualOptions === true) && (
              <div className="mt-2 rounded-md border bg-muted/20 p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-medium flex items-center gap-2">
                    <ListOrdered className="w-3.5 h-3.5 text-muted-foreground" />
                    گزینه‌های ست انتخاب‌شده
                  </Label>
                </div>
                <div className="max-h-48 overflow-auto pr-1 space-y-1">
                  {(optionSetOptions as any[])?.length ? (
                    (optionSetOptions as any[]).map((o: any, i: number) => (
                      <div
                        key={o.id || i}
                        className="text-[10px] flex items-center gap-2 rounded border bg-background/60 px-2 py-1">
                        <span className="font-mono text-[9px] opacity-60">
                          {i + 1}.
                        </span>
                        <span className="truncate flex-1">{o.label}</span>
                        <span className="text-[9px] text-muted-foreground ltr:font-mono direction-ltr">
                          {o.value}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-muted-foreground">
                      در حال بارگذاری یا بدون گزینه
                    </div>
                  )}
                </div>
              </div>
            )}

          {!draftOptionSetId &&
            (!isEditing || (isEditing && originalHadManualOptions)) && (
              <div className="mt-3 rounded-md border bg-card/50">
                <div className="flex items-center justify-between gap-2 p-2">
                  <Label className="text-[11px] font-medium flex items-center gap-2">
                    <ListPlus className="w-4 h-4 text-muted-foreground" />
                    گزینه‌های دستی (Label / Value)
                  </Label>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px]"
                      icon={<PlusCircle className="size-3" />}
                      onClick={() =>
                        onInlineOptionsChange([
                          ...inlineOptions,
                          { id: crypto.randomUUID(), value: "", label: "" },
                        ])
                      }>
                      افزودن
                    </Button>
                    {inlineOptions.length > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px]"
                        icon={<Trash2 className="size-3" />}
                        onClick={() => onInlineOptionsChange([])}>
                        پاک‌سازی
                      </Button>
                    )}
                  </div>
                </div>
                <Separator className="bg-border/60" />
                {inlineOptions.length === 0 ? (
                  <div className="text-[10px] text-muted-foreground p-3">
                    حداقل دو گزینه (Label + Value) وارد کنید یا یک ست آماده
                    انتخاب کنید.
                  </div>
                ) : (
                  <div className="divide-y max-h-56 overflow-auto">
                    {inlineOptions.map((opt, idx) => (
                      <div
                        key={opt.id}
                        className="grid grid-cols-[min-content_1fr_1fr_min-content] items-center gap-2 p-2">
                        <div className="px-1 text-[10px] text-muted-foreground ltr:font-mono opacity-70">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px]">Label</Label>
                          <Input
                            placeholder="مثلاً: بسیار خوب"
                            className="h-8 text-[11px]"
                            value={opt.label}
                            onChange={(e) =>
                              onInlineOptionsChange(
                                inlineOptions.map((o) =>
                                  o.id === opt.id
                                    ? { ...o, label: e.target.value }
                                    : o
                                )
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px]">Value</Label>
                          <Input
                            placeholder="مثلاً: excellent"
                            className="h-8 text-[11px]"
                            value={opt.value}
                            onChange={(e) =>
                              onInlineOptionsChange(
                                inlineOptions.map((o) =>
                                  o.id === opt.id
                                    ? { ...o, value: e.target.value }
                                    : o
                                )
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          {idx > 0 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              icon={<ArrowUp className="size-3" />}
                              onClick={() => moveInline(idx, -1)}
                              aria-label="بالا"
                            />
                          )}
                          {idx < inlineOptions.length - 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              icon={<ArrowDown className="size-3" />}
                              onClick={() => moveInline(idx, 1)}
                              aria-label="پایین"
                            />
                          )}
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            icon={<Trash2 className="size-3" />}
                            onClick={() =>
                              onInlineOptionsChange(
                                inlineOptions.filter((o) => o.id !== opt.id)
                              )
                            }
                            aria-label="حذف"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {inlineOptions.length >= 1 && (
                  <div className="text-[10px] text-muted-foreground flex items-center justify-between p-2">
                    <span>مجموع: {inlineOptions.length} گزینه</span>
                    <span className="opacity-60">
                      Label و Value را کوتاه و واضح وارد کنید
                    </span>
                  </div>
                )}
              </div>
            )}
        </div>
      )}

      {needsScale && (
        <>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium flex items-center gap-2">
              <Minimize2 className="w-4 h-4 text-muted-foreground" /> کمینه
            </Label>
            <Input
              type="number"
              className="h-8 text-xs"
              value={draftMinScale}
              onChange={(e) => onMinScaleChange(Number(e.target.value || 1))}
            />
            <p className="text-[9px] text-muted-foreground pr-0.5">
              عدد شروع مقیاس (پیشفرض 1)
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-muted-foreground" /> بیشینه
            </Label>
            <Input
              type="number"
              className="h-8 text-xs"
              value={draftMaxScale}
              onChange={(e) => onMaxScaleChange(Number(e.target.value || 5))}
            />
            <p className="text-[9px] text-muted-foreground pr-0.5">
              آخرین عدد (باید بزرگ‌تر یا مساوی کمینه باشد)
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default QuestionFormFields;
