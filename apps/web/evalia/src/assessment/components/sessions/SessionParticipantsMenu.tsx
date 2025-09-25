"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatIranPhone, cn } from "@/lib/utils";
import { ResponsePerspectiveEnum } from "@/lib/enums";
import {
  useAssignmentsDetailed,
  useDeleteAssignment,
  sessionsKeys,
} from "@/assessment/api/templates-hooks";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2, ChevronDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getUser } from "@/users/api/users.api";
import {
  useAssignmentProgress,
  useUserSessionProgress,
} from "@/assessment/api/templates-hooks";
import { useRouter } from "next/navigation";

/**
 * SessionParticipantsMenu
 * - Hover + click controlled dropdown showing grouped assignments
 * - Groups: SELF, FACILITATOR (with subjects), OTHERS (PEER / MANAGER / SYSTEM)
 * - Avoids showing raw IDs; fetches missing subject user details lazily.
 */
export interface SessionParticipantsMenuProps {
  session: any;
  triggerClassName?: string;
  onQuickAssign: (session: any) => void;
}

export function SessionParticipantsMenu({
  session,
  triggerClassName,
  onQuickAssign,
}: SessionParticipantsMenuProps) {
  const router = useRouter();
  const { data: assignmentsRaw } = useAssignmentsDetailed(session.id);
  const assignments = React.useMemo(
    () => (Array.isArray(assignmentsRaw) ? (assignmentsRaw as any[]) : []),
    [assignmentsRaw]
  );

  // Build grouping
  const selfItems = assignments.filter(
    (a) => (a.perspective as any) === "SELF"
  );
  const facilitatorItems = assignments.filter(
    (a) => (a.perspective as any) === "FACILITATOR"
  );
  const otherItems = assignments.filter(
    (a) => !["SELF", "FACILITATOR"].includes(a.perspective as any)
  );

  // Fetch missing subject details only for facilitator subjects
  const [subjectCache, setSubjectCache] = React.useState<Map<number, any>>(
    () => new Map()
  );
  React.useEffect(() => {
    const needed = new Set<number>();
    for (const a of facilitatorItems) {
      const sid = a.subjectUserId;
      if (!sid) continue;
      if (a.subject && a.subject.id === sid) continue;
      if (subjectCache.has(sid)) continue;
      needed.add(sid);
    }
    if (needed.size === 0) return;
    let alive = true;
    (async () => {
      const fetched = await Promise.all(
        Array.from(needed).map((id) => getUser(id).catch(() => null))
      );
      if (!alive) return;
      setSubjectCache((prev) => {
        const next = new Map(prev);
        Array.from(needed).forEach((id, idx) => next.set(id, fetched[idx]));
        return next;
      });
    })();
    return () => {
      alive = false;
    };
  }, [facilitatorItems, subjectCache]);

  // Group facilitators -> subjects summary
  interface FacGroup {
    respondentUserId: number;
    respondentName: string;
    respondentPhone?: string | null;
    items: any[];
    subjects: {
      id: number;
      name: string;
      phone?: string | null;
      count: number;
    }[];
  }
  const facilitatorGroups: FacGroup[] = React.useMemo(() => {
    const map = new Map<
      number,
      { respondentName: string; respondentPhone?: string | null; items: any[] }
    >();
    for (const a of facilitatorItems) {
      const rid = (a.respondentUserId ?? a.userId ?? 0) as number;
      const rName =
        a.respondent?.fullName ||
        a.respondent?.name ||
        a.respondent?.email ||
        a.user?.fullName ||
        a.user?.name ||
        a.user?.email ||
        `کاربر`;
      const rPhone = a.respondent?.phone || a.user?.phone || null;
      if (!map.has(rid))
        map.set(rid, {
          respondentName: rName,
          respondentPhone: rPhone,
          items: [],
        });
      map.get(rid)!.items.push(a);
    }
    const groups: FacGroup[] = [];
    for (const [rid, v] of map.entries()) {
      const subjMap = new Map<
        number,
        { name: string; phone?: string | null; count: number }
      >();
      for (const it of v.items) {
        const sid = Number(it.subjectUserId ?? 0);
        const subjObj = it.subject || subjectCache.get(sid) || null;
        if (sid) {
          const sName =
            subjObj?.fullName || subjObj?.name || subjObj?.email || "—";
          const sPhoneRaw = subjObj?.phone;
          const sPhone = sPhoneRaw ? formatIranPhone(sPhoneRaw) : null;
          if (!subjMap.has(sid))
            subjMap.set(sid, { name: sName, phone: sPhone, count: 0 });
          subjMap.get(sid)!.count++;
        }
      }
      const subjects = Array.from(subjMap.entries()).map(([id, meta]) => ({
        id,
        ...meta,
      }));
      groups.push({
        respondentUserId: rid,
        respondentName: v.respondentName,
        respondentPhone: v.respondentPhone,
        items: v.items,
        subjects,
      });
    }
    return groups;
  }, [facilitatorItems, subjectCache]);

  // Perspective badge component
  function PerspectiveBadge({ p }: { p: string }) {
    return (
      <Badge variant="outline" className="text-[10px] h-4 px-1">
        {ResponsePerspectiveEnum.t(p as any)}
      </Badge>
    );
  }

  const participantsCount = assignments.length;
  const [open, setOpen] = React.useState(false);
  // Hover close delay handling so menu properly closes when pointer leaves both trigger & content
  const closeTimerRef = React.useRef<number | null>(null);

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = React.useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 180); // small delay so moving between trigger & content doesn't instantly close
  }, [clearCloseTimer]);

  React.useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  // Deletion handling
  type PendingDelete =
    | { mode: "single"; id: number }
    | { mode: "multi"; ids: number[] }
    | null;
  const [pendingDelete, setPendingDelete] = React.useState<PendingDelete>(null);
  const delMut = useDeleteAssignment();
  const qc = useQueryClient();

  async function performDelete() {
    if (!pendingDelete) return;
    try {
      if (pendingDelete.mode === "single") {
        await delMut.mutateAsync(pendingDelete.id);
      } else {
        for (const id of pendingDelete.ids) {
          await delMut.mutateAsync(id);
        }
      }
      await qc.invalidateQueries({
        queryKey: sessionsKeys.assignmentsDetailed(session.id),
      });
      await qc.refetchQueries({
        queryKey: sessionsKeys.assignmentsDetailed(session.id),
      });
    } finally {
      setPendingDelete(null);
    }
  }

  // Navigate to preview (re-using take page in read-only mode)
  function goPreview(params: {
    sessionId: number;
    userId: number;
    perspective: string;
    subjectUserId?: number;
  }) {
    const { sessionId, userId, perspective, subjectUserId } = params;
    const qs = new URLSearchParams({
      mode: "preview",
      sessionId: String(sessionId),
      userId: String(userId),
      perspective,
    });
    if (subjectUserId) qs.set("subjectUserId", String(subjectUserId));
    router.push(`/dashboard/tests/take?${qs.toString()}`);
    setOpen(false);
  }

  // Progress chip components
  function statusClasses(status?: string) {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20";
      case "IN_PROGRESS":
        return "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20";
      case "NOT_STARTED":
        return "bg-zinc-500/10 text-zinc-600 ring-1 ring-zinc-500/20";
      case "NO_QUESTIONS":
        return "bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/20";
      case "NOT_ASSIGNED":
        return "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20";
      default:
        return "bg-muted text-muted-foreground ring-1 ring-border/40";
    }
  }
  function statusLabelFa(status?: string) {
    switch (status) {
      case "COMPLETED":
        return "تکمیل";
      case "IN_PROGRESS":
        return "در حال انجام";
      case "NOT_STARTED":
        return "شروع نشده";
      case "NO_QUESTIONS":
        return "بدون سوال";
      case "NOT_ASSIGNED":
        return "بدون اختصاص";
      default:
        return "";
    }
  }
  function ProgressPill({
    percent,
    status,
    title,
  }: {
    percent: number;
    status?: string;
    title?: string;
  }) {
    const pct = `${percent}%`;
    const st = statusLabelFa(status);
    return (
      <span
        title={title}
        className={cn(
          "inline-flex items-center gap-1 h-4 px-1.5 rounded-full text-[10px] font-medium",
          statusClasses(status)
        )}>
        {st && <span className="truncate max-w-[8rem]">{st}</span>}
        <span className="opacity-60">•</span>
        <span className="tabular-nums">{pct}</span>
      </span>
    );
  }
  function ProgressByAssignment({ id }: { id: number }) {
    const { data } = useAssignmentProgress(id);
    if (!data) return null;
    return (
      <ProgressPill
        percent={data.percent ?? 0}
        status={data.status}
        title={
          data.status === "COMPLETED"
            ? "تکمیل"
            : data.status === "IN_PROGRESS"
            ? "در حال انجام"
            : data.status === "NOT_STARTED"
            ? "شروع نشده"
            : data.status === "NO_QUESTIONS"
            ? "بدون سوال"
            : undefined
        }
      />
    );
  }
  function ProgressByUserSession({
    sessionId,
    userId,
    perspective,
    subjectUserId,
  }: {
    sessionId: number;
    userId: number;
    perspective?: string;
    subjectUserId?: number;
  }) {
    const { data } = useUserSessionProgress(sessionId, userId, {
      perspective,
      subjectUserId,
    });
    if (!data) return null;
    return (
      <ProgressPill
        percent={data.percent ?? 0}
        status={data.status}
        title={
          data.status === "COMPLETED"
            ? "تکمیل"
            : data.status === "IN_PROGRESS"
            ? "در حال انجام"
            : data.status === "NOT_STARTED"
            ? "شروع نشده"
            : data.status === "NO_QUESTIONS"
            ? "بدون سوال"
            : undefined
        }
      />
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-5 pl-2 pr-1 gap-1 text-[10px] leading-none flex items-center bg-muted/60 hover:bg-muted/80 border-muted-foreground/20",
            open && "ring-1 ring-primary/30",
            triggerClassName
          )}
          onMouseEnter={() => {
            clearCloseTimer();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              clearCloseTimer();
              setOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
              scheduleClose();
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            clearCloseTimer();
            setOpen((prev) => !prev);
          }}>
          <span>اعضا: {participantsCount}</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 text-muted-foreground/70 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="min-w-80 max-h-[440px] w-fit p-0 text-[11px] mr-2"
        onMouseEnter={clearCloseTimer}
        onMouseLeave={scheduleClose}>
        <DropdownMenuLabel className="flex items-center justify-between text-[12px] font-semibold mt-0.5">
          <span>اختصاص‌ها</span>
          <Button
            size="sm"
            className="h-6 text-[12px] leading-none px-2"
            onClick={(e) => {
              e.preventDefault();
              onQuickAssign(session);
            }}>
            + جدید
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {assignments.length === 0 && (
          <DropdownMenuItem
            disabled
            className="text-muted-foreground text-[10px]">
            موردی ثبت نشده
          </DropdownMenuItem>
        )}

        {/* SELF */}
        {selfItems.length > 0 && (
          <>
            <DropdownMenuLabel className="text-[10px] opacity-70 mt-1">
              خودارزیابی ({selfItems.length})
            </DropdownMenuLabel>
            {selfItems.map((a) => {
              const name =
                a.respondent?.fullName ||
                a.user?.fullName ||
                a.respondent?.name ||
                a.user?.name ||
                a.respondent?.email ||
                a.user?.email ||
                "کاربر";
              const phoneRaw = a.respondent?.phone || a.user?.phone;
              const phone = phoneRaw ? formatIranPhone(phoneRaw) : null;
              const initials = name
                .split(/\s+/)
                .slice(0, 2)
                .map((p: string) => p[0])
                .join("")
                .toUpperCase();
              return (
                <DropdownMenuItem
                  key={a.id}
                  className="pr-2 py-2 cursor-pointer group relative"
                  onClick={(e) => {
                    e.preventDefault();
                    goPreview({
                      sessionId: session.id,
                      userId: (a.respondentUserId ?? a.userId) as number,
                      perspective: "SELF",
                    });
                  }}>
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span
                        className="truncate text-[10px] font-medium"
                        title={name}>
                        {name}
                      </span>
                      {phone && (
                        <span className="text-[10px] text-muted-foreground ltr:font-mono">
                          {phone}
                        </span>
                      )}
                    </div>
                    {/* progress: self assignment */}
                    <ProgressByAssignment id={a.id} />
                    <PerspectiveBadge p={a.perspective} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPendingDelete({ mode: "single", id: a.id });
                      }}
                      title="حذف">
                      {delMut.isPending &&
                      pendingDelete?.mode === "single" &&
                      pendingDelete.id === a.id ? (
                        <Loader2 className="h-3 w-3 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="h-3 w-3 text-destructive" />
                      )}
                    </Button>
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
          </>
        )}

        {/* FACILITATORS */}
        {facilitatorGroups.length > 0 && (
          <>
            <DropdownMenuLabel className="text-[10px] opacity-70">
              تسهیلگران ({facilitatorGroups.length})
            </DropdownMenuLabel>
            {facilitatorGroups.map((g) => {
              const initials = g.respondentName
                .split(/\s+/)
                .slice(0, 2)
                .map((p: string) => p[0])
                .join("")
                .toUpperCase();
              return (
                <DropdownMenuItem
                  key={g.respondentUserId}
                  className="cursor-pointer py-2 group relative">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="text-[10px] font-medium truncate"
                        title={g.respondentName}>
                        {g.respondentName}
                      </span>
                      {g.respondentPhone && (
                        <span className="text-[10px] text-muted-foreground ltr:font-mono">
                          {formatIranPhone(g.respondentPhone)}
                        </span>
                      )}
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 px-1 ms-auto">
                        {g.items.length}
                      </Badge>
                      <PerspectiveBadge p="FACILITATOR" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                        title="حذف همه"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPendingDelete({
                            mode: "multi",
                            ids: g.items.map((i) => i.id),
                          });
                        }}>
                        {delMut.isPending &&
                        pendingDelete?.mode === "multi" &&
                        pendingDelete.ids.length === g.items.length ? (
                          <Loader2 className="h-3 w-3 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="h-3 w-3 text-destructive" />
                        )}
                      </Button>
                    </div>
                    {g.subjects.length > 0 && (
                      <div className="flex flex-col gap-1 mt-1 mx-6">
                        {g.subjects.map((subj) => {
                          const subInit = subj.name
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((p: string) => p[0])
                            .join("")
                            .toUpperCase();
                          return (
                            <div
                              key={subj.id}
                              className="group/subject relative flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1 text-[10px] cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                goPreview({
                                  sessionId: session.id,
                                  userId: g.respondentUserId,
                                  perspective: "FACILITATOR",
                                  subjectUserId: subj.id,
                                });
                              }}>
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-[9px]">
                                {subInit}
                              </span>
                              <span
                                className="truncate flex-1"
                                title={subj.name}>
                                {subj.name}
                              </span>
                              {/* progress for facilitator answering about subject */}
                              <ProgressByUserSession
                                sessionId={session.id}
                                userId={g.respondentUserId}
                                perspective="FACILITATOR"
                                subjectUserId={subj.id}
                              />
                              {subj.count > 1 && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1">
                                  x{subj.count}
                                </Badge>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPendingDelete({
                                    mode: "multi",
                                    ids: g.items
                                      .filter(
                                        (it) => it.subjectUserId === subj.id
                                      )
                                      .map((it) => it.id),
                                  });
                                }}
                                className="h-5 w-5 rounded-md hover:bg-destructive/10 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/subject:opacity-100 transition"
                                title="حذف سوژه">
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
          </>
        )}

        {/* OTHER perspectives (PEER / MANAGER / SYSTEM) */}
        {otherItems.length > 0 && (
          <>
            <DropdownMenuLabel className="text-[10px] opacity-70">
              سایر ({otherItems.length})
            </DropdownMenuLabel>
            {otherItems.map((a) => {
              const name =
                a.respondent?.fullName ||
                a.user?.fullName ||
                a.respondent?.name ||
                a.user?.name ||
                a.respondent?.email ||
                a.user?.email ||
                "کاربر";
              const initials = name
                .split(/\s+/)
                .slice(0, 2)
                .map((p: string) => p[0])
                .join("")
                .toUpperCase();
              return (
                <DropdownMenuItem
                  key={a.id}
                  className="pr-2 py-2 cursor-pointer group relative"
                  onClick={(e) => {
                    e.preventDefault();
                    goPreview({
                      sessionId: session.id,
                      userId: (a.respondentUserId ?? a.userId) as number,
                      perspective: a.perspective,
                      subjectUserId: a.subjectUserId,
                    });
                  }}>
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="truncate text-[10px] font-medium"
                      title={name}>
                      {name}
                    </span>
                    {/* progress: other perspectives by assignment */}
                    <ProgressByAssignment id={a.id} />
                    <PerspectiveBadge p={a.perspective} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPendingDelete({ mode: "single", id: a.id });
                      }}
                      title="حذف">
                      {delMut.isPending &&
                      pendingDelete?.mode === "single" &&
                      pendingDelete.id === a.id ? (
                        <Loader2 className="h-3 w-3 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="h-3 w-3 text-destructive" />
                      )}
                    </Button>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </>
        )}
        <AlertDialog
          open={!!pendingDelete}
          onOpenChange={(o) => {
            if (!o) setPendingDelete(null);
          }}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>تایید حذف</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingDelete?.mode === "single"
                  ? "آیا از حذف این اختصاص مطمئن هستید؟"
                  : `آیا از حذف ${
                      pendingDelete?.ids.length || 0
                    } اختصاص مطمئن هستید؟`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={delMut.isPending}>
                انصراف
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={delMut.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  performDelete();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {delMut.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> در حال حذف
                  </span>
                ) : (
                  "حذف"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SessionParticipantsMenu;
