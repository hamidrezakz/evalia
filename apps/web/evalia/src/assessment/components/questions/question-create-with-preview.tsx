"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
} from "@/components/ui/panel";
import { Separator } from "@/components/ui/separator";
import {
  QuestionCreateForm,
  type QuestionDraft,
} from "./create/question-create-form";
import { AssessmentForm } from "@/assessment/components/assessment";
import type { Question } from "@/assessment/types/question-banks.types";
import { useCreateQuestion, useOptionSetOptions } from "@/assessment/api/hooks";
import type { OptionItem } from "@/assessment/components/assessment";

interface QuestionCreateWithPreviewProps {
  defaultBankId?: number | null;
  className?: string;
  onCreated?: (question: Question) => void;
}

export const QuestionCreateWithPreview: React.FC<
  QuestionCreateWithPreviewProps
> = ({ defaultBankId = null, className, onCreated }) => {
  const [draft, setDraft] = React.useState<QuestionDraft | null>(null);
  const createMutation = useCreateQuestion();

  const optionSetId = draft?.optionSetId ?? null;
  const { data: optionSetOpts } = useOptionSetOptions(optionSetId ?? null);

  // Map API options to preview OptionItem
  const mappedOptions: OptionItem[] | undefined = React.useMemo(() => {
    if (!optionSetOpts) return undefined;
    const arr = Array.isArray(optionSetOpts)
      ? optionSetOpts
      : (optionSetOpts as any)?.data;
    if (!arr || !Array.isArray(arr)) return undefined;
    return arr.map((o: any) => ({
      value: String(o.value),
      label: String(o.label),
      order: typeof o.order === "number" ? o.order : undefined,
    }));
  }, [optionSetOpts]);

  // Build a transient Question for preview purposes
  const previewQuestion: Question | null = React.useMemo(() => {
    if (!draft?.type || !draft?.text) return null;
    const q: Question = {
      id: 999_000_001, // ephemeral id for preview
      bankId: draft.bankId ?? 0,
      text: draft.text,
      type: draft.type as Question["type"],
      optionSetId: draft.optionSetId ?? undefined,
      minScale: draft.minScale ?? undefined,
      maxScale: draft.maxScale ?? undefined,
      meta: draft.meta,
      createdAt: new Date().toISOString(),
    } as Question;
    return q;
  }, [draft]);

  // Preview loader hooks bridge
  const loadAnswer = React.useCallback(async () => {
    // No persisted answer during creation preview
    return null;
  }, []);

  const submitAnswer = React.useCallback(async () => {
    // Do nothing in preview; just resolve to mimic success
    return { id: undefined };
  }, []);

  const loadOptionSet = React.useCallback(
    async (id: number) => {
      // Serve options for the currently selected optionSetId from hook cache; fallback to empty
      if (optionSetId === id && mappedOptions) return mappedOptions;
      return [] as OptionItem[];
    },
    [optionSetId, mappedOptions]
  );

  return (
    <div className={className}>
      <div className="grid gap-6 md:grid-cols-2">
        <Panel >
          <PanelHeader>
            <PanelTitle>ساخت سوال</PanelTitle>
          </PanelHeader>
          <PanelContent>
            <QuestionCreateForm
            className="w-full"
              defaultBankId={defaultBankId ?? undefined}
              onDraftChange={setDraft}
              onSubmit={async (payload) => {
                const created = await createMutation.mutateAsync(payload);
                onCreated?.(created);
              }}
            />
          </PanelContent>
        </Panel>
        <Panel>
          <PanelHeader>
            <PanelTitle>پیش‌نمایش</PanelTitle>
          </PanelHeader>
          <PanelContent>
            {previewQuestion ? (
              <AssessmentForm
                questions={[previewQuestion]}
                loadAnswer={loadAnswer}
                submitAnswer={submitAnswer}
                loadOptionSet={loadOptionSet}
                generatedOptions={{ defaultScaleMin: 1, defaultScaleMax: 5 }}
              />
            ) : (
              <div className="text-xs text-muted-foreground">
                برای دیدن پیش‌نمایش، نوع سوال و متن سوال را وارد کنید.
              </div>
            )}
          </PanelContent>
        </Panel>
      </div>
    </div>
  );
};
