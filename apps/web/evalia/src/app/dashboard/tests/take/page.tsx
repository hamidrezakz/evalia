"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useAssessmentUserSessions } from "@/assessment/context/assessment-user-sessions";
import type {
  UserSessionQuestions,
  UpsertResponseBody,
} from "@/assessment/api/sessions.api";
import {
  useUserSessionQuestions,
  useResponses,
  useBulkUpsertResponses,
  useAssignmentsDetailed,
} from "@/assessment/api/templates-hooks";
import { ResponsePerspectiveEnum, SessionStateEnum } from "@/lib/enums";
import { Badge } from "@/components/ui/badge";
import { cn, formatIranPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel";
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
import { TakeHeader } from "@/app/dashboard/tests/take/components/TakeHeader";
import { RestrictedSubjectSelector } from "@/app/dashboard/tests/take/components/RestrictedSubjectSelector";

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
  const sp = useSearchParams();
  const previewMode = (sp.get("mode") || "").toLowerCase() === "preview";
  const spSessionId = sp.get("sessionId");
  const spUserId = sp.get("userId");
  const spPerspective = sp.get("perspective");
  const spSubjectUserId = sp.get("subjectUserId");

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
  const [subjectUserId, setSubjectUserId] = React.useState<number | null>(null);

  // Effective parameters (preview vs interactive mode)
  const effSessionId = previewMode
    ? spSessionId
      ? Number(spSessionId)
      : null
    : activeSessionId ?? null;
  const effUserId = previewMode
    ? spUserId
      ? Number(spUserId)
      : null
    : userId ?? null;
  const effPerspective = previewMode
    ? spPerspective
      ? String(spPerspective)
      : null
    : activePerspective ?? null;
  const effSubjectUserId = previewMode
    ? spSubjectUserId
      ? Number(spSubjectUserId)
      : null
    : subjectUserId;

  const needsSubject = effPerspective && effPerspective !== "SELF";
  const canLoad =
    effUserId != null &&
    effSessionId != null &&
    !!effPerspective &&
    (!needsSubject || !!effSubjectUserId);

  const readOnly = previewMode || activeSession?.state !== "IN_PROGRESS";

  // Fetch respondent and subject details for prettier preview header
  const respondentQ = useUser(effUserId);
  const subjectQ = useUser(
    needsSubject ? (effSubjectUserId as number | null) : null
  );

  // Standardized avatar srcs for preview header
  const respondentRawAvatar =
    ((respondentQ.data || {}) as BasicUser).avatarUrl ||
    ((respondentQ.data || {}) as BasicUser).avatar;
  const { src: respondentAvatarSrc } = useAvatarImage(respondentRawAvatar);
  const subjectRawAvatar =
    ((subjectQ.data || {}) as BasicUser).avatarUrl ||
    ((subjectQ.data || {}) as BasicUser).avatar;
  const { src: subjectAvatarSrc } = useAvatarImage(subjectRawAvatar);

  // Auto-pick a default perspective if not selected yet
  // Auto pick perspective (first) if none selected (non-preview)
  React.useEffect(() => {
    if (previewMode) return;
    if (!activePerspective && (availablePerspectives?.length || 0) > 0) {
      setActivePerspective(availablePerspectives![0] as any);
    }
  }, [
    previewMode,
    activePerspective,
    availablePerspectives,
    setActivePerspective,
  ]);

  // Load assignments to help auto-pick a subject when a unique one exists
  const assignmentsDetailed = useAssignmentsDetailed(
    previewMode ? null : activeSessionId ?? null
  );
  // Derive allowed subject user IDs based on assignments for the active respondent & perspective
  const allowedSubjectIds = React.useMemo(() => {
    if (!assignmentsDetailed.data || !activePerspective || !userId)
      return [] as number[];
    const list = assignmentsDetailed.data as any[];
    const mine = list.filter(
      (a) =>
        (a.respondentUserId ?? a.userId) === userId &&
        a.perspective === activePerspective
    );
    const subjIds = mine
      .map((a) => a.subjectUserId)
      .filter((v) => typeof v === "number" && v > 0) as number[];
    return Array.from(new Set(subjIds));
  }, [assignmentsDetailed.data, activePerspective, userId]);

  // Ensure currently selected subject remains valid
  React.useEffect(() => {
    if (subjectUserId && !allowedSubjectIds.includes(subjectUserId)) {
      setSubjectUserId(null);
    }
  }, [allowedSubjectIds, subjectUserId]);
  // Auto pick subject if required perspective and exactly one candidate OR none chosen
  React.useEffect(() => {
    if (previewMode) return;
    if (!activeSessionId || !activePerspective || activePerspective === "SELF")
      return;
    const list = (assignmentsDetailed.data || []) as any[];
    if (!list.length) return;
    const mine = list.filter(
      (a) =>
        (a.respondentUserId ?? a.userId) === userId &&
        a.perspective === activePerspective
    );
    const subjectIds = mine
      .map((a) => a.subjectUserId)
      .filter((v) => v != null) as number[];
    if (!subjectIds.length) return;
    // Prefer previously selected if still valid
    if (subjectUserId && subjectIds.includes(subjectUserId)) return;
    // Else choose first deterministic (sorted) for stability
    const pick = [...new Set(subjectIds)].sort((a, b) => a - b)[0];
    if (pick && pick !== subjectUserId) setSubjectUserId(pick);
  }, [
    previewMode,
    activeSessionId,
    activePerspective,
    subjectUserId,
    assignmentsDetailed.data,
    userId,
  ]);

  // Clear subject when perspective becomes SELF
  React.useEffect(() => {
    if (previewMode) return;
    if (activePerspective === "SELF") setSubjectUserId(null);
  }, [previewMode, activePerspective]);

  // Data via React Query hooks
  const uq = useUserSessionQuestions(
    canLoad ? (effSessionId as number) : null,
    canLoad ? (effUserId as number) : null,
    canLoad ? (effPerspective as string) : null,
    effPerspective && effPerspective !== "SELF"
      ? effSubjectUserId ?? undefined
      : undefined
  );
  const hasEmbedded = !!(uq.data as any)?.responses?.length;
  const respQ = useResponses(
    uq.data && !hasEmbedded
      ? {
          sessionId: uq.data.session.id,
          assignmentId: uq.data.assignment.id,
          userId: effUserId!,
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
      // Center the upcoming question in the viewport for better focus
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }

  function scrollQuestionIntoCenter(linkId: number) {
    const el = questionRefs.current[linkId];
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }

  function setAnswer(
    linkId: number,
    v: AnswerMap[number],
    opts?: { autoScroll?: boolean }
  ) {
    setAnswers((prev) => ({ ...prev, [linkId]: v }));
    if (opts?.autoScroll) autoScrollToNext(linkId);
    else scrollQuestionIntoCenter(linkId);
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
              disabled={assignmentsDetailed.isLoading}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Floating progress */}
      <div className="fixed left-2 sm:left-3 bottom-2 z-40 pointer-events-none">
        <ProgressCircle value={answeredCount} total={flatQuestions.length} />
      </div>

      {/* Enhanced header card */}
      <Panel className="shadow-sm w-full overflow-hidden">
        <PanelHeader className="relative gap-4 flex flex-col xl:flex-row xl:items-start [.border-b]:border-border/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
            {/* Left cluster (title & meta) */}
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-border/60 p-1.5">
                  <Target className="size-4 text-primary" />
                </div>
                <h1 className="font-semibold text-base sm:text-lg tracking-tight truncate max-w-[60vw]">
                  {uq.data?.session.name ?? activeSession?.name ?? "آزمون"}
                </h1>
                {previewMode && (
                  <Badge
                    variant="outline"
                    className="h-5 px-2 text-[11px] rounded-full">
                    پیش‌نمایش
                  </Badge>
                )}
                {uq.data?.session?.state && (
                  <SessionStateBadge
                    state={uq.data.session.state as any}
                    size="xs"
                    tone="soft"
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                {activeSession?.startAt && (
                  <span className="flex items-center gap-1">
                    <span className="opacity-70">شروع:</span>
                    <time suppressHydrationWarning>
                      {new Date(activeSession.startAt as any).toLocaleString(
                        "fa-IR"
                      )}
                    </time>
                  </span>
                )}
                {activeSession?.endAt && (
                  <span className="flex items-center gap-1">
                    <span className="opacity-70">پایان:</span>
                    <time suppressHydrationWarning>
                      {new Date(activeSession.endAt as any).toLocaleString(
                        "fa-IR"
                      )}
                    </time>
                  </span>
                )}
                {activePerspective && (
                  <span className="flex items-center gap-1">
                    <span className="opacity-70">پرسپکتیو فعلی:</span>
                    <span className="font-medium">
                      {ResponsePerspectiveEnum.t(activePerspective as any)}
                    </span>
                  </span>
                )}
                {activePerspective &&
                  activePerspective !== "SELF" &&
                  subjectUserId && (
                    <span className="flex items-center gap-1">
                      <span className="opacity-70">سوژه:</span>
                      <span className="font-medium">
                        {subjectQ.data?.fullName ||
                          subjectQ.data?.email ||
                          `کاربر #${subjectUserId}`}
                      </span>
                    </span>
                  )}
              </div>
            </div>

            {/* Right cluster: actions & choosers */}
            {!previewMode && (
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end w-full sm:w-auto">
                <TakeHeader
                  perspectives={availablePerspectives}
                  activePerspective={activePerspective as any}
                  setActivePerspective={(p) => setActivePerspective(p as any)}
                  allowedSubjectIds={allowedSubjectIds.map(String)}
                  activeSubjectId={subjectUserId ? String(subjectUserId) : null}
                  setActiveSubjectId={(id) =>
                    setSubjectUserId(id ? Number(id) : null)
                  }
                  loadingSubjects={assignmentsDetailed.isLoading}
                />
              </div>
            )}
          </div>
        </PanelHeader>
        <PanelContent className="pt-3 mb-3 w-full overflow-visible">
          <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Participant card */}
            {previewMode ? (
              <div className="w-full rounded-xl border border-border/60 bg-muted/20 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Avatar className="size-8">
                  <AvatarImage
                    src={respondentAvatarSrc || undefined}
                    alt={String(
                      respondentQ.data?.fullName ||
                        respondentQ.data?.email ||
                        `#${effUserId}`
                    )}
                  />
                  <AvatarFallback className="text-[11px]">
                    {String(
                      respondentQ.data?.fullName ||
                        respondentQ.data?.email ||
                        "?"
                    )
                      .split(" ")
                      .map((w) => w[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 w-full">
                  <Label className="text-[10px] text-muted-foreground">
                    شرکت‌کننده
                  </Label>
                  <div className="text-sm font-medium truncate">
                    {respondentQ.data?.fullName ||
                      respondentQ.data?.email ||
                      `کاربر #${effUserId}`}
                  </div>
                  {(respondentQ.data?.email || respondentQ.data?.phone) && (
                    <div className="text-[11px] text-muted-foreground truncate">
                      {[
                        respondentQ.data?.email || "",
                        respondentQ.data?.phone
                          ? formatIranPhone(String(respondentQ.data?.phone))
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </div>
                  )}
                  {effPerspective && (
                    <div className="mt-1 inline-flex items-center gap-1">
                      <Label className="text-[10px] text-muted-foreground">
                        پرسپکتیو
                      </Label>
                      <Badge
                        variant="outline"
                        className="text-[10px] rounded-full">
                        {ResponsePerspectiveEnum.t(effPerspective as any)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ) : user?.name ? (
              <div className="w-full rounded-xl border border-border/60 bg-muted/20 p-3 flex items-center gap-3">
                <div className="min-w-0">
                  <Label className="text-[10px] text-muted-foreground">
                    شرکت‌کننده
                  </Label>
                  <div className="text-sm font-medium truncate">
                    {user.name}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Perspective card (preview only) */}
            {false}

            {/* Subject card (if applicable) */}
            {previewMode && needsSubject && effSubjectUserId ? (
              <div className="w-full rounded-xl border border-border/60 bg-muted/20 p-3 flex items-center gap-3">
                <Avatar className="size-7">
                  <AvatarImage
                    src={subjectAvatarSrc || undefined}
                    alt={String(
                      subjectQ.data?.fullName ||
                        subjectQ.data?.email ||
                        `#${effSubjectUserId}`
                    )}
                  />
                  <AvatarFallback className="text-[10px]">
                    {String(
                      subjectQ.data?.fullName || subjectQ.data?.email || "?"
                    )
                      .split(" ")
                      .map((w) => w[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <Label className="text-[10px] text-muted-foreground">
                    موضوع ارزیابی
                  </Label>
                  <div className="text-sm font-medium truncate">
                    {subjectQ.data?.fullName ||
                      subjectQ.data?.email ||
                      `کاربر #${effSubjectUserId}`}
                  </div>
                  {(subjectQ.data?.email || subjectQ.data?.phone) && (
                    <div className="text-[11px] text-muted-foreground truncate">
                      {[
                        subjectQ.data?.email || "",
                        subjectQ.data?.phone
                          ? formatIranPhone(String(subjectQ.data?.phone))
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </PanelContent>
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
                        className="scroll-mt-[-170px]">
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

          {!readOnly && (
            <div className="mt-8 flex items-center gap-3">
              {error && <span className="text-rose-600 text-sm">{error}</span>}
              <Button
                onClick={handleSaveAll}
                isLoading={saving}
                icon={<Save className="size-4" />}
                disabled={
                  saving || (data ? data.session.state !== "IN_PROGRESS" : true)
                }>
                {saving ? "در حال ذخیره…" : "ذخیره پاسخ‌ها"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// (SubjectSelector inlined previously has been replaced by modular RestrictedSubjectSelector)
