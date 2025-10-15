import { useSearchParams } from "next/navigation";
import { useAssessmentUserSessions } from "@/assessment/context/assessment-user-sessions";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  useUserSessionQuestions,
  useResponses,
  useBulkUpsertResponses,
  useUserPerspectivesDetailed,
} from "@/assessment/api/sessions-hooks";
import { useOrgState } from "@/organizations/organization/context";
import type {
  UserSessionQuestions,
  UpsertResponseBody,
} from "@/assessment/api/sessions.api";
import type { AnswerMap } from "../types";
import { useUser } from "@/users/api/users-hooks";

export interface UseTakeAssessmentResult {
  previewMode: boolean;
  activeSessionId: number | null;
  effSessionId: number | null;
  effUserId: number | null;
  effPerspective: string | null;
  effSubjectUserId: number | null;
  subjectUserId: number | null;
  setSubjectUserId: (id: number | null) => void;
  activePerspective: string | null;
  setActivePerspective: (p: string) => void;
  availablePerspectives: string[] | null | undefined;
  activeSession: any;
  readOnly: boolean;
  data: UserSessionQuestions | null;
  answers: AnswerMap;
  serverAnswers: AnswerMap;
  // Expose question refs so the page can attach DOM nodes for auto-scrolling
  questionRefs: React.RefObject<Record<number, HTMLDivElement | null>>;
  setAnswer: (
    linkId: number,
    v: AnswerMap[number],
    opts?: { autoScroll?: boolean }
  ) => void;
  answeredCount: number;
  flatQuestions: any[];
  qIndexMap: Record<number, number>;
  error: string | null;
  saving: boolean;
  handleSaveAll: () => Promise<void>;
  canLoad: boolean;
  needsSubject: boolean;
  respondentQ: ReturnType<typeof useUser>;
  subjectQ: ReturnType<typeof useUser>;
  allowedSubjectIds: number[];
  // Loading/error states for consumers
  uqLoading: boolean;
  uqError: unknown;
  perspDetailedLoading: boolean;
  // UI helpers
  activeLinkId: number | null;
}

