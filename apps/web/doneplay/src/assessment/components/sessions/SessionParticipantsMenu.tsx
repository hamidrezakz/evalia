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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatIranPhone, cn } from "@/lib/utils";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import { ResponsePerspectiveEnum } from "@/lib/enums";
import {
  useAssignmentsDetailed,
  useDeleteAssignment,
  sessionsKeys,
  useAssignmentProgress,
  useUserSessionProgress,
} from "@/assessment/api/sessions-hooks";
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
import { Trash2, Loader2, ChevronDown, Users, PlusCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getUser } from "@/users/api/users.api";
import { AssignmentProgressBadge } from "@/components/status-badges/AssignmentProgressBadge";
import { useRouter } from "next/navigation";
import { useOrgState } from "@/organizations/organization/context";
import { ResponsePerspectiveBadge } from "@/components/status-badges";
import { PhoneBadge } from "@/components/status-badges";
// Removed inline user creation per design feedback

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
  const orgCtx = useOrgState();
  const activeOrgId = orgCtx.activeOrganizationId || null;
  const { data: assignmentsRaw } = useAssignmentsDetailed(
    activeOrgId,
    session.id
  );
  const assignments = React.useMemo(
    () => (Array.isArray(assignmentsRaw) ? (assignmentsRaw as any[]) : []),
    [assignmentsRaw]
  );

  // Local avatar component using the standardized hook
  function UserAvatar({
    url,
    alt,
    fallback,
    className,
    fallbackClassName,
  }: {
    url: string | null | undefined;
    alt: string;
    fallback: string;
    className?: string;
    fallbackClassName?: string;
  }) {
    const { src } = useAvatarImage(url);
    return (
      <Avatar className={className || "h-6 w-6"}>
        {src ? <AvatarImage src={src} alt={alt} /> : null}
        <AvatarFallback className={fallbackClassName || "text-[10px]"}>
          {fallback}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Cache respondent/user details (to get avatarUrl like MembersDropdown)
  const [userCache, setUserCache] = React.useState<Map<number, any>>(
    () => new Map()
  );
  React.useEffect(() => {
    const needed = new Set<number>();
    for (const a of assignments) {
      const uid = Number(a.respondentUserId ?? a.userId ?? 0);
      if (uid > 0 && !userCache.has(uid)) needed.add(uid);
    }
    if (needed.size === 0) return;
    let alive = true;
    (async () => {
      const fetched = await Promise.all(
        Array.from(needed).map((id) => getUser(id).catch(() => null))
      );
      if (!alive) return;
      setUserCache((prev) => {
        const next = new Map(prev);
        Array.from(needed).forEach((id, idx) => next.set(id, fetched[idx]));
        return next;
      });
    })();
    return () => {
      alive = false;
    };
  }, [assignments, userCache]);

  // Build grouping
  const selfItems = assignments.filter(
    (a) => (a.perspective as any) === "SELF"
  );

  // Fetch missing subject details for non-SELF perspectives
  const [subjectCache, setSubjectCache] = React.useState<Map<number, any>>(
    () => new Map()
  );
  React.useEffect(() => {
    const needed = new Set<number>();
    for (const a of assignments) {
      if ((a.perspective as any) === "SELF") continue;
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
  }, [assignments, subjectCache]);

  // Group facilitators -> subjects summary
  interface RespGroup {
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
  function buildGroupsForPerspective(p: string): RespGroup[] {
    const items = assignments.filter((a) => (a.perspective as any) === p);
    const map = new Map<
      number,
      { respondentName: string; respondentPhone?: string | null; items: any[] }
    >();
    for (const a of items) {
      const rid = (a.respondentUserId ?? a.userId ?? 0) as number;
      const rName =
        a.respondent?.fullName ||
        a.user?.fullName ||
        a.respondent?.name ||
        a.user?.name ||
        a.respondent?.email ||
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
    const groups: RespGroup[] = [];
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
  }

  const perspectiveOrder = ["FACILITATOR", "PEER", "MANAGER", "SYSTEM"];
  const groupsByPerspective = React.useMemo(() => {
    const obj: Record<string, RespGroup[]> = {};
    for (const p of perspectiveOrder) {
      obj[p] = buildGroupsForPerspective(p);
    }
    return obj;
  }, [assignments, subjectCache]);
  // Total unique participants (respondents) across all assignments
  const totalParticipants = React.useMemo(() => {
    const set = new Set<number>();
    for (const a of assignments) {
      const uid = Number(a.respondentUserId ?? a.userId ?? 0);
      if (uid > 0) set.add(uid);
    }
    return set.size;
  }, [assignments]);
  // Hover-controlled open state
  const [open, setOpen] = React.useState(false);
  const closeTimerRef = React.useRef<number | null>(null);
  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);
  const scheduleClose = React.useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 180);
  }, [clearCloseTimer]);
  React.useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  // Deletion handling
  type PendingDelete =
    | { mode: "single"; id: number }
    | { mode: "multi"; ids: number[] }
    | null;
  const [pendingDelete, setPendingDelete] = React.useState<PendingDelete>(null);
  const delMut = useDeleteAssignment(activeOrgId);
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

  // Progress badge helpers
  function ProgressByAssignment({ id }: { id: number }) {
    const { data } = useAssignmentProgress(activeOrgId, id);
    if (!data) return null;
    return (
      <AssignmentProgressBadge
        status={(data.status as any) || "NOT_ASSIGNED"}
        percent={data.percent ?? 0}
        tone="soft"
        size="xs"
        showPercent
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
    const { data } = useUserSessionProgress(activeOrgId, sessionId, userId, {
      perspective,
      subjectUserId,
    });
    if (!data) return null;
    return (
      <AssignmentProgressBadge
        status={(data.status as any) || "NOT_ASSIGNED"}
        percent={data.percent ?? 0}
        tone="soft"
        size="xs"
        showPercent
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
          <Users className="h-3 w-3 opacity-80" />
          شرکت‌کنندگان ({totalParticipants})
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onMouseEnter={() => clearCloseTimer()}
        onMouseLeave={scheduleClose}
        className="m-2 sm:w-auto sm:min-w-[520px] max-h-[60vh] sm:max-h-[54vh] 2xl:max-h-[70vh] overflow-y-auto">
        {/* Title */}
        <DropdownMenuLabel className="flex mt-0.5 items-center gap-2 text-[11px] opacity-80">
          <Users className="h-3.5 w-3.5 text-primary" />
          شرکت‌کنندگان جلسه ({totalParticipants})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* New assignment quick action */}
        <DropdownMenuItem
          className="cursor-pointer text-[12px] gap-2"
          onClick={(e) => {
            e.preventDefault();
            onQuickAssign?.(session);
            setOpen(false);
          }}>
          <PlusCircle className="h-3.5 w-3.5 text-primary" />
          افزودن اختصاص جدید
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* SELF */}
        {selfItems.length > 0 && (
          <>
            <DropdownMenuLabel className="text-[10px] opacity-70">
              خود ({selfItems.length})
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
              const uid = Number(a.respondentUserId ?? a.userId ?? 0);
              const userMeta = (uid && userCache.get(uid)) || null;
              const rawAvatar =
                userMeta?.avatarUrl ||
                userMeta?.avatar ||
                a.respondent?.avatarUrl ||
                a.user?.avatarUrl ||
                a.respondent?.avatar ||
                a.user?.avatar ||
                null;
              const initials = name
                .split(/\s+/)
                .slice(0, 2)
                .map((p: string) => p[0])
                .join("")
                .toUpperCase();
              const phoneRaw = a.respondent?.phone || a.user?.phone || null;
              const phone = phoneRaw ? formatIranPhone(phoneRaw) : null;
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
                    });
                  }}>
                  <div className="flex items-center gap-2 w-full">
                    <UserAvatar
                      url={rawAvatar}
                      alt={name}
                      fallback={initials}
                      className="h-6 w-6"
                    />
                    <span
                      className="truncate text-[10px] font-medium"
                      title={name}>
                      {name}
                    </span>
                    {phone && (
                      <span className="hidden sm:inline-flex">
                        <PhoneBadge phone={phone} size="xs" tone="soft" />
                      </span>
                    )}
                    {/* progress: self assignment */}
                    <ProgressByAssignment id={a.id} />
                    <ResponsePerspectiveBadge value={a.perspective as any} />
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

        {/* Non-SELF grouped perspectives */}
        {perspectiveOrder.map((p, idx) => {
          const groups = groupsByPerspective[p] || [];
          if (groups.length === 0) return null;
          return (
            <React.Fragment key={p}>
              <DropdownMenuLabel className="text-[10px] opacity-70">
                {ResponsePerspectiveEnum.t(p as any)} ({groups.length})
              </DropdownMenuLabel>
              {groups.map((g) => {
                const initials = g.respondentName
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((pp: string) => pp[0])
                  .join("")
                  .toUpperCase();
                const uDet = userCache.get(g.respondentUserId) || null;
                const firstItem = g.items?.[0];
                const rawAvatar =
                  uDet?.avatarUrl ||
                  uDet?.avatar ||
                  firstItem?.respondent?.avatarUrl ||
                  firstItem?.respondent?.avatar ||
                  null;
                return (
                  <DropdownMenuItem
                    key={`${p}-${g.respondentUserId}`}
                    className="cursor-pointer py-2 group relative">
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          url={rawAvatar}
                          alt={g.respondentName}
                          fallback={initials}
                          className="h-6 w-6"
                        />
                        <span
                          className="text-[10px] font-medium truncate"
                          title={g.respondentName}>
                          {g.respondentName}
                        </span>
                        {g.respondentPhone && (
                          <PhoneBadge
                            phone={g.respondentPhone}
                            size="xs"
                            tone="soft"
                          />
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1 ms-auto">
                          {g.items.length}
                        </Badge>
                        <ResponsePerspectiveBadge value={p as any} />
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
                              .map((pp: string) => pp[0])
                              .join("")
                              .toUpperCase();
                            const subjDet = subjectCache.get(subj.id) || null;
                            const subjRawAvatar =
                              subjDet?.avatarUrl || subjDet?.avatar || null;
                            return (
                              <div
                                key={`${p}-${g.respondentUserId}-${subj.id}`}
                                className="group/subject relative flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1 text-[10px] cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  goPreview({
                                    sessionId: session.id,
                                    userId: g.respondentUserId,
                                    perspective: p,
                                    subjectUserId: subj.id,
                                  });
                                }}>
                                <UserAvatar
                                  url={subjRawAvatar}
                                  alt={subj.name}
                                  fallback={subInit}
                                  className="h-5 w-5"
                                  fallbackClassName="text-[9px]"
                                />
                                <span
                                  className="truncate flex-1"
                                  title={subj.name}>
                                  {subj.name}
                                </span>
                                <ProgressByUserSession
                                  sessionId={session.id}
                                  userId={g.respondentUserId}
                                  perspective={p}
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
              {/* Add a separator between sections except after last rendered section */}
              {(() => {
                const hasNext = perspectiveOrder.slice(idx + 1).some((np) => {
                  const ng = groupsByPerspective[np] || [];
                  return ng.length > 0;
                });
                return hasNext ? <DropdownMenuSeparator /> : null;
              })()}
            </React.Fragment>
          );
        })}

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
      {/* Inline user creation dialog removed */}
    </DropdownMenu>
  );
}

export default SessionParticipantsMenu;
