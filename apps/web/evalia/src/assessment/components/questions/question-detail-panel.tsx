"use client";
import React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
} from "@/components/ui/panel";
import {
  useQuestion,
  useQuestionBank,
  useOptionSetOptions,
  useOptionSet,
} from "../../api/hooks";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionDetailPanelProps {
  questionId: number | null;
  onClose?: () => void;
}

export const QuestionDetailPanel: React.FC<QuestionDetailPanelProps> = ({
  questionId,
}) => {
  const qQuery = useQuestion(questionId || null);
  const question = qQuery.data;
  const bankQuery = useQuestionBank(question?.bankId ?? null);
  const optionSetQuery = useOptionSet(question?.optionSetId ?? null);
  const optionsQuery = useOptionSetOptions(question?.optionSetId ?? null);

  if (!questionId) {
    return (
      <Panel className="min-h-[420px]">
        <PanelHeader>
          <PanelTitle>جزئیات سوال</PanelTitle>
        </PanelHeader>
        <PanelContent className="text-xs text-muted-foreground">
          سوالی انتخاب نشده است
        </PanelContent>
      </Panel>
    );
  }
  if (qQuery.isLoading) {
    return (
      <Panel className="min-h-[420px]">
        <PanelHeader>
          <PanelTitle>جزئیات سوال</PanelTitle>
        </PanelHeader>
        <PanelContent>
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </PanelContent>
      </Panel>
    );
  }
  if (!question) {
    return (
      <Panel className="min-h-[420px]">
        <PanelHeader>
          <PanelTitle>جزئیات سوال</PanelTitle>
        </PanelHeader>
        <PanelContent className="text-xs text-destructive">
          سوال یافت نشد
        </PanelContent>
      </Panel>
    );
  }
  return (
    <Panel className="min-h-[420px] flex flex-col">
      <PanelHeader>
        <PanelTitle>جزئیات سوال</PanelTitle>
      </PanelHeader>
      <PanelContent className="flex-col gap-4 text-[11px] md:text-xs overflow-auto">
        <section className="space-y-1">
          <h4 className="font-medium text-xs">متن</h4>
          <p className="leading-relaxed text-sm">{question.text}</p>
        </section>
        <section className="grid grid-cols-2 gap-3">
          <div>
            <span className="block text-muted-foreground text-[10px]">
              شناسه
            </span>
            <span>{question.id}</span>
          </div>
          <div>
            <span className="block text-muted-foreground text-[10px]">نوع</span>
            <span>{question.type}</span>
          </div>
          {question.code && (
            <div>
              <span className="block text-muted-foreground text-[10px]">
                کد
              </span>
              <span>{question.code}</span>
            </div>
          )}
          {question.minScale != null && (
            <div>
              <span className="block text-muted-foreground text-[10px]">
                حداقل
              </span>
              <span>{question.minScale}</span>
            </div>
          )}
          {question.maxScale != null && (
            <div>
              <span className="block text-muted-foreground text-[10px]">
                حداکثر
              </span>
              <span>{question.maxScale}</span>
            </div>
          )}
          <div>
            <span className="block text-muted-foreground text-[10px]">
              بانک
            </span>
            <span>{bankQuery.data ? bankQuery.data.name : "..."}</span>
          </div>
          <div>
            <span className="block text-muted-foreground text-[10px]">
              OptionSet
            </span>
            <span>
              {optionSetQuery.data
                ? optionSetQuery.data.name
                : question.optionSetId
                ? "..."
                : "—"}
            </span>
          </div>
        </section>
        {question.optionSetId && (
          <section className="space-y-2">
            <h4 className="font-medium text-xs">گزینه های ست</h4>
            {optionsQuery.isLoading && (
              <div className="text-muted-foreground text-[10px]">
                در حال بارگذاری...
              </div>
            )}
            {!optionsQuery.isLoading && (
              <ul className="space-y-1 max-h-48 overflow-auto border rounded-md p-2 bg-background/40">
                {optionsQuery.data?.map((o) => (
                  <li
                    key={o.id}
                    className="flex justify-between gap-2 text-[11px]">
                    <span className="truncate">{o.label}</span>
                    <code className="px-1 bg-muted rounded">{o.value}</code>
                  </li>
                ))}
                {!optionsQuery.data?.length && (
                  <li className="text-muted-foreground text-[10px] text-center">
                    موردی نیست
                  </li>
                )}
              </ul>
            )}
          </section>
        )}
        <section className="space-y-1">
          <h4 className="font-medium text-xs">Meta</h4>
          <pre className="bg-muted/40 rounded-md p-2 max-h-40 overflow-auto text-[10px]">
            {JSON.stringify(question.meta ?? {}, null, 2)}
          </pre>
        </section>
        <section className="grid grid-cols-2 gap-3 border-t pt-2 text-[10px] opacity-80">
          <div>Created: {question.createdAt}</div>
          {question.updatedAt && <div>Updated: {question.updatedAt}</div>}
        </section>
      </PanelContent>
    </Panel>
  );
};
