"use client";
import React from "react";
// no search param handling here; handled by useTakeAssessment
import { ResponsePerspectiveEnum, SessionStateEnum } from "@/lib/enums";
import { Badge } from "@/components/ui/badge";
import { cn, formatIranPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUserDataContext } from "@/users/context";
import type { AnswerMap, FlatQuestion, AnswerValue } from "./types";
import { QuestionText } from "./components/QuestionText";
import { QuestionBoolean } from "./components/QuestionBoolean";
import { QuestionSingleChoice } from "./components/QuestionSingleChoice";
import { QuestionMultiChoice } from "./components/QuestionMultiChoice";
import { QuestionScale } from "./components/QuestionScale";
import { ProgressCircle } from "./components/ProgressCircle";
import { SessionStateBadge } from "@/components/status-badges/SessionStateBadge";
import { QuestionAnswerStatusBadge } from "@/components/status-badges/QuestionAnswerStatusBadge";
import {
  AlertTriangle,
  Layers,
  Sparkles,
  Bookmark,
  Puzzle,
  ListChecks,
  Save,
  Target,
  MoreHorizontal,
} from "lucide-react";
import { useUser } from "@/users/api/users-hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import { RestrictedSubjectSelector } from "@/app/dashboard/tests/take/components/RestrictedSubjectSelector";
import TakeSkeleton from "@/app/dashboard/tests/take/components/TakeSkeleton";
// Results / analyses
import { AiAssessmentExportButton } from "@/assessment/components/AiAssessmentExportButton"; // (still used inside results panel if needed in future here)
import AssessmentResultsPanel from "./components/AssessmentResultsPanel";
import { useTakeAssessment } from "./hooks/useTakeAssessment";
import { TakeHeaderPanel } from "./components/TakeHeaderPanel";

// Lightweight shared shape for user data we access (duplicated from previous inline interface)
interface BasicUser {
  id: number;
  fullName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
}