export function useTakeAssessment(): UseTakeAssessmentResult {
  const sp = useSearchParams();
  const previewMode = (sp.get("mode") || "").toLowerCase() === "preview";
  const spSessionId = sp.get("sessionId");
  const spUserId = sp.get("userId");
  const spPerspective = sp.get("perspective");
  const spSubjectUserId = sp.get("subjectUserId");

  const {
    userId,
    activeSessionId,
    activePerspective,
    availablePerspectives,
    setActivePerspective,
    activeSession,
  } = useAssessmentUserSessions();
  const orgCtx = useOrgState();
  const activeOrgId =
    orgCtx.activeOrganizationId ||
    (activeSession as any)?.organizationId ||
    null;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserSessionQuestions | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [serverAnswers, setServerAnswers] = useState<AnswerMap>({});
  const [subjectUserId, setSubjectUserId] = useState<number | null>(null);
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

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

  const respondentQ = useUser(effUserId);
  const subjectQ = useUser(
    needsSubject ? (effSubjectUserId as number | null) : null
  );

  useEffect(() => {
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

  const perspDetailed = useUserPerspectivesDetailed(
    activeOrgId,
    previewMode ? null : activeSessionId ?? null,
    previewMode ? null : userId ?? null
  );
  const perspDetailedLoading = !!perspDetailed.isLoading;
  const allowedSubjectIds = useMemo(() => {
    if (!perspDetailed.data || !activePerspective) return [] as number[];
    const sbp = (perspDetailed.data as any).subjectsByPerspective || {};
    const arr = Array.isArray(sbp[activePerspective])
      ? (sbp[activePerspective] as number[])
      : [];
    return Array.from(
      new Set(arr.filter((n) => typeof n === "number" && n > 0))
    );
  }, [perspDetailed.data, activePerspective]);

  useEffect(() => {
    if (subjectUserId && !allowedSubjectIds.includes(subjectUserId)) {
      setSubjectUserId(null);
    }
  }, [allowedSubjectIds, subjectUserId]);

  useEffect(() => {
    if (previewMode) return;
    if (!activeSessionId || !activePerspective || activePerspective === "SELF")
      return;
    const sbp = (perspDetailed.data as any)?.subjectsByPerspective || {};
    const subjectIds: number[] = Array.isArray(sbp[activePerspective])
      ? sbp[activePerspective]
      : [];
    if (!subjectIds.length) return;
    if (subjectUserId && subjectIds.includes(subjectUserId)) return;
    const pick = [...new Set(subjectIds)].sort((a, b) => a - b)[0];
    if (pick && pick !== subjectUserId) setSubjectUserId(pick);
  }, [
    previewMode,
    activeSessionId,
    activePerspective,
    subjectUserId,
    perspDetailed.data,
  ]);

  useEffect(() => {
    if (previewMode) return;
    if (activePerspective === "SELF") setSubjectUserId(null);
  }, [previewMode, activePerspective]);

  const uq = useUserSessionQuestions(
    activeOrgId,
    canLoad ? (effSessionId as number) : null,
    canLoad ? (effUserId as number) : null,
    canLoad ? (effPerspective as string) : null,
    effPerspective && effPerspective !== "SELF"
      ? effSubjectUserId ?? undefined
      : undefined
  );
  const uqLoading = !!uq.isLoading;
  const uqError = uq.error as unknown;
  const hasEmbedded = !!(uq.data as any)?.responses?.length;
  const respQ = useResponses(
    activeOrgId,
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
  const bulk = useBulkUpsertResponses(activeOrgId);

  const buildTypeMap = useCallback((res: UserSessionQuestions | null) => {
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

  const parseSrv = useCallback(
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

  useEffect(() => {
    if (!uq.data) return;
    const res = uq.data as UserSessionQuestions;
    setData(res);
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

  useEffect(() => {
    const res = (uq.data as UserSessionQuestions) || null;
    if (!res) return;
    const embedded = (res as any).responses as any[] | undefined;
    if (embedded && embedded.length) return;
    if (respQ.data?.data?.length) {
      const typeMap = buildTypeMap(res);
      const srv = parseSrv(respQ.data.data as any[], typeMap);
      setServerAnswers(srv);
      setAnswers(srv);
    }
  }, [respQ.data, uq.data, buildTypeMap, parseSrv]);

  const flatQuestions = useMemo(() => {
    const items: any[] = [];
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
    return items;
  }, [data]);

  const qIndexMap = useMemo(() => {
    const m: Record<number, number> = {};
    flatQuestions.forEach((q: any, i: number) => (m[q.linkId] = i + 1));
    return m;
  }, [flatQuestions]);

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter(Boolean).length;
  }, [answers]);

  function autoScrollToNext(currentLinkId: number) {
    const idx = flatQuestions.findIndex((q: any) => q.linkId === currentLinkId);
    if (idx == null || idx < 0) return;
    const next = flatQuestions[idx + 1];
    if (!next) return;
    const el = questionRefs.current[next.linkId];
    if (el && typeof el.scrollIntoView === "function") {
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

  const setAnswer = useCallback(
    (linkId: number, v: AnswerMap[number], opts?: { autoScroll?: boolean }) => {
      setAnswers((prev) => ({ ...prev, [linkId]: v }));
      if (opts?.autoScroll) {
        // pre-select next as active to keep ring in sync with programmatic scroll
        const idx = flatQuestions.findIndex((q: any) => q.linkId === linkId);
        const next = idx >= 0 ? (flatQuestions as any[])[idx + 1] : null;
        if (next?.linkId) setActiveLinkId(next.linkId);
        autoScrollToNext(linkId);
      } else {
        setActiveLinkId(linkId);
        scrollQuestionIntoCenter(linkId);
      }
    },
    [flatQuestions]
  );

  // Track active question based on scroll position (closest to viewport center)
  const [activeLinkId, setActiveLinkId] = useState<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      let bestId: number | null = null;
      let bestTop = Infinity; // minimal positive top (primary)
      let fbId: number | null = null;
      let fbTop = -Infinity; // largest negative top (fallback)
      const offset = 60; // top offset to align with perceived active area
      for (const q of flatQuestions as any[]) {
        const el = questionRefs.current[q.linkId];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // Only consider elements at least partially visible
        if (rect.bottom <= offset || rect.top >= window.innerHeight) continue;
        // Primary: first element whose top is at/under the top threshold
        if (rect.top >= offset) {
          if (rect.top < bestTop) {
            bestTop = rect.top;
            bestId = q.linkId;
          }
        } else {
          // Fallback: closest element above the threshold (largest negative top)
          if (rect.top > fbTop) {
            fbTop = rect.top;
            fbId = q.linkId;
          }
        }
      }
      const chosen = bestId != null ? bestId : fbId;
      if (chosen != null) setActiveLinkId(chosen);
    };
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true } as any);
    // initial compute
    onScroll();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onScroll as any);
    };
  }, [flatQuestions]);

  const handleSaveAll = useCallback(async () => {
    if (!data) return;
    if (data.session.state !== "IN_PROGRESS") {
      setError("وضعیت جلسه اجازه ذخیره نمی دهد.");
      return;
    }
    const sessionId = data.session.id;
    const assignmentId = data.assignment.id;
    const items: UpsertResponseBody[] = [];
    for (const q of flatQuestions) {
      const a = (answers as any)[q.linkId];
      if (!a) continue;
      const base = {
        assignmentId,
        sessionId,
        templateQuestionId: q.linkId,
      } as Pick<
        UpsertResponseBody,
        "assignmentId" | "sessionId" | "templateQuestionId"
      >;
      if (a.kind === "TEXT") items.push({ ...base, textValue: a.text });
      else if (a.kind === "BOOLEAN")
        items.push({ ...base, optionValue: a.value ? "true" : "false" });
      else if (a.kind === "SINGLE_CHOICE")
        items.push({ ...base, optionValue: a.value });
      else if (a.kind === "MULTI_CHOICE")
        items.push({ ...base, optionValues: a.values });
      else if (a.kind === "SCALE") items.push({ ...base, scaleValue: a.value });
    }
    if (!items.length) return;
    setSaving(true);
    setError(null);
    try {
      await bulk.mutateAsync({ items } as any);
      setServerAnswers((prev: AnswerMap) => {
        const next = { ...prev } as AnswerMap;
        for (const it of items) {
          const linkId = it.templateQuestionId;
          if ("textValue" in it && it.textValue != null)
            next[linkId] = { kind: "TEXT", text: it.textValue } as any;
          else if ("scaleValue" in it && it.scaleValue != null)
            next[linkId] = {
              kind: "SCALE",
              value: Number((it as any).scaleValue),
            } as any;
          else if (Array.isArray((it as any).optionValues))
            next[linkId] = {
              kind: "MULTI_CHOICE",
              values: (it as any).optionValues,
            } as any;
          else if ("optionValue" in it && (it as any).optionValue != null) {
            const curr = (answers as any)[linkId];
            if (curr?.kind === "BOOLEAN")
              next[linkId] = {
                kind: "BOOLEAN",
                value: (it as any).optionValue === "true",
              } as any;
            else
              next[linkId] = {
                kind: "SINGLE_CHOICE",
                value: (it as any).optionValue,
              } as any;
          }
        }
        return next;
      });
    } catch (e) {
      setError((e as any)?.message || String(e));
    } finally {
      setSaving(false);
    }
  }, [data, flatQuestions, answers, bulk]);

  return {
    previewMode,
    activeSessionId,
    effSessionId,
    effUserId,
    effPerspective,
    effSubjectUserId,
    subjectUserId,
    setSubjectUserId,
    activePerspective,
    setActivePerspective,
    availablePerspectives,
    activeSession,
    readOnly,
    data,
    answers,
    serverAnswers,
    questionRefs,
    setAnswer,
    answeredCount,
    flatQuestions,
    qIndexMap,
    error,
    saving,
    handleSaveAll,
    canLoad,
    needsSubject: !!needsSubject,
    respondentQ,
    subjectQ,
    allowedSubjectIds,
    uqLoading,
    uqError,
    perspDetailedLoading,
    activeLinkId,
  };
}
