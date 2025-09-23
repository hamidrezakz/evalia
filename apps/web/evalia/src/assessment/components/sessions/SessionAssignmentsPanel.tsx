"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelAction,
  PanelContent,
} from "@/components/ui/panel";
import { Combobox } from "@/components/ui/combobox";
import {
  User,
  Users,
  CheckCircle2,
  Trash2,
  FileText,
  Phone,
  Mail,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  useAssignmentsDetailed,
  useAddAssignment,
  useBulkAssign,
  useDeleteAssignment,
} from "@/assessment/api/templates-hooks";
import { sessionsKeys } from "@/assessment/api/templates-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "@/users/api/users-hooks";
import { useTeams } from "@/organizations/team/api/team-hooks";
import { useOrganizations } from "@/organizations/organization/api/organization-hooks";
import { useSessions } from "@/assessment/api/templates-hooks";
import { listTeamMembers } from "@/organizations/member/api/team-membership.api";
import { ResponsePerspectiveEnum, type ResponsePerspective } from "@/lib/enums";
import { getUser } from "@/users/api/users.api";

export default function SessionAssignmentsPanel({
  organizationId,
  sessionId,
}: {
  organizationId: number;
  sessionId: number | null;
}) {
  // Local selected org/session (can be initialized from props)
  const [selectedOrgId, setSelectedOrgId] = React.useState<number | null>(
    organizationId || null
  );
  const [selectedSessionId, setSelectedSessionId] = React.useState<
    number | null
  >(sessionId || null);
  React.useEffect(() => {
    setSelectedOrgId(organizationId || null);
  }, [organizationId]);
  React.useEffect(() => {
    setSelectedSessionId(sessionId || null);
  }, [sessionId]);

  const { data: assignments, isLoading } =
    useAssignmentsDetailed(selectedSessionId);
  const addMut = useAddAssignment();
  const bulkMut = useBulkAssign();
  const delMut = useDeleteAssignment();
  const qc = useQueryClient();

  // Top-level selections: organization and session
  const [orgSearch, setOrgSearch] = React.useState("");
  const orgQ = useOrganizations({ q: orgSearch, page: 1, pageSize: 50 });
  const orgs = Array.isArray(orgQ.data)
    ? (orgQ.data as any)
    : Array.isArray((orgQ.data as any)?.data)
    ? ((orgQ.data as any).data as any[])
    : [];

  const [sessionSearch, setSessionSearch] = React.useState("");
  // Sessions list is fetched only when org is selected by mounting a child component

  const perspectives: ResponsePerspective[] = React.useMemo(
    () => ResponsePerspectiveEnum.values as ResponsePerspective[],
    []
  );

  const [state, setState] = React.useState<{
    userId: number | null;
    teamId: number | null;
    perspective: ResponsePerspective | null;
    subjectUserId: number | null;
  }>({ userId: null, teamId: null, perspective: "SELF", subjectUserId: null });

  // Helpers
  const safeName = (obj: any) =>
    (obj?.fullName || obj?.name || obj?.email || "نامشخص") as string;
  const initialsOf = (name: string) =>
    (name || "?")
      .split(/\s+/)
      .slice(0, 2)
      .map((s: string) => s[0])
      .join("")
      .toUpperCase();

  // Cache for subject user details (when API doesn't populate a.subject)
  const [subjectDetails, setSubjectDetails] = React.useState<Map<number, any>>(
    () => new Map()
  );

  // Normalize and split assignments by perspective
  const normalizedAssignments = React.useMemo(() => {
    return Array.isArray(assignments) ? (assignments as any[]) : [];
  }, [assignments]);
  const selfAssignments = React.useMemo(() => {
    return normalizedAssignments.filter(
      (a) => (a.perspective as any) === "SELF"
    );
  }, [normalizedAssignments]);
  const facilitatorGroups = React.useMemo(() => {
    const fac = normalizedAssignments.filter(
      (a) => (a.perspective as any) === "FACILITATOR"
    );
    const map = new Map<number, { respondentName: string; items: any[] }>();
    for (const a of fac) {
      const rid = (a.respondentUserId ?? a.userId ?? 0) as number;
      const rname = safeName(a.respondent || a.user);
      if (!map.has(rid)) map.set(rid, { respondentName: rname, items: [] });
      map.get(rid)!.items.push(a);
    }
    return Array.from(map.entries()).map(([respondentUserId, v]) => ({
      respondentUserId,
      respondentName: v.respondentName,
      items: v.items,
    }));
  }, [normalizedAssignments]);

  // Fill missing subject details by fetching user info once per subject ID
  React.useEffect(() => {
    const ids = new Set<number>();
    for (const g of facilitatorGroups) {
      for (const it of g.items) {
        const sid = Number(it.subjectUserId ?? 0);
        if (!sid) continue;
        if (it.subject && it.subject.id === sid) continue;
        if (!subjectDetails.has(sid)) ids.add(sid);
      }
    }
    if (ids.size === 0) return;
    let alive = true;
    (async () => {
      const fetched = await Promise.all(
        Array.from(ids).map((id) =>
          getUser(id)
            .then((u) => ({ id, user: u }))
            .catch(() => ({ id, user: null }))
        )
      );
      if (!alive) return;
      setSubjectDetails((prev) => {
        const next = new Map(prev);
        for (const { id, user } of fetched) next.set(id, user);
        return next;
      });
    })();
    return () => {
      alive = false;
    };
  }, [facilitatorGroups, subjectDetails]);

  const addOne = async () => {
    if (!selectedSessionId || !state.userId) return;
    const isSelf = (state.perspective || "SELF") === "SELF";
    const respondentUserId = state.userId;
    const subjectUserId = isSelf
      ? respondentUserId
      : state.subjectUserId ?? respondentUserId;
    await addMut.mutateAsync({
      sessionId: selectedSessionId,
      // legacy for backward compatibility
      userId: respondentUserId,
      respondentUserId,
      subjectUserId,
      perspective: state.perspective || undefined,
    } as any);
    // Ensure UI refreshes immediately
    await qc.invalidateQueries({
      queryKey: sessionsKeys.assignmentsDetailed(selectedSessionId),
    });
    await qc.refetchQueries({
      queryKey: sessionsKeys.assignmentsDetailed(selectedSessionId),
    });
    setState((s) => ({ ...s, userId: null }));
  };
  const bulkFromTeam = async () => {
    if (!selectedSessionId || !selectedOrgId || !state.teamId) return;
    // Fetch team members and build userIds
    const members = await listTeamMembers(selectedOrgId, state.teamId, {
      pageSize: 500,
    });
    const userIds = Array.isArray(members)
      ? members
          .map((m: any) => m.userId)
          .filter((id: any) => typeof id === "number")
      : [];
    if (userIds.length === 0) return;
    await bulkMut.mutateAsync({
      sessionId: selectedSessionId,
      respondentUserIds: userIds,
      subjectUserId:
        (state.perspective || "SELF") !== "SELF"
          ? state.subjectUserId || undefined
          : undefined,
      perspective: state.perspective || undefined,
    } as any);
    // Immediate refresh for better UX
    await qc.invalidateQueries({
      queryKey: sessionsKeys.assignmentsDetailed(selectedSessionId),
    });
    await qc.refetchQueries({
      queryKey: sessionsKeys.assignmentsDetailed(selectedSessionId),
    });
  };

  return (
    <Panel>
      <PanelHeader className="flex-row items-center justify-between gap-2">
        <div>
          <PanelTitle className="text-base">
            اختصاص به کاربران/تیم‌ها
          </PanelTitle>
          <PanelDescription>
            کاربران را تکی یا به‌صورت گروهی از یک تیم اضافه کنید و پرسپکتیو را
            تعیین نمایید.
          </PanelDescription>
        </div>
        <PanelAction />
      </PanelHeader>
      <PanelContent className="flex-col gap-5">
        {/* Organization and Session selectors */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>سازمان</Label>
            <Combobox<any>
              items={orgs}
              value={selectedOrgId}
              onChange={(v) => {
                const orgId = v == null ? null : Number(v as any);
                setSelectedOrgId(orgId);
                setSelectedSessionId(null);
                setState({
                  userId: null,
                  teamId: null,
                  perspective: state.perspective,
                  subjectUserId: null,
                });
              }}
              searchable
              searchValue={orgSearch}
              onSearchChange={setOrgSearch}
              getKey={(o) => o.id}
              getLabel={(o) => o.name}
              leadingIcon={Users}
              loading={orgQ.isLoading}
              placeholder={"انتخاب سازمان"}
            />
          </div>
          <div className="space-y-2">
            <Label>جلسه</Label>
            {(() => {
              const sessionPlaceholder = selectedOrgId
                ? "انتخاب/جستجوی جلسه"
                : "ابتدا سازمان را انتخاب کنید";
              return (
                <SessionsSelect
                  orgId={selectedOrgId ?? 0}
                  value={selectedSessionId}
                  onChange={(val) =>
                    setSelectedSessionId(val == null ? null : Number(val))
                  }
                  search={sessionSearch}
                  onSearch={setSessionSearch}
                  placeholder={sessionPlaceholder}
                  disabled={!selectedOrgId}
                />
              );
            })()}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>کاربر</Label>
            <UsersSelect
              orgId={selectedOrgId}
              value={state.userId}
              onChange={(id) => setState((s) => ({ ...s, userId: id }))}
            />
            <Button
              size="sm"
              onClick={addOne}
              disabled={
                addMut.isPending || !state.userId || !selectedSessionId
              }>
              <CheckCircle2 className="h-4 w-4 ms-1" /> افزودن کاربر
            </Button>
          </div>
          <div className="space-y-2">
            <Label>تیم</Label>
            <TeamsSelect
              orgId={selectedOrgId}
              value={state.teamId}
              onChange={(id) => setState((s) => ({ ...s, teamId: id }))}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={bulkFromTeam}
              disabled={
                bulkMut.isPending || !state.teamId || !selectedSessionId
              }>
              اختصاص گروهی از تیم
            </Button>
            {/* Show selected team members */}
            {selectedOrgId && state.teamId ? (
              <TeamMembersList orgId={selectedOrgId} teamId={state.teamId} />
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>پرسپکتیو</Label>
            <div className="flex flex-wrap gap-2">
              {perspectives.map((p) => (
                <label
                  key={p}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs cursor-pointer ${
                    state.perspective === p
                      ? "border-primary/50 bg-primary/5"
                      : ""
                  }`}>
                  <Checkbox
                    checked={state.perspective === p}
                    onCheckedChange={() =>
                      setState((s) => ({
                        ...s,
                        perspective: p,
                        subjectUserId: p === "SELF" ? null : s.subjectUserId,
                      }))
                    }
                  />
                  <span>{ResponsePerspectiveEnum.t(p)}</span>
                </label>
              ))}
            </div>
            {(state.perspective || "SELF") !== "SELF" ? (
              <div className="mt-2 space-y-2">
                <Label>سوژه (کاربر هدف)</Label>
                <UsersSelect
                  orgId={selectedOrgId}
                  value={state.subjectUserId}
                  onChange={(id) =>
                    setState((s) => ({ ...s, subjectUserId: id }))
                  }
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <Label>اختصاص‌های فعلی</Label>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">
              در حال بارگذاری...
            </div>
          ) : (assignments as any)?.error ? (
            <div className="text-sm text-rose-600">
              {(assignments as any).error?.message || "خطا در دریافت داده‌ها"}
            </div>
          ) : normalizedAssignments.length === 0 ? (
            <div className="text-sm text-muted-foreground">موردی ثبت نشده</div>
          ) : (
            <>
              {/* SELF assignments (افراد عادی) */}
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  افراد عادی (خودارزیابی)
                </div>
                {selfAssignments.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    هیچ موردی نیست
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {selfAssignments.map((a: any) => {
                      const respondentName = safeName(a.respondent || a.user);
                      const email =
                        a.respondent?.email || a.user?.email || null;
                      const phone =
                        a.respondent?.phone || a.user?.phone || null;
                      const initials = (respondentName || "?")
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((s: string) => s[0])
                        .join("")
                        .toUpperCase();
                      return (
                        <div
                          key={a.id}
                          className="flex items-center justify-between rounded-md border p-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                  {respondentName}
                                </span>
                                <Badge variant="secondary" className="shrink-0">
                                  خودارزیابی
                                </Badge>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                {phone ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {phone}
                                  </span>
                                ) : null}
                                {email ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {email}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => delMut.mutateAsync(a.id)}
                            className="shrink-0">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Facilitators (grouped by تسهیلگر) */}
              <div className="space-y-2">
                <div className="text-sm font-medium">تسهیلگران</div>
                {facilitatorGroups.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    هیچ موردی نیست
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {facilitatorGroups.map((g) => {
                      // Build subjects list (unique by subjectUserId), keep list of assignment ids for delete-all
                      const subjectMap = new Map<
                        number,
                        { name: string; ids: number[] }
                      >();
                      for (const it of g.items) {
                        const sid = Number(it.subjectUserId ?? 0);
                        const subjObj = it.subject ?? subjectDetails.get(sid);
                        const sname = safeName(subjObj);
                        if (!subjectMap.has(sid))
                          subjectMap.set(sid, { name: sname, ids: [] });
                        subjectMap.get(sid)!.ids.push(it.id as number);
                      }
                      const subjects = Array.from(subjectMap.entries()).map(
                        ([subjectUserId, v]) => ({
                          subjectUserId,
                          name: v.name,
                          ids: v.ids,
                        })
                      );
                      const initials = (g.respondentName || "?")
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((s: string) => s[0])
                        .join("")
                        .toUpperCase();
                      return (
                        <div
                          key={g.respondentUserId}
                          className="rounded-md border p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="size-8">
                                <AvatarFallback>{initials}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate">
                                    {g.respondentName}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="shrink-0">
                                    تسهیلگر
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] shrink-0">
                                    {subjects.length} سوژه
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          {subjects.length === 0 ? (
                            <div className="text-xs text-muted-foreground">
                              سوژه‌ای یافت نشد
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {subjects.map((s) => (
                                <span
                                  key={`resp-${g.respondentUserId}-sub-${s.subjectUserId}`}
                                  className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs">
                                  <span className="inline-flex items-center justify-center size-5 rounded-full bg-muted text-foreground/80">
                                    {initialsOf(s.name)}
                                  </span>
                                  <span>{s.name}</span>
                                  {s.ids.length > 1 ? (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px]">
                                      x{s.ids.length}
                                    </Badge>
                                  ) : null}
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={async () => {
                                      // delete all assignments for this subject under this facilitator
                                      for (const id of s.ids) {
                                        await delMut.mutateAsync(id);
                                      }
                                    }}
                                    title="حذف">
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </PanelContent>
    </Panel>
  );
}

function TeamMembersList({ orgId, teamId }: { orgId: number; teamId: number }) {
  const [loading, setLoading] = React.useState(true);
  const [members, setMembers] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await listTeamMembers(orgId, teamId, { pageSize: 200 });
        if (alive) setMembers(res || []);
      } catch (e) {
        if (alive)
          setError(e instanceof Error ? e.message : "خطا در دریافت اعضای تیم");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [orgId, teamId]);

  return (
    <div className="mt-2 space-y-1">
      <Label className="text-xs text-muted-foreground">اعضای تیم</Label>
      {loading ? (
        <div className="text-xs text-muted-foreground">در حال دریافت…</div>
      ) : error ? (
        <div className="text-xs text-rose-600">{error}</div>
      ) : members.length === 0 ? (
        <div className="text-xs text-muted-foreground">عضوی یافت نشد</div>
      ) : (
        <div className="max-h-40 overflow-auto rounded-md border p-2 space-y-1">
          {members.map((m) => (
            <div key={m.id} className="text-xs">
              • کاربر #{m.userId}
              {m.user?.fullName ? ` — ${m.user.fullName}` : ""}
              {m.user?.email ? ` (${m.user.email})` : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type SessionsSelectProps = {
  orgId: number;
  value: number | null;
  onChange: (v: number | null) => void;
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

function SessionsSelect({
  orgId,
  value,
  onChange,
  search,
  onSearch,
  placeholder = "انتخاب/جستجوی جلسه",
  disabled = false,
}: SessionsSelectProps) {
  const sessionsQ = useSessions(
    orgId ? { organizationId: orgId, search } : undefined
  );
  const sessions = sessionsQ.data?.data || [];
  return (
    <Combobox<any>
      items={sessions}
      value={value}
      onChange={(v) => onChange((v as number) ?? null)}
      searchable
      searchValue={search}
      onSearchChange={onSearch}
      getKey={(s) => s.id}
      getLabel={(s) => s.name}
      leadingIcon={FileText}
      loading={sessionsQ.isLoading}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

function UsersSelect({
  orgId,
  value,
  onChange,
}: {
  orgId: number | null;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const [search, setSearch] = React.useState("");
  React.useEffect(() => {
    // Reset user search when organization changes
    setSearch("");
  }, [orgId]);
  if (!orgId) {
    return (
      <Combobox<any>
        items={[]}
        value={null}
        onChange={() => {}}
        placeholder="ابتدا سازمان و جلسه را انتخاب کنید"
        leadingIcon={User}
        disabled
      />
    );
  }
  const { data, isLoading } = useUsers({
    orgId,
    q: search,
    page: 1,
    pageSize: 50,
  } as any);
  const list = (data?.data as any[]) || [];
  return (
    <Combobox<any>
      items={list}
      value={value}
      onChange={(v) => onChange((v as number) ?? null)}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      filter={(u, q) =>
        (u.fullName || u.name || u.email || "").toLowerCase().includes(q)
      }
      getKey={(u) => u.id}
      getLabel={(u) => u.fullName || u.name || u.email || String(u.id)}
      leadingIcon={User}
      loading={isLoading}
      placeholder={"انتخاب/جستجوی کاربر"}
    />
  );
}

function TeamsSelect({
  orgId,
  value,
  onChange,
}: {
  orgId: number | null;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const [search, setSearch] = React.useState("");
  React.useEffect(() => {
    // Reset team search when organization changes
    setSearch("");
  }, [orgId]);
  if (!orgId) {
    return (
      <Combobox<any>
        items={[]}
        value={null}
        onChange={() => {}}
        placeholder="ابتدا سازمان را انتخاب کنید"
        leadingIcon={Users}
        disabled
      />
    );
  }
  const { data, isLoading } = useTeams(orgId, {
    pageSize: 100,
    q: search,
  } as any);
  const teams = Array.isArray(data)
    ? (data as any[])
    : Array.isArray((data as any)?.data)
    ? ((data as any).data as any[])
    : [];
  return (
    <Combobox<any>
      items={teams}
      value={value}
      onChange={(v) => onChange((v as number) ?? null)}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      getKey={(t) => t.id}
      getLabel={(t) => t.name}
      leadingIcon={Users}
      loading={isLoading}
      placeholder="انتخاب تیم"
    />
  );
}
