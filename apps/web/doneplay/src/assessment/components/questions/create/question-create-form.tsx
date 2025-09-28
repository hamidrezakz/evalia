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

  // Dynamic field logic – could be expanded per type
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
      // reset minimal (keep bank to allow fast adding)
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
    <form onSubmit={handleSubmit} className={className}>
      <Card className="p-4 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium">بانک سوال</label>
            <QuestionBankCombobox
              value={bankId}
              onChange={(id) => setBankId(id)}
              placeholder="انتخاب بانک..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">نوع سوال</label>
            <QuestionTypeCombobox
              value={qType}
              onChange={(val) =>
                setQType(val as CreateQuestionBody["type"] | null)
              }
              placeholder="انتخاب نوع..."
            />
          </div>
          <AnimatePresence initial={false}>
            {needsOptionSet && (
              <motion.div key="optset" {...fadeSlideUp} className="space-y-1">
                <label className="text-xs font-medium">دسته گزینه‌ها</label>
                <OptionSetCombobox
                  value={optionSetId}
                  onChange={(id) => setOptionSetId(id)}
                  placeholder="انتخاب دسته..."
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid md:grid-row-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium">متن سوال</label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="مثال: میزان رضایت شما..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">توضیح (اختیاری)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیح تکمیلی برای پاسخ‌دهنده"
              className="min-h-[80px]"
            />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {needsScaleConfig && (
            <motion.div
              key="scale"
              {...fadeSlideUp}
              className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">حداقل (Min)</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={minScale ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMinScale(v === "" ? undefined : parseInt(v, 10));
                  }}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">حداکثر (Max)</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={maxScale ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMaxScale(v === "" ? undefined : parseInt(v, 10));
                  }}
                  placeholder="5"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">مرحله (Step)</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  onChange={(e) =>
                    updateMeta({ step: parseInt(e.target.value || "1", 10) })
                  }
                  placeholder="1"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!isValid}
            isLoading={submitting}
            icon={<Save className="w-4 h-4" />}>
            ذخیره سوال
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setQType(null);
              setOptionSetId(null);
              setText("");
              setDescription("");
              setMeta({});
              setMinScale(undefined);
              setMaxScale(undefined);
            }}
            icon={<PlusCircle className="w-4 h-4" />}>
            سوال جدید
          </Button>
        </div>
      </Card>
    </form>
  );
};