export default function TakeAssessmentPage() {
  // Hydration guard to avoid SSR/CSR mismatch (queries / contexts that only resolve client-side)
  const [isHydrated, setIsHydrated] = React.useState(false);
  React.useEffect(() => setIsHydrated(true), []);
  const { user } = useUserDataContext();
  const ta = useTakeAssessment();
  const {
    previewMode,
    activeSessionId,
    activePerspective,
    availablePerspectives,
    setActivePerspective,
    activeSession,
    saving,
    error,
    data,
    answers,
    serverAnswers,
    questionRefs,
    setAnswer,
    answeredCount,
    flatQuestions,
    qIndexMap,
    handleSaveAll,
    canLoad,
    needsSubject,
    respondentQ,
    subjectQ,
    allowedSubjectIds,
    effSessionId,
    effUserId,
    effPerspective,
    effSubjectUserId,
    subjectUserId,
    setSubjectUserId,
    readOnly,
    uqLoading,
    perspDetailedLoading,
    activeLinkId,
  } = ta;

  // Standardized avatar srcs for preview header
  const respondentRawAvatar =
    ((respondentQ.data || {}) as BasicUser).avatarUrl ||
    ((respondentQ.data || {}) as BasicUser).avatar;
  const { src: respondentAvatarSrc } = useAvatarImage(respondentRawAvatar);
  const subjectRawAvatar =
    ((subjectQ.data || {}) as BasicUser).avatarUrl ||
    ((subjectQ.data || {}) as BasicUser).avatar;
  const { src: subjectAvatarSrc } = useAvatarImage(subjectRawAvatar);

  // pendingCount remains computed here (hook returns answers and serverAnswers)

  // Pending (unsaved) answers count
  const pendingCount = React.useMemo(() => {
    let c = 0;
    for (const k of Object.keys(answers)) {
      const linkId = Number(k);
      const curr = answers[linkId];
      const saved = serverAnswers[linkId];
      if (!answersEqual(curr, saved)) c++;
    }
    return c;
  }, [answers, serverAnswers]);

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

  // setAnswer and handleSaveAll come from the hook

  // Unified skeleton condition with hydration stabilization
  const loadingHeader =
    (!previewMode && perspDetailedLoading) ||
    respondentQ.isLoading ||
    (needsSubject && subjectUserId && subjectQ.isLoading);
  const loadingQuestions = uqLoading; // or (canLoad && !uq.data && uq.isFetching)
  const showSkeleton =
    !isHydrated || loadingHeader || (canLoad && loadingQuestions);
  if (showSkeleton) {
    return <TakeSkeleton questions={8} />;
  }

  if (!canLoad) {
    const reason = previewMode
      ? "لینک پیش‌نمایش نامعتبر است."
      : !activeSessionId
      ? "ابتدا از سایدبار یک آزمون را انتخاب کنید."
      : !activePerspective
      ? "در حال انتخاب خودکار پرسپکتیو…"
      : needsSubject && !subjectUserId
      ? "برای این پرسپکتیو، لطفاً شخصِ موضوع ارزیابی را انتخاب کنید."
      : "لطفاً انتخاب‌ها را کامل کنید.";
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-3">ورود به آزمون</h1>
        <p className="text-muted-foreground">{reason}</p>
        {!previewMode && activePerspective && activePerspective !== "SELF" ? (
          <div className="mt-3 max-w-xs">
            <RestrictedSubjectSelector
              allowedSubjectIds={allowedSubjectIds.map(String)}
              value={subjectUserId ? String(subjectUserId) : null}
              onChange={(id) => setSubjectUserId(id ? Number(id) : null)}
              disabled={perspDetailedLoading}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right max-w-2xl" dir="rtl">
      {/* Floating progress */}
      <div className="fixed max-w-2xl left-2 sm:left-5 lg:left-[6%] xl:left-[22%] sm:bottom-2 bottom-[-1.2rem] z-40 pointer-events-none">
        <ProgressCircle value={answeredCount} total={flatQuestions.length} />
      </div>
      {!readOnly && canLoad && (
        <div
          className="hidden sm:flex fixed sm:bottom-4 right-4 z-50"
          dir="rtl">
          <Button
            size="sm"
            icon={<Save className="h-3.5 w-3.5" />}
            isLoading={saving}
            spinnerProps={{ size: 12, speed: 1.1, label: "در حال ذخیره…" }}
            className={cn(
              "h-8 rounded-full px-4 text-xs shadow-md tabular-nums",
              pendingCount > 0 ? "ring-2 ring-primary/30 shadow-primary/30" : ""
            )}
            disabled={
              !data ||
              (data && data.session.state !== "IN_PROGRESS") ||
              pendingCount === 0
            }
            aria-label={
              saving
                ? "در حال ذخیره پاسخ‌ها"
                : `ذخیره پاسخ‌ها - ${answeredCount}/${flatQuestions.length}${
                    pendingCount > 0 ? ` • +${pendingCount}` : ""
                  }`
            }
            onClick={handleSaveAll}
            title={
              data && data.session.state !== "IN_PROGRESS"
                ? "امکان ثبت پاسخ در این وضعیت وجود ندارد"
                : pendingCount === 0
                ? "تغییری برای ذخیره وجود ندارد"
                : "ذخیره پاسخ‌ها"
            }>
            <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
              <span>ذخیره تغییرات</span>
              <span
                aria-hidden
                className="mx-0.5 h-4 w-px bg-primary-foreground/25"
              />
              <span>
                {answeredCount}/{flatQuestions.length}
              </span>
              <span
                aria-hidden
                className="mx-0.5 h-4 w-px bg-primary-foreground/25"
              />
              <span>
                {pendingCount > 0 ? `+${pendingCount} تغییر` : `0 تغییر`}
              </span>
            </span>
          </Button>
        </div>
      )}

      {/* Header card extracted into TakeHeaderPanel */}
      <TakeHeaderPanel
        previewMode={previewMode}
        activeSession={activeSession}
        sessionName={data?.session?.name ?? activeSession?.name ?? "آزمون"}
        sessionState={(data?.session?.state as any) ?? null}
        availablePerspectives={availablePerspectives}
        activePerspective={activePerspective}
        setActivePerspective={setActivePerspective as any}
        allowedSubjectIds={allowedSubjectIds.map(String)}
        subjectUserId={subjectUserId}
        setSubjectUserId={setSubjectUserId}
        loadingSubjects={perspDetailedLoading}
        respondent={respondentQ.data as any}
        subject={subjectQ.data as any}
        effUserId={effUserId}
        effSubjectUserId={effSubjectUserId}
        needsSubject={needsSubject}
      />
      {data && data.session.state !== "IN_PROGRESS" && (
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm dark:text-amber-300 dark:bg-amber-950/30 dark:border-amber-600/60">
          <AlertTriangle className="h-4 w-4" />
          <span>
            این جلسه در وضعیت «{SessionStateEnum.t(data.session.state as any)}»
            است و فعلاً امکان ثبت پاسخ ندارد.
          </span>
        </div>
      )}
      {/* Results (after completion) now shown directly under header panel */}
      <AssessmentResultsPanel
        className="max-w-2xl"
        canLoadAnalyses={Boolean(
          flatQuestions.length &&
            answeredCount === flatQuestions.length &&
            pendingCount === 0 &&
            !!effSessionId &&
            !!effUserId &&
            !!effPerspective
        )}
        sessionId={effSessionId as number | null}
        userId={effUserId as number | null}
        perspective={effPerspective as string | null}
        subjectUserId={
          effPerspective && effPerspective !== "SELF"
            ? (effSubjectUserId as number | null)
            : null
        }
      />

      {uqLoading ? (
        <div className="text-sm text-muted-foreground">
          در حال بارگذاری سوالات…
        </div>
      ) : ta.uqError ? (
        <div className="text-sm text-rose-600">
          {String((ta.uqError as any)?.message || ta.uqError)}
        </div>
      ) : !data ? (
        <div className="text-sm text-muted-foreground">داده‌ای یافت نشد.</div>
      ) : (
        <div className="max-w-2xl">
          {data.sections.map((sec: any, si: number) => {
            const questions: any[] = Array.isArray(sec?.questions)
              ? (sec.questions as any[])
              : [];
            if (!questions.length) return null; // Skip empty sections (no title, no header)
            // Order customized per request:
            // 1st section: Blue (Sky) with Layers icon (more relevant)
            // 2nd section: Red (Rose) with Bookmark icon
            // Others: keep prior scheme
            const icons = [
              Layers,
              Bookmark,
              Puzzle,
              ListChecks,
              Sparkles,
            ] as const;
            const Icon = icons[si % icons.length];
            const gradient = [
              "from-sky-500 to-cyan-500", // 1st: Blue
              "from-rose-500 to-pink-500", // 2nd: Red
              "from-violet-500 to-indigo-500",
              "from-emerald-500 to-lime-500",
              "from-amber-500 to-orange-500",
            ][si % 5];
            const iconColor = [
              "text-sky-500", // 1st: Blue
              "text-rose-500", // 2nd: Red
              "text-violet-500",
              "text-emerald-500",
              "text-amber-500",
            ][si % 5];
            return (
              <section key={sec.id} className="space-y-4">
                {/* Fancy, distinguishable section header with subtle motion */}
                <div className="relative mt-6 rounded-xl border border-border/60 bg-muted/20 pr-3 pl-2 py-2 overflow-hidden group">
                  {/* Accent bar on the right (RTL) with gentle pulse */}
                  <div
                    className={cn(
                      "absolute right-0 top-0 h-full w-1.5 bg-gradient-to-b animate-pulse opacity-80",
                      gradient
                    )}
                  />
                  {/* Title row */}
                  <div className="relative z-10 flex items-center gap-2 pr-3">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-md bg-background/70 border border-border/50 size-6"
                      )}>
                      <Icon className={cn("size-4", iconColor)} />
                    </span>
                    <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                      {sec.title}
                    </h2>
                  </div>
                  {/* Decorative large icon in background for a subtle motion effect */}
                  <Icon
                    className={cn(
                      "absolute -left-6 -bottom-6 size-24 opacity-10 transition-transform duration-300 group-hover:scale-105",
                      iconColor
                    )}
                  />
                </div>
                <div className="space-y-8">
                  {questions.map((q: any) => {
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
                    // For SCALE questions, prefer explicit numeric metadata (minScale/maxScale, etc.)
                    // to build a continuous range. If not present, derive from existing options (values or labels),
                    // otherwise fallback to [1..5]. This ensures cases like 1..16 render correctly even when
                    // optionSet provides only descriptive buckets.
                    let scaleOptions = options;
                    if ((qObj?.type as string) === "SCALE") {
                      const minMetaRaw =
                        (qObj as any)?.minScale ??
                        (qObj as any)?.min ??
                        (qObj as any)?.minValue ??
                        (qObj as any)?.scaleMin ??
                        (qObj as any)?.start ??
                        (qObj as any)?.lower ??
                        (qObj as any)?.lowerBound;
                      const maxMetaRaw =
                        (qObj as any)?.maxScale ??
                        (qObj as any)?.max ??
                        (qObj as any)?.maxValue ??
                        (qObj as any)?.scaleMax ??
                        (qObj as any)?.end ??
                        (qObj as any)?.upper ??
                        (qObj as any)?.upperBound;
                      const minMeta = Number(minMetaRaw);
                      const maxMeta = Number(maxMetaRaw);
                      if (
                        !Number.isNaN(minMeta) &&
                        !Number.isNaN(maxMeta) &&
                        maxMeta >= minMeta
                      ) {
                        const len = Math.min(1000, maxMeta - minMeta + 1);
                        scaleOptions = Array.from({ length: len }, (_, i) => {
                          const n = minMeta + i;
                          return { value: String(n), label: String(n) };
                        });
                      } else if (options.length) {
                        const numericFromValues = options
                          .map((o: any) => Number(o.value))
                          .filter((n: number) => !Number.isNaN(n));
                        const numericFromLabels = options
                          .map((o: any) => Number(o.label))
                          .filter((n: number) => !Number.isNaN(n));
                        const nums = numericFromValues.length
                          ? numericFromValues
                          : numericFromLabels;
                        if (nums.length) {
                          const minOpt = Math.min(...nums);
                          const maxOpt = Math.max(...nums);
                          const len = Math.min(1000, maxOpt - minOpt + 1);
                          scaleOptions = Array.from({ length: len }, (_, i) => {
                            const n = minOpt + i;
                            return { value: String(n), label: String(n) };
                          });
                        } else {
                          // Could not infer numbers from options; show 1..5 as last resort
                          scaleOptions = [1, 2, 3, 4, 5].map((n) => ({
                            value: String(n),
                            label: String(n),
                          }));
                        }
                      } else {
                        // No metadata and no options
                        scaleOptions = [1, 2, 3, 4, 5].map((n) => ({
                          value: String(n),
                          label: String(n),
                        }));
                      }
                    }
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
                        className={cn("scroll-mt-[-170px] rounded-lg p-2")}>
                        <div className="mb-2 relative">
                          {/* Active corner curve indicator (top-right) */}
                          <div
                            className={cn(
                              "pointer-events-none absolute -top-2 -right-2 h-5 w-5 rounded-tr-[14px] border-t-4 border-r-4 transition-opacity",
                              activeLinkId === linkId
                                ? "border-primary/70 opacity-100"
                                : "border-transparent opacity-0"
                            )}
                          />
                          <span className="font-medium text-sm sm:text-base">
                            {qIndexMap[linkId]}. {text}
                          </span>
                          {q.required ? (
                            <span className="text-amber-600 text-xs mr-2">
                              (اجباری)
                            </span>
                          ) : null}
                          <span className="mx-2 text-xs">
                            <QuestionAnswerStatusBadge
                              status={
                                pending
                                  ? "PENDING"
                                  : hasSaved
                                  ? "ANSWERED"
                                  : "UNANSWERED"
                              }
                              size="xs"
                              tone="soft"
                              withIcon
                            />
                          </span>
                        </div>
                        {/* Render by type via components */}
                        {type === "TEXT" && (
                          <QuestionText
                            id={linkId}
                            value={current as AnswerValue | undefined}
                            readOnly={readOnly}
                            onChange={(v: any) =>
                              !readOnly && setAnswer(linkId, v)
                            }
                            onSubmitNext={() =>
                              !readOnly &&
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
                            readOnly={readOnly}
                            onChange={(v: any) =>
                              !readOnly &&
                              setAnswer(linkId, v, { autoScroll: true })
                            }
                          />
                        )}
                        {type === "SINGLE_CHOICE" && (
                          <QuestionSingleChoice
                            name={`q-${linkId}`}
                            options={options}
                            value={current as AnswerValue | undefined}
                            readOnly={readOnly}
                            onChange={(v: any) =>
                              !readOnly &&
                              setAnswer(linkId, v, { autoScroll: true })
                            }
                          />
                        )}
                        {type === "MULTI_CHOICE" && (
                          <QuestionMultiChoice
                            options={options}
                            value={current as AnswerValue | undefined}
                            readOnly={readOnly}
                            onChange={(v: any) =>
                              !readOnly && setAnswer(linkId, v)
                            }
                          />
                        )}
                        {type === "SCALE" && (
                          <QuestionScale
                            name={`q-${linkId}`}
                            options={scaleOptions}
                            value={current as AnswerValue | undefined}
                            readOnly={readOnly}
                            onChange={(v: any) => {
                              if (!readOnly) setAnswer(linkId, v);
                            }}
                            onCommit={(v: any) => {
                              if (!readOnly)
                                setAnswer(linkId, v, { autoScroll: true });
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {/* Mobile inline save panel placed AFTER all questions (end of assessment) */}
          {!readOnly && canLoad && (
            <div className="sm:hidden">
              <Button
                size="sm"
                icon={<Save className="h-3.5 w-3.5" />}
                isLoading={saving}
                spinnerProps={{ size: 12, speed: 1.1, label: "در حال ذخیره…" }}
                className={cn(
                  "fixed bottom-4 right-4 h-9 rounded-full px-4 text-xs shadow-md z-50 tabular-nums",
                  pendingCount > 0
                    ? "ring-2 ring-primary/30 shadow-primary/30"
                    : ""
                )}
                disabled={
                  !data ||
                  (data && data.session.state !== "IN_PROGRESS") ||
                  pendingCount === 0
                }
                onClick={handleSaveAll}
                dir="rtl"
                aria-label={
                  saving
                    ? "در حال ذخیره پاسخ‌ها"
                    : `ذخیره پاسخ‌ها - ${answeredCount}/${
                        flatQuestions.length
                      }${pendingCount > 0 ? ` • +${pendingCount}` : ""}`
                }
                title={
                  data && data.session.state !== "IN_PROGRESS"
                    ? "امکان ثبت پاسخ در این وضعیت وجود ندارد"
                    : pendingCount === 0
                    ? "تغییری برای ذخیره وجود ندارد"
                    : "ذخیره پاسخ‌ها"
                }>
                <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
                  <span>ذخیره تغییرات</span>
                  <span
                    aria-hidden
                    className="mx-0.5 h-4 w-px bg-primary-foreground/25"
                  />
                  <span>
                    {answeredCount}/{flatQuestions.length}
                  </span>
                  <span
                    aria-hidden
                    className="mx-0.5 h-4 w-px bg-primary-foreground/25"
                  />
                  <span>
                    {pendingCount > 0 ? `+${pendingCount} تغییر` : `0 تغییر`}
                  </span>
                </span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Lightweight results section that appears only after all questions are answered & saved.
 * - Renders AI export download button
 * - Renders Glasser radar chart if analysis available (template supports it)
 * Future: Add more analyses/charts here (just append inside the card stack).
 */
// (SubjectSelector inlined previously has been replaced by modular RestrictedSubjectSelector)
