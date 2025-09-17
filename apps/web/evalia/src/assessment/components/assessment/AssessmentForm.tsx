"use client";
import * as React from "react";
import type { AssessmentFormProps } from "./types";
import { useAssessmentAnswers } from "./hooks/useAssessmentAnswers";
import { QuestionRenderer } from "./QuestionRenderer";
import type { Question } from "@/assessment/types/question-banks.types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * AssessmentForm
 * ---------------------------------------
 * ویژگی‌ها:
 * - بارگذاری خودکار پاسخ‌های قبلی (lazy) هنگام اولین نمایش هر سوال
 * - ذخیره خودکار پاسخ (immediate برای انتخابی / بولین / مقیاسی، debounce برای متنی)
 * - تولید گزینه داخلی برای BOOLEAN و SCALE (عدم نیاز به optionSetId)
 * - دریافت گزینه‌ها از optionSetId برای CHOICE ها با loadOptionSet
 * - وضعیت هر سوال: UNANSWERED | SUBMITTING | ANSWERED | ERROR
 * - ایزوله شدن لایه ذخیره / دریافت با loadAnswer & submitAnswer props
 */
export function AssessmentForm(props: AssessmentFormProps) {
  const {
    questions,
    loadAnswer,
    submitAnswer,
    loadOptionSet,
    generatedOptions,
    autoSubmitDebounceMs,
    onQuestionStatusChange,
    className,
    initialAnswers,
  } = props;

  const answerState = useAssessmentAnswers({
    questions,
    loadAnswer,
    submitAnswer,
    loadOptionSet,
    generatedOptions,
    autoSubmitDebounceMs,
    onQuestionStatusChange,
    initialAnswers,
  });

  const handleFirstVisible = React.useCallback((q: Question) => {
    // Trigger remote answer load (lazy) by calling ensureRemoteAnswerLoaded indirectly; currently integrated inside hook via ensureOptions call.
    // For clarity we could expose a method but design kept minimal; remote answer load occurs when renderer mounts.
    // (If we later need explicit call we can extend the hook API.)
  }, []);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {questions.map((q, idx) => {
        const rec = answerState.getDisplayState(q);
        return (
          <Card key={q.id} className="p-4 flex flex-col gap-3">
            <QuestionRenderer
              question={q}
              record={rec}
              ensureOptions={answerState.ensureOptions}
              getOptionsSync={answerState.getOptionsSync}
              setValue={answerState.setLocalValue as any}
              onFirstVisible={() => handleFirstVisible(q)}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <QuestionStatusBadge recordStatus={rec.status} />
              {q.type === "SCALE" && (
                <span>
                  محدوده: {q.minScale ?? 1} - {q.maxScale ?? 5}
                </span>
              )}
            </div>
            {idx < questions.length - 1 && <Separator className="mt-2" />}
          </Card>
        );
      })}
    </div>
  );
}

function QuestionStatusBadge({ recordStatus }: { recordStatus: string }) {
  switch (recordStatus) {
    case "UNANSWERED":
      return <span className="text-amber-600">پاسخ داده نشده</span>;
    case "SUBMITTING":
      return (
        <span className="text-blue-600 animate-pulse">در حال ذخیره...</span>
      );
    case "ANSWERED":
      return <span className="text-emerald-600">ذخیره شد</span>;
    case "ERROR":
      return <span className="text-destructive">خطا در ذخیره</span>;
    default:
      return null;
  }
}
