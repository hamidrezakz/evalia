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
import { User, Users, CheckCircle2, Trash2, FileText } from "lucide-react";
import {
  useAssignments,
  useAddAssignment,
  useBulkAssign,
  useDeleteAssignment,
} from "@/assessment/api/templates-hooks";
import { useUsers } from "@/users/api/users-hooks";
import { useTeams } from "@/organizations/team/api/team-hooks";
import { useOrganizations } from "@/organizations/organization/api/organization-hooks";
import { useSessions } from "@/assessment/api/templates-hooks";
import { listTeamMembers } from "@/organizations/member/api/team-membership.api";
import { responsePerspectiveEnum } from "@/assessment/types/templates.types";

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

  const { data: assignments, isLoading } = useAssignments(selectedSessionId);
  const addMut = useAddAssignment();
  const bulkMut = useBulkAssign();
  const delMut = useDeleteAssignment();

  // Top-level selections: organization and session
  const [orgSearch, setOrgSearch] = React.useState("");
  const orgQ = useOrganizations({ q: orgSearch, page: 1, pageSize: 50 });
  const orgs = orgQ.data || [];

  const [sessionSearch, setSessionSearch] = React.useState("");
  // Sessions list is fetched only when org is selected by mounting a child component

  const perspectives: string[] = React.useMemo(() => {
    const anyEnum: any = responsePerspectiveEnum as any;
    if (Array.isArray(anyEnum?.options)) return anyEnum.options as string[];
    if (anyEnum?.enum)
      return Object.values(anyEnum.enum as Record<string, string>);
    return ["SELF", "PEER", "MANAGER", "FACILITATOR", "SYSTEM"]; // fallback
  }, []);

  const [state, setState] = React.useState<{
    userId: number | null;
    teamId: number | null;
    perspective: string | null;
  }>({ userId: null, teamId: null, perspective: "SELF" });

  const addOne = async () => {
    if (!selectedSessionId || !state.userId) return;
    await addMut.mutateAsync({
      sessionId: selectedSessionId,
      userId: state.userId,
      perspective: state.perspective || undefined,
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
      userIds,
      perspective: state.perspective || undefined,
    } as any);
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
                const orgId = (v as number) ?? null;
                setSelectedOrgId(orgId);
                setSelectedSessionId(null);
                setState({
                  userId: null,
                  teamId: null,
                  perspective: state.perspective,
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
            {!selectedOrgId ? (
              <Combobox<any>
                items={[]}
                value={null}
                onChange={() => {}}
                placeholder="ابتدا سازمان را انتخاب کنید"
                leadingIcon={FileText}
                disabled
              />
            ) : (
              <SessionsSelect
                orgId={selectedOrgId}
                value={selectedSessionId}
                onChange={setSelectedSessionId}
                search={sessionSearch}
                onSearch={setSessionSearch}
              />
            )}
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
                      setState((s) => ({ ...s, perspective: p }))
                    }
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>اختصاص‌های فعلی</Label>
          <div className="flex flex-col gap-2">
            {isLoading && (
              <div className="text-sm text-muted-foreground">
                در حال بارگذاری...
              </div>
            )}
            {!isLoading &&
              Array.isArray(assignments) &&
              assignments.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  موردی ثبت نشده
                </div>
              )}
            {Array.isArray(assignments) &&
              assignments.map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-md border p-2">
                  <div className="text-xs">
                    کاربر #{a.userId} — {a.perspective || "SELF"}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => delMut.mutateAsync(a.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </PanelContent>
    </Panel>
  );
}

function SessionsSelect({
  orgId,
  value,
  onChange,
  search,
  onSearch,
}: {
  orgId: number;
  value: number | null;
  onChange: (v: number | null) => void;
  search: string;
  onSearch: (v: string) => void;
}) {
  const sessionsQ = useSessions({ organizationId: orgId, search });
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
      placeholder={"انتخاب/جستجوی جلسه"}
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
  const { data } = useTeams(orgId, { pageSize: 100 } as any);
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
      getKey={(t) => t.id}
      getLabel={(t) => t.name}
      leadingIcon={Users}
      placeholder="انتخاب تیم"
    />
  );
}
