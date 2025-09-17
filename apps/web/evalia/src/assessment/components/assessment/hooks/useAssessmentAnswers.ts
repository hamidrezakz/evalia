import { useCallback, useEffect, useRef, useState } from "react";
import type { Question } from "@/assessment/types/question-banks.types";
import type {
  AnswerRecord,
  AnswerValue,
  LoadAnswerFn,
  LoadOptionSetFn,
  OptionItem,
  QuestionAnswerMap,
  QuestionStatus,
  SubmitAnswerFn,
  UseAssessmentAnswersArgs,
  UseAssessmentAnswersResult,
} from "../types";

interface InternalOptionCacheEntry {
  loaded: boolean;
  error?: string;
  options: OptionItem[] | null; // null => not applicable (TEXT)
}

function makeInitialRecord(questionId: number): AnswerRecord {
  return {
    questionId,
    status: "UNANSWERED",
    value: "" as any, // placeholder; actual components should treat UNANSWERED separately
  };
}

export function useAssessmentAnswers(
  args: UseAssessmentAnswersArgs
): UseAssessmentAnswersResult {
  const {
    questions,
    loadAnswer,
    submitAnswer,
    loadOptionSet,
    generatedOptions,
    onQuestionStatusChange,
    autoSubmitDebounceMs = 600,
    initialAnswers,
  } = args;

  const [answers, setAnswers] = useState<QuestionAnswerMap>(() => {
    const map: QuestionAnswerMap = {};
    if (initialAnswers) {
      for (const q of questions) {
        const found = initialAnswers[q.id];
        if (found) {
          map[q.id] = {
            questionId: q.id,
            value: found.value,
            backendId: found.id,
            status: "ANSWERED",
            updatedAt: Date.now(),
          };
        }
      }
    }
    return map;
  });

  const optionCache = useRef<Record<number, InternalOptionCacheEntry>>({});
  const debouncers = useRef<Record<number, any>>({});

  // Load previous answers lazily (on first renderer mount) rather than upfront to avoid heavy waterfalls
  const loadedAnswerFlags = useRef<Record<number, boolean>>({});

  const emitStatusChange = useCallback(
    (rec: AnswerRecord) => {
      onQuestionStatusChange?.(rec);
    },
    [onQuestionStatusChange]
  );

  const ensureRemoteAnswerLoaded = useCallback(
    async (q: Question) => {
      if (loadedAnswerFlags.current[q.id]) return;
      loadedAnswerFlags.current[q.id] = true;
      if (answers[q.id]) return; // already have (maybe initial)
      try {
        const remote = await loadAnswer(q);
        if (remote) {
          setAnswers((prev) => {
            const rec: AnswerRecord = {
              questionId: q.id,
              value: remote.value,
              backendId: remote.id,
              status: "ANSWERED",
              updatedAt: Date.now(),
            };
            const next = { ...prev, [q.id]: rec };
            emitStatusChange(rec);
            return next;
          });
        }
      } catch (e) {
        // swallow; question stays unanswered
      }
    },
    [answers, loadAnswer, emitStatusChange]
  );

  const setLocalValue = useCallback((q: Question, value: AnswerValue) => {
    setAnswers((prev) => {
      const existing = prev[q.id];
      const base: AnswerRecord = existing ?? makeInitialRecord(q.id);
      const rec: AnswerRecord = {
        ...base,
        value,
        status: existing?.status === "ANSWERED" ? "ANSWERED" : "UNANSWERED",
        updatedAt: Date.now(),
      };
      const next = { ...prev, [q.id]: rec };
      return next;
    });
  }, []);

  const submit = useCallback(
    async (q: Question) => {
      setAnswers((prev) => {
        const existing = prev[q.id];
        if (!existing) return prev; // nothing to submit
        const rec: AnswerRecord = { ...existing, status: "SUBMITTING" };
        const next = { ...prev, [q.id]: rec };
        emitStatusChange(rec);
        return next;
      });
      const recordBefore = answers[q.id];
      try {
        const res = await submitAnswer(q, recordBefore?.value as AnswerValue, {
          previous: recordBefore,
        });
        setAnswers((prev) => {
          const prevRec = prev[q.id];
          if (!prevRec) return prev; // removed meanwhile
          const rec: AnswerRecord = {
            ...prevRec,
            status: "ANSWERED",
            backendId: res.id ?? prevRec.backendId,
            value: (res.value ?? prevRec.value) as AnswerValue,
            error: undefined,
            updatedAt: Date.now(),
          };
          const next = { ...prev, [q.id]: rec };
          emitStatusChange(rec);
          return next;
        });
      } catch (e: any) {
        setAnswers((prev) => {
          const prevRec = prev[q.id];
          if (!prevRec) return prev;
          const rec: AnswerRecord = {
            ...prevRec,
            status: "ERROR",
            error: e?.message || "خطا در ثبت پاسخ",
          };
          const next = { ...prev, [q.id]: rec };
          emitStatusChange(rec);
          return next;
        });
      }
    },
    [answers, submitAnswer, emitStatusChange]
  );

  const scheduleAutoSubmit = useCallback(
    (q: Question) => {
      // Only for types requiring debounce (TEXT, SCALE maybe). Others call submit immediately after change.
      const ms = autoSubmitDebounceMs;
      if (debouncers.current[q.id]) clearTimeout(debouncers.current[q.id]);
      debouncers.current[q.id] = setTimeout(() => {
        submit(q);
      }, ms);
    },
    [autoSubmitDebounceMs, submit]
  );

  // Option generation & loading logic
  const ensureOptions = useCallback(
    async (q: Question): Promise<OptionItem[] | null> => {
      // TEXT has no options
      if (q.type === "TEXT") return null;
      // BOOLEAN -> deterministic two options
      if (q.type === "BOOLEAN") {
        const yes = generatedOptions?.booleanYesLabel ?? "بله";
        const no = generatedOptions?.booleanNoLabel ?? "خیر";
        const opts: OptionItem[] = [
          { value: "true", label: yes, order: 0 },
          { value: "false", label: no, order: 1 },
        ];
        optionCache.current[q.id] = { loaded: true, options: opts };
        return opts;
      }
      // SCALE -> generate range options but treat answer as numeric (options help for UI rendering of selection radio-like)
      if (q.type === "SCALE") {
        const min = q.minScale ?? generatedOptions?.defaultScaleMin ?? 1;
        const max = q.maxScale ?? generatedOptions?.defaultScaleMax ?? 5;
        const opts: OptionItem[] = [];
        for (let i = min; i <= max; i++) {
          opts.push({ value: String(i), label: String(i), order: i });
        }
        optionCache.current[q.id] = { loaded: true, options: opts };
        return opts;
      }
      // CHOICE types
      if (!q.optionSetId) {
        optionCache.current[q.id] = {
          loaded: true,
          options: [],
          error: "optionSetId الزامی است",
        };
        return [];
      }
      const existing = optionCache.current[q.id];
      if (existing?.loaded) return existing.options;
      if (!loadOptionSet) return [];
      try {
        const opts = await loadOptionSet(q.optionSetId);
        optionCache.current[q.id] = { loaded: true, options: opts };
        return opts;
      } catch (e: any) {
        optionCache.current[q.id] = {
          loaded: true,
          options: [],
          error: e?.message || "خطا در دریافت گزینه‌ها",
        };
        return [];
      }
    },
    [generatedOptions, loadOptionSet]
  );

  const getOptionsSync = useCallback((questionId: number) => {
    return optionCache.current[questionId]?.options;
  }, []);

  // Public accessor ensuring record presence (without mutating state if absent)
  const getDisplayState = useCallback(
    (q: Question): AnswerRecord => {
      return (
        answers[q.id] ?? {
          questionId: q.id,
          value: "" as any,
          status: "UNANSWERED",
        }
      );
    },
    [answers]
  );

  // Expose side effects helpers for renderers
  const valueSetAndMaybeSubmit = useCallback(
    (q: Question, value: AnswerValue, strategy: "immediate" | "debounce") => {
      setLocalValue(q, value);
      if (strategy === "immediate") submit(q);
      else scheduleAutoSubmit(q);
    },
    [setLocalValue, submit, scheduleAutoSubmit]
  );

  // Provide wrapper that renderers can use (export by returning in result as setLocalValue/submit but keep local util maybe future)

  return {
    answers,
    setLocalValue: valueSetAndMaybeSubmit as any, // Cast for simpler external usage
    submit,
    ensureOptions,
    getOptionsSync,
    getDisplayState,
  };
}
