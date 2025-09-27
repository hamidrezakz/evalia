"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useUserDataContext } from "@/users/context";
import { useUserSessions } from "@/assessment/api/templates-hooks";
import type { ResponsePerspective } from "@/assessment/types/templates.types";
import type {
  ListUserSessionsQuery,
  UserSessionListItem,
} from "@/assessment/api/sessions.api";

type Ctx = {
  userId: number | null;
  sessions: UserSessionListItem[];
  loading: boolean;
  error: string | null;
  activeSessionId: number | null;
  setActiveSessionId: (id: number | null) => void;
  activePerspective: ResponsePerspective | null;
  setActivePerspective: (p: ResponsePerspective | null) => void;
  activeSession: UserSessionListItem | null;
  availablePerspectives: ResponsePerspective[];
  refresh: () => void;
};

const AssessmentUserSessionsContext = createContext<Ctx | undefined>(undefined);

function lsKey(userId: number | null) {
  return userId ? `assessment.active.${userId}` : `assessment.active`;
}

function loadActive(userId: number | null): {
  sessionId: number | null;
  perspective: ResponsePerspective | null;
} {
  if (typeof window === "undefined")
    return { sessionId: null, perspective: null };
  try {
    const raw = localStorage.getItem(lsKey(userId));
    if (!raw) return { sessionId: null, perspective: null };
    const parsed = JSON.parse(raw);
    const sid = typeof parsed?.sessionId === "number" ? parsed.sessionId : null;
    const p =
      typeof parsed?.perspective === "string" ? parsed.perspective : null;
    return { sessionId: sid, perspective: p } as any;
  } catch {
    return { sessionId: null, perspective: null };
  }
}

function saveActive(
  userId: number | null,
  v: { sessionId: number | null; perspective: ResponsePerspective | null }
) {
  if (typeof window === "undefined") return;
  try {
    if (!v.sessionId || !v.perspective) {
      localStorage.removeItem(lsKey(userId));
    } else {
      localStorage.setItem(lsKey(userId), JSON.stringify(v));
    }
  } catch {
    // ignore
  }
}

export function AssessmentUserSessionsProvider({
  children,
  query,
}: {
  children: React.ReactNode;
  query?: Partial<ListUserSessionsQuery>;
}) {
  const { userId } = useUserDataContext();
  const [refreshTick, setRefreshTick] = useState(0);
  const { data, isLoading, error, refetch } = useUserSessions(userId, query);
  const sessions: UserSessionListItem[] = useMemo(() => {
    const anyData: any = data as any;
    // Accept either { data: UserSessionListItem[] } or raw array
    if (Array.isArray(anyData)) return anyData as UserSessionListItem[];
    if (Array.isArray(anyData?.data))
      return anyData.data as UserSessionListItem[];
    return [];
  }, [data]);

  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [activePerspective, setActivePerspective] =
    useState<ResponsePerspective | null>(null);

  // Initialize from localStorage on boot and whenever userId changes
  useEffect(() => {
    const init = loadActive(userId);
    setActiveSessionId(init.sessionId);
    setActivePerspective(init.perspective);
  }, [userId]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  const availablePerspectives = useMemo<ResponsePerspective[]>(() => {
    return (activeSession?.perspectives as ResponsePerspective[]) || [];
  }, [activeSession]);

  // Ensure selected session/perspective are valid when sessions list changes
  useEffect(() => {
    if (!sessions.length) {
      setActiveSessionId(null);
      setActivePerspective(null);
      return;
    }
    // If no active session or not found, pick the first session
    const sid =
      activeSessionId && sessions.some((s) => s.id === activeSessionId)
        ? activeSessionId
        : sessions[0].id;
    // Validate perspective for selected session
    const sess = sessions.find((s) => s.id === sid)!;
    const perspectives = (sess.perspectives as ResponsePerspective[]) || [];
    const p =
      activePerspective && perspectives.includes(activePerspective)
        ? activePerspective
        : perspectives[0] || null;
    if (sid !== activeSessionId) setActiveSessionId(sid);
    if (p !== activePerspective) setActivePerspective(p);
  }, [sessions]);

  // Persist selection
  useEffect(() => {
    saveActive(userId, {
      sessionId: activeSessionId,
      perspective: activePerspective,
    });
  }, [userId, activeSessionId, activePerspective]);

  const ctx: Ctx = useMemo(
    () => ({
      userId,
      sessions,
      loading: isLoading,
      error: error ? (error as any)?.message || String(error) : null,
      activeSessionId,
      setActiveSessionId,
      activePerspective,
      setActivePerspective,
      activeSession,
      availablePerspectives,
      refresh: () => {
        setRefreshTick((x) => x + 1);
        refetch();
      },
    }),
    [
      userId,
      sessions,
      isLoading,
      error,
      activeSessionId,
      activePerspective,
      activeSession,
      availablePerspectives,
      refetch,
    ]
  );

  return (
    <AssessmentUserSessionsContext.Provider value={ctx}>
      {children}
    </AssessmentUserSessionsContext.Provider>
  );
}

export function useAssessmentUserSessions() {
  const ctx = useContext(AssessmentUserSessionsContext);
  if (!ctx)
    throw new Error(
      "useAssessmentUserSessions must be used within <AssessmentUserSessionsProvider>"
    );
  return ctx;
}
