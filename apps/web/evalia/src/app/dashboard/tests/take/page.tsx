"use client";
import React from "react";
import { useAssessmentUserSessions } from "@/assessment/context/assessment-user-sessions";
import type {
  UserSessionQuestions,
  UpsertResponseBody,
} from "@/assessment/api/sessions.api";
import {
  useUserSessionQuestions,
  useResponses,
  useBulkUpsertResponses,
} from "@/assessment/api/templates-hooks";
import { ResponsePerspectiveEnum, SessionStateEnum } from "@/lib/enums";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelAction,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserDataContext } from "@/users/context";
// no separators for ultra-simple look
import type { AnswerMap, FlatQuestion, AnswerValue } from "./types";
import { QuestionText } from "./components/QuestionText";
import { QuestionBoolean } from "./components/QuestionBoolean";
import { QuestionSingleChoice } from "./components/QuestionSingleChoice";
import { QuestionMultiChoice } from "./components/QuestionMultiChoice";
import { QuestionScale } from "./components/QuestionScale";
import { ProgressCircle } from "./components/ProgressCircle";
import { AlertTriangle } from "lucide-react";

export default function TakeAssessmentPage() {
  const { user } = useUserDataContext();
  const {
    userId,
    activeSessionId,
    activePerspective,
    availablePerspectives,
    setActivePerspective,
    activeSession,
  } = useAssessmentUserSessions();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<UserSessionQuestions | null>(null);
  const [answers, setAnswers] = React.useState<AnswerMap>({});
  const [serverAnswers, setServerAnswers] = React.useState<AnswerMap>({});

  const questionRefs = React.useRef<Record<number, HTMLDivElement | null>>({});

  const canLoad =
    userId != null && activeSessionId != null && !!activePerspective;

  // Data via React Query hooks
  const uq = useUserSessionQuestions(
    canLoad ? (activeSessionId as number) : null,
    canLoad ? (userId as number) : null,
    canLoad ? (activePerspective as string) : null
  );
  const hasEmbedded = !!(uq.data as any)?.responses?.length;
  const respQ = useResponses(
    uq.data && !hasEmbedded
      ? {
          sessionId: uq.data.session.id,
          assignmentId: uq.data.assignment.id,
          userId: userId!,
          perspective: uq.data.assignment.perspective,
          pageSize: 500,
        }
      : { sessionId: undefined }
  );
  const bulk = useBulkUpsertResponses();

  // helpers to build map and parse responses
  const buildTypeMap = React.useCallback((res: UserSessionQuestions | null) => {
    const map: Record<number, string> = {};
    if (!res) return map;
    for (const sec of res.sections) {
      for (const q of sec.questions) {
        const qt = (q.question as any)?.type as string;
        map[q.templateQuestionId] = qt;
      }
    }
    return map;
  }, []);
  const parseSrv = React.useCallback(
    (items: any[], typeMap: Record<number, string>) => {
      const srv: AnswerMap = {};
      for (const r of items || []) {
        const linkId = r.templateQuestionId as number;
        const qType = typeMap[linkId];
        if (!qType) continue;
        if (r.textValue != null && qType === "TEXT") {
          srv[linkId] = { kind: "TEXT", text: r.textValue ?? "" } as any;
        } else if (r.scaleValue != null && qType === "SCALE") {
          srv[linkId] = { kind: "SCALE", value: Number(r.scaleValue) } as any;
        } else if (
          Array.isArray(r.optionValues) &&
          r.optionValues.length &&
          qType === "MULTI_CHOICE"
        ) {
          srv[linkId] = {
            kind: "MULTI_CHOICE",
            values: r.optionValues as string[],
          } as any;
        } else if (r.optionValue != null) {
          if (qType === "BOOLEAN") {
            srv[linkId] = {
              kind: "BOOLEAN",
              value: r.optionValue === "true",
            } as any;
          } else if (qType === "SINGLE_CHOICE") {
            srv[linkId] = {
              kind: "SINGLE_CHOICE",
              value: r.optionValue as string,
            } as any;
          }
        }
      }
      return srv;
    },
    []
  );

  // On questions/session change: clear previous answers and prefill from embedded if exists
  React.useEffect(() => {
    if (!uq.data) return;
    const res = uq.data as UserSessionQuestions;
    setData(res);
    // clear stale values from other sessions
    setServerAnswers({});
    setAnswers({});
    const embedded = (res as any).responses as any[] | undefined;
    if (embedded && embedded.length) {
      const typeMap = buildTypeMap(res);
      const srv = parseSrv(embedded, typeMap);
      setServerAnswers(srv);
      setAnswers(srv);
    }
  }, [uq.data, buildTypeMap, parseSrv]);

  // When fallback responses arrive (no embedded): prefill
  React.useEffect(() => {
    const res = (uq.data as UserSessionQuestions) || null;
    if (!res) return;
    const embedded = (res as any).responses as any[] | undefined;
    if (embedded && embedded.length) return; // already handled
    if (respQ.data?.data?.length) {
      const typeMap = buildTypeMap(res);
      const srv = parseSrv(respQ.data.data as any[], typeMap);
      setServerAnswers(srv);
      setAnswers(srv);
    }
  }, [respQ.data, uq.data, buildTypeMap, parseSrv]);

  const flatQuestions = React.useMemo(() => {
    const items: FlatQuestion[] = [];
    if (!data) return items;
    for (const sec of data.sections) {
      for (const q of sec.questions) {
        const qObj = q.question as any;
        const direct = Array.isArray(qObj?.options) ? qObj.options : [];
        const fromSet = Array.isArray(qObj?.optionSet?.options)
          ? qObj.optionSet.options
          : [];
        const options = (direct.length ? direct : fromSet).map((o: any) => ({
          id: o.id,
          value: String(o.value),
          label: String(o.label),
          order: o.order,
        }));
        items.push({
          sectionId: sec.id,
          sectionTitle: sec.title,
          linkId: q.templateQuestionId,
          questionId: q.questionId,
          order: q.order,
          required: q.required,
          type: qObj?.type,
          text: qObj?.text ?? "",
          options,
        });
      }
    }
    // sort by section then order within if needed (already ordered by schema)
    return items;
  }, [data]);

  const qIndexMap = React.useMemo(() => {
    const m: Record<number, number> = {};
    flatQuestions.forEach((q, i) => (m[q.linkId] = i + 1));
    return m;
  }, [flatQuestions]);

  const answeredCount = React.useMemo(() => {
    return Object.values(answers).filter(Boolean).length;
  }, [answers]);

  // Helper to compare two answers for equality
  function answersEqual(a?: AnswerMap[number], b?: AnswerMap[number]) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if ((a as any).kind !== (b as any).kind) return false;
    switch ((a as any).kind) {
      case "TEXT":
        return (a as any).text === (b as any).text;
      case "BOOLEAN":
        return (a as any).value === (b as any).value;
      case "SINGLE_CHOICE":
        return (a as any).value === (b as any).value;
      case "SCALE":
        return Number((a as any).value) === Number((b as any).value);
      case "MULTI_CHOICE": {
        const av = ([...((a as any).values || [])] as string[]).slice().sort();
        const bv = ([...((b as any).values || [])] as string[]).slice().sort();
        if (av.length !== bv.length) return false;
        for (let i = 0; i < av.length; i++) if (av[i] !== bv[i]) return false;
        return true;
      }
      default:
        return false;
    }
  }

  function autoScrollToNext(currentLinkId: number) {
    const idx = flatQuestions.findIndex((q) => q.linkId === currentLinkId);
    if (idx == null || idx < 0) return;
    const next = flatQuestions[idx + 1];
    if (!next) return;
    const el = questionRefs.current[next.linkId];
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function setAnswer(
    linkId: number,
    v: AnswerMap[number],
    opts?: { autoScroll?: boolean }
  ) {
    setAnswers((prev) => ({ ...prev, [linkId]: v }));
    if (opts?.autoScroll) autoScrollToNext(linkId);
  }

  async function handleSaveAll() {
    if (!data) return;
    if (data.session.state !== "IN_PROGRESS") {
      setError(
        `امکان ثبت پاسخ در وضعیت «${SessionStateEnum.t(
          data.session.state as any
        )}» وجود ندارد.`
      );
      return;
    }
    const sessionId = data.session.id;
    const assignmentId = data.assignment.id;
    const items: UpsertResponseBody[] = [];
    for (const q of flatQuestions) {
      const a = answers[q.linkId];
      if (!a) continue; // skip unanswered
      const base = {
        assignmentId,
        sessionId,
        templateQuestionId: q.linkId,
      } as Pick<
        UpsertResponseBody,
        "assignmentId" | "sessionId" | "templateQuestionId"
      >;
      if (a.kind === "TEXT") {
        items.push({ ...base, textValue: a.text });
      } else if (a.kind === "BOOLEAN") {
        items.push({ ...base, optionValue: a.value ? "true" : "false" });
      } else if (a.kind === "SINGLE_CHOICE") {
        items.push({ ...base, optionValue: a.value });
      } else if (a.kind === "MULTI_CHOICE") {
        items.push({ ...base, optionValues: a.values });
      } else if (a.kind === "SCALE") {
        items.push({ ...base, scaleValue: a.value });
      }
    }
    if (!items.length) return;
    setSaving(true);
    setError(null);
    try {
      const result = await bulk.mutateAsync({ items } as any);
      // Merge saved items into serverAnswers to clear pending state
      setServerAnswers((prev: AnswerMap) => {
        const next = { ...prev } as AnswerMap;
        for (const it of items) {
          const linkId = it.templateQuestionId;
          if ("textValue" in it && it.textValue != null) {
            next[linkId] = { kind: "TEXT", text: it.textValue } as any;
          } else if ("scaleValue" in it && it.scaleValue != null) {
            next[linkId] = {
              kind: "SCALE",
              value: Number(it.scaleValue),
            } as any;
          } else if (Array.isArray((it as any).optionValues)) {
            next[linkId] = {
              kind: "MULTI_CHOICE",
              values: (it as any).optionValues,
            } as any;
          } else if ("optionValue" in it && (it as any).optionValue != null) {
            // We can't know here if it was BOOLEAN or SINGLE_CHOICE for sure; infer from current answer
            const curr = answers[linkId] as any;
            if (curr?.kind === "BOOLEAN") {
              next[linkId] = {
                kind: "BOOLEAN",
                value: (it as any).optionValue === "true",
              } as any;
            } else {
              next[linkId] = {
                kind: "SINGLE_CHOICE",
                value: (it as any).optionValue,
              } as any;
            }
          }
        }
        return next;
      });
    } catch (e) {
      setError((e as any)?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  if (!canLoad) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-3">ورود به آزمون</h1>
        <p className="text-muted-foreground">
          لطفاً ابتدا از سایدبار یک آزمون و پرسپکتیو را انتخاب کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Floating progress only (top-left, unobtrusive, no container) */}
      <div className="fixed left-2 sm:left-2 bottom-0 z-40 pointer-events-none">
        <ProgressCircle value={answeredCount} total={flatQuestions.length} />
      </div>

      {/* Session info panel with perspective selector */}
      <Panel className="shadow-sm">
        <PanelHeader className="[.border-b]:border-border/70">
          <PanelTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
            <span className="break-words whitespace-normal">
              {uq.data?.session.name ?? activeSession?.name ?? "آزمون"}
            </span>
            {uq.data?.session?.state && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] sm:text-[11px] font-medium",
                  uq.data.session.state === "IN_PROGRESS"
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50 dark:border-emerald-600/60 dark:text-emerald-300 dark:bg-emerald-950/30"
                    : uq.data.session.state === "SCHEDULED"
                    ? "border-sky-500 text-sky-700 bg-sky-50 dark:border-sky-600/60 dark:text-sky-300 dark:bg-sky-950/30"
                    : uq.data.session.state === "COMPLETED"
                    ? "border-gray-300 text-gray-700 bg-gray-50 dark:border-gray-600/60 dark:text-gray-300 dark:bg-gray-900"
                    : "border-amber-500 text-amber-700 bg-amber-50 dark:border-amber-600/60 dark:text-amber-300 dark:bg-amber-950/30"
                )}>
                {SessionStateEnum.t(uq.data.session.state as any)}
              </Badge>
            )}
          </PanelTitle>

          <PanelAction>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                پرسپکتیو:
              </span>
              <Select
                value={activePerspective ?? undefined}
                onValueChange={(v) => setActivePerspective(v as any)}>
                <SelectTrigger size="sm">
                  <SelectValue placeholder="انتخاب پرسپکتیو" />
                </SelectTrigger>
                <SelectContent align="end">
                  {availablePerspectives?.length ? (
                    availablePerspectives.map((p) => (
                      <SelectItem key={p as any} value={p as any}>
                        {ResponsePerspectiveEnum.t(p as any)}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      پرسپکتیوی موجود نیست
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </PanelAction>

          <PanelDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            {user?.name && (
              <span className="font-medium text-foreground/80">
                شرکت‌کننده: {user.name}
              </span>
            )}
            {activeSession?.startAt && (
              <span>
                شروع:{" "}
                {new Date(activeSession.startAt as any).toLocaleString("fa-IR")}
              </span>
            )}
            {activeSession?.endAt && (
              <span>
                پایان:{" "}
                {new Date(activeSession.endAt as any).toLocaleString("fa-IR")}
              </span>
            )}
          </PanelDescription>
        </PanelHeader>
        {/* Optional extra content row for future details */}
      </Panel>
      {data && data.session.state !== "IN_PROGRESS" && (
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm dark:text-amber-300 dark:bg-amber-950/30 dark:border-amber-600/60">
          <AlertTriangle className="h-4 w-4" />
          <span>
            این جلسه در وضعیت «{SessionStateEnum.t(data.session.state as any)}»
            است و فعلاً امکان ثبت پاسخ ندارد.
          </span>
        </div>
      )}
      {uq.isLoading ? (
        <div className="text-sm text-muted-foreground">
          در حال بارگذاری سوالات…
        </div>
      ) : uq.error ? (
        <div className="text-sm text-rose-600">
          {String((uq.error as any)?.message || uq.error)}
        </div>
      ) : !data ? (
        <div className="text-sm text-muted-foreground">داده‌ای یافت نشد.</div>
      ) : (
        <div className="max-w-2xl">
          {data.sections.map((sec: any) => (
            <section key={sec.id} className="space-y-4">
              <h2 className="text-lg font-semibold">{sec.title}</h2>
              <div className="space-y-8">
                {sec.questions.map((q: any) => {
                  const qObj = q.question as any;
                  const linkId = q.templateQuestionId;
                  const type = qObj?.type as string;
                  const text = qObj?.text as string;
                  const direct = Array.isArray(qObj?.options)
                    ? qObj.options
                    : [];
                  const fromSet = Array.isArray(qObj?.optionSet?.options)
                    ? qObj.optionSet.options
                    : [];
                  const options = (direct.length ? direct : fromSet).map(
                    (o: any) => ({
                      id: o.id,
                      value: String(o.value),
                      label: String(o.label),
                    })
                  );
                  const current = answers[linkId];
                  const saved = serverAnswers[linkId];
                  const pending = current && !answersEqual(current, saved);
                  const hasSaved = !!saved && !pending;
                  const notAnswered = !current && !saved;
                  return (
                    <div
                      key={linkId}
                      ref={(el) => {
                        questionRefs.current[linkId] = el;
                      }}
                      className="scroll-mt-[75px]">
                      <div className="mb-2">
                        <span className="font-medium">
                          {qIndexMap[linkId]}. {text}
                        </span>
                        {q.required ? (
                          <span className="text-amber-600 text-xs mr-2">
                            (اجباری)
                          </span>
                        ) : null}
                        <span className="mx-2 text-xs">
                          {pending ? (
                            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-700 dark:border-sky-600/60 dark:bg-sky-950/30 dark:text-sky-300">
                              منتظر ذخیره
                            </span>
                          ) : hasSaved ? (
                            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:border-emerald-600/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                              پاسخ داده شده
                            </span>
                          ) : notAnswered ? (
                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-muted-foreground dark:border-gray-600/60 dark:bg-gray-900 dark:text-gray-400">
                              پاسخ داده نشده
                            </span>
                          ) : null}
                        </span>
                      </div>

                      {/* Render by type via components */}
                      {type === "TEXT" && (
                        <QuestionText
                          id={linkId}
                          value={current as AnswerValue | undefined}
                          onChange={(v: any) => setAnswer(linkId, v)}
                          onSubmitNext={() =>
                            setAnswer(
                              linkId,
                              (current as any) ?? { kind: "TEXT", text: "" },
                              { autoScroll: true }
                            )
                          }
                        />
                      )}
                      {type === "BOOLEAN" && (
                        <QuestionBoolean
                          name={`q-${linkId}`}
                          value={current as AnswerValue | undefined}
                          onChange={(v: any) =>
                            setAnswer(linkId, v, { autoScroll: true })
                          }
                        />
                      )}
                      {type === "SINGLE_CHOICE" && (
                        <QuestionSingleChoice
                          name={`q-${linkId}`}
                          options={options}
                          value={current as AnswerValue | undefined}
                          onChange={(v: any) =>
                            setAnswer(linkId, v, { autoScroll: true })
                          }
                        />
                      )}
                      {type === "MULTI_CHOICE" && (
                        <QuestionMultiChoice
                          options={options}
                          value={current as AnswerValue | undefined}
                          onChange={(v: any) => setAnswer(linkId, v)}
                        />
                      )}
                      {type === "SCALE" && (
                        <QuestionScale
                          name={`q-${linkId}`}
                          options={
                            options.length
                              ? options
                              : [1, 2, 3, 4, 5].map((n) => ({
                                  value: String(n),
                                  label: String(n),
                                }))
                          }
                          value={current as AnswerValue | undefined}
                          onChange={(v: any) =>
                            setAnswer(linkId, v, { autoScroll: true })
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="mt-8 flex items-center gap-3">
            {error && <span className="text-rose-600 text-sm">{error}</span>}
            <Button
              onClick={handleSaveAll}
              disabled={
                saving || (data ? data.session.state !== "IN_PROGRESS" : true)
              }>
              {saving ? "در حال ذخیره…" : "ذخیره پاسخ‌ها"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
