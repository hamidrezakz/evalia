"use client";
import * as React from "react";
import { QuestionBankCombobox } from "./question-bank-combobox";
import { OptionSetCombobox } from "./option-set-combobox";
import { QuestionTypeCombobox } from "./question-type-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { fadeSlideUp } from "@/lib/motion/presets";
import { Save, PlusCircle } from "lucide-react";
import { QuestionTypeEnum } from "@/lib/enums";
import type { CreateQuestionBody } from "@/assessment/api/questions.api";
// NOTE: bank & option set comboboxes now require orgId implicitly through their internal hooks which were updated to use org context.

// Live draft type exposed upward (some fields may be incomplete while user is typing)
export interface QuestionDraft extends Partial<CreateQuestionBody> {
  isValid: boolean; // convenience flag for parent preview enable/disable
}

interface QuestionCreateFormProps {
  onSubmit?: (data: CreateQuestionBody) => void | Promise<void>;
  onDraftChange?: (draft: QuestionDraft) => void;
  className?: string;
  defaultBankId?: number | null;
}

export const QuestionCreateForm: React.FC<QuestionCreateFormProps> = ({
  onSubmit,
  onDraftChange,
  className,
  defaultBankId = null,
}) => {
  const [bankId, setBankId] = React.useState<number | null>(defaultBankId);
  const [optionSetId, setOptionSetId] = React.useState<number | null>(null);
  const [qType, setQType] = React.useState<CreateQuestionBody["type"] | null>(
    null
  );

  const [text, setText] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [meta, setMeta] = React.useState<Record<string, any>>({});
  const [minScale, setMinScale] = React.useState<number | undefined>(undefined);
  const [maxScale, setMaxScale] = React.useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = React.useState(false);

  const typeDef = qType ? QuestionTypeEnum.option(qType as any) : null;
  const needsOptionSet = qType === "MULTI_CHOICE" || qType === "SINGLE_CHOICE";
  const needsScaleConfig = qType === "SCALE";

  function updateMeta(patch: Record<string, any>) {
    setMeta((m) => ({ ...m, ...patch }));
  }

  const isValid =
    !!bankId && !!qType && !!text.trim() && (!needsOptionSet || !!optionSetId);

  // Expose draft upward for live preview
  React.useEffect(() => {
    onDraftChange?.({
      bankId: bankId ?? undefined,
      optionSetId: needsOptionSet ? optionSetId ?? undefined : undefined,
      type: qType ?? undefined,
      text: text || undefined,
      minScale: needsScaleConfig ? minScale : undefined,
      maxScale: needsScaleConfig ? maxScale : undefined,
      meta: Object.keys(meta).length ? meta : undefined,
      isValid,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bankId,
    optionSetId,
    qType,
    text,
    description,
    meta,
    minScale,
    maxScale,
    needsOptionSet,
    needsScaleConfig,
    isValid,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const payload: CreateQuestionBody = {
      bankId: bankId!,
      optionSetId: needsOptionSet ? optionSetId ?? undefined : undefined,
      type: qType!,
      text: text.trim(),
      minScale: needsScaleConfig ? minScale : undefined,
      maxScale: needsScaleConfig ? maxScale : undefined,
      meta: Object.keys(meta).length ? meta : undefined,
    };
    try {
      setSubmitting(true);
      await onSubmit?.(payload);
      setQType(null);
      setOptionSetId(null);
      setText("");
      setDescription("");
      setMeta({});
      setMinScale(undefined);
      setMaxScale(undefined);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className} dir="rtl">
      <Card className="p-4 md:p-5 space-y-5">
        {/* Header / status bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span
              className={
                isValid
                  ? "text-green-600 dark:text-green-400"
                  : "text-amber-600 dark:text-amber-400"
              }>
              {isValid ? "آماده ذخیره" : "ناقص"}
            </span>
            {qType && (
              <span className="inline-flex items-center gap-1">
                <strong className="font-medium">نوع:</strong>
                <span>{QuestionTypeEnum.t(qType as any)}</span>
              </span>
            )}
            {needsOptionSet && !optionSetId && (
              <span className="text-destructive">گزینه‌ها انتخاب نشده</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => {
                setQType(null);
                setOptionSetId(null);
                setText("");
                setDescription("");
                setMeta({});
                setMinScale(undefined);
                setMaxScale(undefined);
              }}>
              سوال جدید
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!isValid}
              isLoading={submitting}
              icon={<Save className="w-4 h-4" />}
              iconPosition="left">
              ذخیره
            </Button>
          </div>
        </div>

        {/* Config row */}
        <fieldset className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium tracking-tight">
              بانک سوال
            </label>
            <QuestionBankCombobox
              value={bankId}
              onChange={(id) => setBankId(id)}
              placeholder="انتخاب بانک..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium tracking-tight">
              نوع سوال
            </label>
            <QuestionTypeCombobox
              value={qType}
              onChange={(val) =>
                setQType(val as CreateQuestionBody["type"] | null)
              }
              placeholder="نوع..."
            />
          </div>
          <AnimatePresence initial={false}>
            {needsOptionSet && (
              <motion.div key="optset" {...fadeSlideUp} className="space-y-1.5">
                <label className="text-[11px] font-medium tracking-tight">
                  دسته گزینه‌ها
                </label>
                <OptionSetCombobox
                  value={optionSetId}
                  onChange={(id) => setOptionSetId(id)}
                  placeholder="دسته..."
                />
              </motion.div>
            )}
          </AnimatePresence>
        </fieldset>

        {/* Question text & description */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 col-span-2">
            <label className="text-[11px] font-medium tracking-tight">
              صورت سوال
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="متن سوال را بنویسید..."
              className="min-h-[90px] resize-y text-sm leading-relaxed"
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-[11px] font-medium tracking-tight">
              توضیح (اختیاری)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیح تکمیلی برای راهنمایی پاسخ‌دهنده"
              className="min-h-[70px] resize-y text-xs"
            />
          </div>
        </div>

        {/* Scale config */}
        <AnimatePresence initial={false}>
          {needsScaleConfig && (
            <motion.fieldset
              key="scale"
              {...fadeSlideUp}
              className="grid md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium tracking-tight">
                  حداقل
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={minScale ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMinScale(v === "" ? undefined : parseInt(v, 10));
                  }}
                  placeholder="0"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium tracking-tight">
                  حداکثر
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={maxScale ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMaxScale(v === "" ? undefined : parseInt(v, 10));
                  }}
                  placeholder="5"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium tracking-tight">
                  گام (Step)
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  onChange={(e) =>
                    updateMeta({ step: parseInt(e.target.value || "1", 10) })
                  }
                  placeholder="1"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium tracking-tight">
                  پیش‌نمایش محدوده
                </label>
                <div className="text-[11px] text-muted-foreground border rounded-md px-2 py-1 h-8 flex items-center">
                  {minScale ?? "?"} - {maxScale ?? "?"}
                </div>
              </div>
            </motion.fieldset>
          )}
        </AnimatePresence>

        {/* Keyboard hint */}
        <div className="flex items-center justify-end">
          <span className="text-[10px] text-muted-foreground">
            (Ctrl+Enter) برای ذخیره سریع
          </span>
        </div>
      </Card>
    </form>
  );
};
