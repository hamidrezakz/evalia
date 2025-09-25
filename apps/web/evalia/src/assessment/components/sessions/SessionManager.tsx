"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SessionUpsertDialog } from "@/assessment/components/sessions";
import {
  useSessions,
  useDeleteSession,
  useTemplate,
  useFullTemplate,
  useSessionQuestionCount,
  useUpdateSession,
  useAssignmentsDetailed,
} from "@/assessment/api/templates-hooks";
import {
  Pencil,
  Plus,
  Calendar,
  Users,
  Trash2,
  FileText,
  Building2,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  BarChart2,
  CalendarCheck,
  Hash,
  Search,
  Filter,
  X,
  ListFilter,
} from "lucide-react";
import { SessionStateEnum, ResponsePerspectiveEnum } from "@/lib/enums";
import {
  useOrganization,
  useOrganizations,
} from "@/organizations/organization/api/organization-hooks";
import { useUserOrganizations } from "@/organizations/organization/api/organization-hooks";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
  PanelAction,
  PanelDescription,
} from "@/components/ui/panel";
import OrganizationCombobox from "@/assessment/components/combobox/OrganizationCombobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatJalali,
  parseJalali,
  formatJalaliRelative,
} from "@/lib/jalali-date";
import { cn, formatIranPhone } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import QuickAssignmentDialog from "./QuickAssignmentDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // retained for existing card UI
import SessionParticipantsMenu from "./SessionParticipantsMenu";

// Helper to group assignments similar to SessionAssignmentsPanel but lightweight
function useSessionAssignmentGroups(sessionId: number | null) {
  const { data: assignments, isLoading } = useAssignmentsDetailed(sessionId);
  const normalized = React.useMemo(
    () => (Array.isArray(assignments) ? (assignments as any[]) : []),
    [assignments]
  );
  const selfItems = React.useMemo(
    () => normalized.filter((a) => (a.perspective as any) === "SELF"),
    [normalized]
  );
  const facilitatorGroups = React.useMemo(() => {
    const fac = normalized.filter(
      (a) => (a.perspective as any) === "FACILITATOR"
    );
    const map = new Map<number, { respondentName: string; items: any[] }>();
    for (const a of fac) {
      const rid = (a.respondentUserId ?? a.userId ?? 0) as number;
      const rname =
        a.respondent?.fullName ||
        a.respondent?.name ||
        a.user?.fullName ||
        a.user?.name ||
        a.respondent?.email ||
        a.user?.email ||
        `کاربر #${rid}`;
      if (!map.has(rid)) map.set(rid, { respondentName: rname, items: [] });
      map.get(rid)!.items.push(a);
    }
    return Array.from(map.entries()).map(([respondentUserId, v]) => ({
      respondentUserId,
      respondentName: v.respondentName,
      items: v.items,
    }));
  }, [normalized]);
  return { isLoading, assignments: normalized, selfItems, facilitatorGroups };
}

