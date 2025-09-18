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

  // Track focus/highlight index (suggested next to answer)
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const itemRefs = React.useRef<Record<number, HTMLDivElement | null>>({});

  // Compute progress
  const answeredCount = React.useMemo(
    () => questions.filter((q) => answerState.getDisplayState(q).status === "ANSWERED").length,
    [questions, answerState]
  );
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  // When an answer transitions to ANSWERED, move to next unanswered and scroll
  React.useEffect(() => {
    // Find first unanswered from current activeIndex forward
    const nextIdx = questions.findIndex((q, idx) => {
      if (idx <= activeIndex) return false;
      const st = answerState.getDisplayState(q).status;
      return st !== "ANSWERED";
    });
    if (nextIdx !== -1 && nextIdx !== activeIndex) {
      // optional: wait a tick for DOM update
      const el = itemRefs.current[questions[nextIdx].id];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveIndex(nextIdx);
      }
    }
  }, [answeredCount]);

  const handleFirstVisible = React.useCallback((q: Question) => {
    // Trigger remote answer load (lazy) by calling ensureRemoteAnswerLoaded indirectly; currently integrated inside hook via ensureOptions call.
    // For clarity we could expose a method but design kept minimal; remote answer load occurs when renderer mounts.
    // (If we later need explicit call we can extend the hook API.)
  }, []);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Sticky progress bar */}
      <div className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/90 border-b">
        <div className="mx-auto max-w-3xl px-4 py-2 flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            پیشرفت: {answeredCount}/{questions.length} ({progress}%)
          </div>
          <div className="flex-1">
            <div className="bg-primary/15 h-2 rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {questions.map((q, idx) => {
        const rec = answerState.getDisplayState(q);
        const isActive = idx === activeIndex;
        return (
          <div
            key={q.id}
            ref={(el) => {
              itemRefs.current[q.id] = el;
            }}
            className={cn(
              "p-4 flex flex-col gap-3 max-w-2xl rounded-lg border",
              isActive ? "border-primary/60 bg-primary/5" : "border-transparent"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn("text-xs font-bold w-6 h-6 rounded-full grid place-items-center",
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}
              >
                {idx + 1}
              </div>
              <div className="text-[13px] text-muted-foreground">
                سوال {idx + 1} از {questions.length}
              </div>
            </div>
            <QuestionRenderer
              question={q}
              record={rec}
              ensureOptions={answerState.ensureOptions}
              getOptionsSync={answerState.getOptionsSync}
              setValue={answerState.setLocalValue as any}
              hideTitle={false}
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
          </div>
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