function SessionCard({
  s,
  onEdit,
  onAskDelete,
  onChangeState,
  onOpenQuickAssign,
}: {
  s: any;
  onEdit: () => void;
  onAskDelete: (id: number) => void;
  onChangeState: (state: string) => void;
  onOpenQuickAssign: (session: any) => void;
}) {
  const orgQ = useOrganization(s.organizationId ?? null);
  const tplQ = useTemplate(s.templateId ?? null);
  // Lightweight question count per session
  const qCountQ = useSessionQuestionCount(s.id ?? null);
  const questionCount = qCountQ.data?.total ?? null;
  const orgName = orgQ.data?.name || `سازمان #${s.organizationId}`;
  const tplName = (tplQ.data as any)?.name || `تمپلیت #${s.templateId}`;
  let startStr: string | null = null;
  let endStr: string | null = null;
  try {
    startStr = formatJalali(parseJalali(s.startAt), true);
    endStr = formatJalali(parseJalali(s.endAt), true);
  } catch {}
  const rel = formatJalaliRelative(s.startAt, { futureMode: "relative" });
  const stateColors: Record<string, string> = {
    SCHEDULED: "border-sky-400/40 hover:border-sky-500/60",
    IN_PROGRESS: "border-amber-400/50 hover:border-amber-500/70",
    ANALYZING: "border-violet-400/40 hover:border-violet-500/60",
    COMPLETED: "border-emerald-400/50 hover:border-emerald-500/70",
    CANCELLED: "border-rose-400/40 hover:border-rose-500/60 opacity-90",
  };
  const panelBorder =
    stateColors[s.state] || "border-border/50 hover:border-primary/50";
  // Assignments (lazy groups) - load always for simplicity; could optimize with IntersectionObserver
  const { assignments, selfItems, facilitatorGroups } =
    useSessionAssignmentGroups(s.id);
  const participantsCount = assignments.length;
  const [participantsOpen, setParticipantsOpen] = React.useState(false);
  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-background/60 dark:bg-muted/40 transition-colors overflow-hidden p-0 flex flex-col shadow-sm hover:shadow-md",
        panelBorder
      )}>
      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-primary/70 to-primary/30 opacity-60 group-hover:opacity-100 transition" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-[13px] font-semibold flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" /> {s.name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <Badge
                variant={
                  s.state === "CANCELLED"
                    ? "destructive"
                    : s.state === "COMPLETED"
                    ? "secondary"
                    : "outline"
                }
                className="text-[10px]">
                {SessionStateEnum.t(s.state)}
              </Badge>
              {questionCount !== null && (
                <Badge
                  variant="outline"
                  className="text-[10px]"
                  title={`تعداد سوالات: ${questionCount}`}>
                  سوال: {questionCount}
                </Badge>
              )}
              {s.teamScopeId ? (
                <Badge
                  variant="outline"
                  className="text-[10px] flex items-center gap-1">
                  <Users className="h-3 w-3" /> تیم #{s.teamScopeId}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  کل سازمان
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-[10px] flex items-center gap-1">
                <Hash className="h-3 w-3" /> #{s.id}
              </Badge>
              <span className="text-[10px] text-muted-foreground px-1">
                {rel}
              </span>
              <SessionParticipantsMenu
                session={s}
                onQuickAssign={onOpenQuickAssign}
              />
            </div>
          </div>
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuLabel>تغییر وضعیت</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onChangeState("SCHEDULED")}>
                <CalendarCheck className="h-4 w-4" />
                <span className="ms-2">زمان‌بندی شده</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeState("IN_PROGRESS")}>
                <PlayCircle className="h-4 w-4" />
                <span className="ms-2">در حال انجام</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeState("ANALYZING")}>
                <BarChart2 className="h-4 w-4" />
                <span className="ms-2">تحلیل</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeState("COMPLETED")}>
                <CheckCircle2 className="h-4 w-4" />
                <span className="ms-2">تکمیل</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeState("CANCELLED")}>
                <XCircle className="h-4 w-4" />
                <span className="ms-2">لغو</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>اقدامات</DropdownMenuLabel>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4" />
                <span className="ms-2">ویرایش</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onAskDelete(s.id)}>
                <Trash2 className="h-4 w-4" />
                <span className="ms-2">حذف</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="grid gap-2 text-[11px] text-muted-foreground leading-5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Calendar className="h-3.5 w-3.5" />
            <span>{startStr || s.startAt}</span>
            <span className="opacity-60">→</span>
            <span>{endStr || s.endAt}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <FileText className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground/90">{tplName}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Building2 className="h-3.5 w-3.5" />
            <span>{orgName}</span>
          </div>
          {s.description ? (
            <div className="flex items-start gap-1.5">
              <FileText className="h-3.5 w-3.5 mt-0.5" />
              <p className="line-clamp-3 text-foreground/80">{s.description}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ---------------- Manager ----------------
export default function SessionManager({
  organizationId,
}: {
  organizationId?: number;
}) {
  const [selectedOrgId, setSelectedOrgId] = React.useState<number | null>(
    organizationId || null
  );
  React.useEffect(
    () => setSelectedOrgId(organizationId || null),
    [organizationId]
  );

  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editingData, setEditingData] = React.useState<any | null>(null);
  const [search, setSearch] = React.useState("");
  const [toolbarOpen, setToolbarOpen] = React.useState(false); // for mobile collapse
  const [stateFilters, setStateFilters] = React.useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [updateError, setUpdateError] = React.useState<string | null>(null);
  const [quickAssignOpen, setQuickAssignOpen] = React.useState(false);
  const [quickAssignSession, setQuickAssignSession] = React.useState<
    any | null
  >(null);

  const sessionsQ = useSessions({
    organizationId: selectedOrgId || undefined,
    search: search || undefined,
    pageSize: 100,
  });
  const sessions = Array.isArray((sessionsQ.data as any)?.data)
    ? (sessionsQ.data as any).data
    : Array.isArray(sessionsQ.data?.data)
    ? (sessionsQ.data as any).data
    : Array.isArray(sessionsQ.data)
    ? (sessionsQ.data as any)
    : [];
  const filteredSessions = React.useMemo(
    () =>
      stateFilters.length
        ? sessions.filter((s: any) => stateFilters.includes(s.state))
        : sessions,
    [sessions, stateFilters]
  );

  const delMut = useDeleteSession();
  const updateMut = useUpdateSession();

  function handleEdit(s: any) {
    setEditingId(s.id);
    setEditingData(s);
    setOpen(true);
  }
  function handleCreate() {
    setEditingId(null);
    setEditingData(null);
    setOpen(true);
  }
  function askDelete(id: number) {
    setDeleteId(id);
    setConfirmOpen(true);
  }
  async function handleDelete() {
    if (!deleteId) return;
    try {
      await delMut.mutateAsync(deleteId);
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
      sessionsQ.refetch();
    }
  }

  const userOrgsQ = useOrganizations({ pageSize: 100 });

  return (
    <>
      <Panel className="p-0 border border-border/60 overflow-hidden bg-gradient-to-b from-background/80 via-background/70 to-background/90 backdrop-blur-sm">
        <PanelHeader className="p-4 pb-2 border-b border-border/50 flex-col gap-3">
          {/* Row 1: Title on left, primary action on right (only) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
            <div className="flex flex-col gap-1 min-w-0">
              <PanelTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                  Σ
                </span>
                جلسات ارزیابی
              </PanelTitle>
              <PanelDescription className="text-xs text-muted-foreground/80 hidden sm:block">
                مدیریت، جستجو و فیلتر جلسات سنجش
              </PanelDescription>
            </div>
            <PanelAction className="w-full sm:w-auto">
              <Button
                size="sm"
                className="h-9 px-3 w-full sm:w-auto"
                onClick={handleCreate}>
                <Plus className="h-4 w-4 ms-1" />
                <span className="hidden sm:inline">افزودن جلسه</span>
                <span className="sm:hidden">افزودن</span>
              </Button>
            </PanelAction>
          </div>
          {/* Row 2: Mobile toolbar toggle + count + clear filters */}
          <div className="flex items-center justify-between w-full gap-2">
            {filteredSessions.length > 0 ? (
              <span className="text-[11px] px-2 py-1 rounded-md bg-muted/40 text-foreground/70">
                {filteredSessions.length.toLocaleString()} جلسه
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              {stateFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="حذف فیلترها"
                  onClick={() => setStateFilters([])}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className={cn("h-8 w-8", toolbarOpen ? "bg-primary/10" : "")}
                onClick={() => setToolbarOpen((o) => !o)}
                title="فیلترها / جستجو">
                <ListFilter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            className={cn(
              "grid w-full gap-3 transition-all duration-300 md:grid-cols-3 md:items-center",
              toolbarOpen
                ? "grid-cols-1 opacity-100"
                : "grid-cols-1 md:opacity-100",
              toolbarOpen
                ? "max-h-[400px]"
                : "max-h-0 md:max-h-full overflow-hidden md:overflow-visible"
            )}>
            <div className="relative flex items-center h-9">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی جلسه..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 bg-background/60 focus-visible:ring-1 text-sm"
              />
            </div>
            <div className="flex items-center h-9">
              <OrganizationCombobox
                value={selectedOrgId}
                onChange={(id) => setSelectedOrgId(id)}
                placeholder={
                  userOrgsQ.isLoading ? "در حال بارگذاری..." : "انتخاب سازمان"
                }
                className="w-full h-9"
              />
            </div>
            <div className="flex items-center h-9">
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={stateFilters.length ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-9 w-full justify-between px-3 text-xs font-medium",
                      stateFilters.length
                        ? "bg-primary text-primary-foreground"
                        : ""
                    )}>
                    <span className="flex items-center gap-1">
                      <Filter className="h-4 w-4" /> وضعیت‌ها
                    </span>
                    {stateFilters.length ? (
                      <span className="inline-flex items-center rounded-md bg-primary-foreground/20 px-2 py-0.5 text-[10px] font-semibold">
                        {stateFilters.length}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">
                        همه
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-60 max-h-[320px] overflow-auto">
                  <DropdownMenuLabel className="text-xs">
                    انتخاب وضعیت‌ها
                  </DropdownMenuLabel>
                  {SessionStateEnum.values.map((st) => {
                    const checked = stateFilters.includes(st);
                    return (
                      <DropdownMenuItem
                        key={st}
                        onClick={(e) => {
                          e.preventDefault();
                          setStateFilters((prev) =>
                            checked
                              ? prev.filter((x) => x !== st)
                              : [...prev, st]
                          );
                        }}
                        className="flex items-center gap-2 text-[11px] py-1.5">
                        <Checkbox checked={checked} className="ms-1" />
                        {SessionStateEnum.t(st)}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setStateFilters([])}
                    className="text-[11px] py-1.5">
                    حذف فیلترها
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </PanelHeader>
        <PanelContent className="p-4 flex flex-col gap-4">
          {updateError ? (
            <div className="text-sm text-rose-600">{updateError}</div>
          ) : null}
          <div
            className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            data-testid="sessions-grid">
            {sessionsQ.isLoading &&
              [0, 1, 2].map((i) => (
                <Panel
                  key={i}
                  className="border border-border/50 bg-background/40 p-0 overflow-hidden">
                  <div className="p-4 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-6 rounded-md" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-5 w-20 rounded" />
                      <Skeleton className="h-5 w-14 rounded" />
                      <Skeleton className="h-5 w-16 rounded" />
                    </div>
                    <div className="grid gap-2 text-[11px]">
                      <Skeleton className="h-3 w-5/6" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </Panel>
              ))}
            {!sessionsQ.isLoading && filteredSessions.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 p-10 text-center">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Search className="h-4 w-4" />
                  <span>جلسه‌ای یافت نشد</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setStateFilters([]);
                    }}
                    className="text-xs">
                    ریست جستجو و فیلتر
                  </Button>
                  <Button size="sm" onClick={handleCreate} className="text-xs">
                    افزودن جلسه
                  </Button>
                </div>
              </div>
            )}
            {!sessionsQ.isLoading &&
              filteredSessions.map((s: any) => (
                <SessionCard
                  key={s.id}
                  s={s}
                  onEdit={() => handleEdit(s)}
                  onAskDelete={askDelete}
                  onChangeState={async (state) => {
                    setUpdateError(null);
                    try {
                      await updateMut.mutateAsync({
                        id: s.id,
                        body: { state, force: true },
                      } as any);
                      await sessionsQ.refetch();
                    } catch (e) {
                      setUpdateError(
                        (e as any)?.message || "خطا در تغییر وضعیت"
                      );
                    }
                  }}
                  onOpenQuickAssign={(sess) => {
                    setQuickAssignSession(sess);
                    setQuickAssignOpen(true);
                  }}
                />
              ))}
          </div>
        </PanelContent>
      </Panel>
      <QuickAssignmentDialog
        open={quickAssignOpen}
        onOpenChange={setQuickAssignOpen}
        sessionId={quickAssignSession?.id || null}
        organizationId={quickAssignSession?.organizationId || selectedOrgId}
        onSuccess={() => {
          sessionsQ.refetch();
        }}
      />
      <SessionUpsertDialog
        key={(open ? "open" : "closed") + ":" + String(editingId ?? "new")}
        open={open}
        onOpenChange={setOpen}
        sessionId={editingId}
        initialSession={editingData || undefined}
        defaultOrganizationId={organizationId || null}
        onSuccess={() => {
          setOpen(false);
          sessionsQ.refetch();
        }}
      />
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف جلسه</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این جلسه مطمئن هستید؟ این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={delMut.isPending}>
              انصراف
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={delMut.isPending}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
