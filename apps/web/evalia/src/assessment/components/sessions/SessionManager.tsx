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
  useUpdateSession,
} from "@/assessment/api/templates-hooks";
import { useOrgState } from "@/organizations/organization/context/org-context";
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
} from "lucide-react";
import { SessionStateEnum } from "@/lib/enums";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";
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
import { Checkbox } from "@/components/ui/checkbox";

export default function SessionManager({
  organizationId,
}: {
  organizationId?: number | null;
}) {
  const orgCtx = useOrgState?.();
  const orgIdProp =
    organizationId ??
    (orgCtx ? Number(orgCtx.activeOrganizationId || 0) : undefined);

  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editingData, setEditingData] = React.useState<any | null>(null);
  const [search, setSearch] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [selectedOrgId, setSelectedOrgId] = React.useState<number | null>(
    orgIdProp ?? null
  );
  const [stateFilters, setStateFilters] = React.useState<string[]>([]);

  // Load user organizations for select options
  const userOrgsQ = useUserOrganizations(true);
  const userOrgs = Array.isArray(userOrgsQ.data) ? userOrgsQ.data : [];

  // Initialize selection if empty
  React.useEffect(() => {
    if (selectedOrgId == null) {
      if (orgIdProp) setSelectedOrgId(orgIdProp);
      else if (userOrgs[0]?.id) setSelectedOrgId(userOrgs[0].id);
    }
  }, [orgIdProp, selectedOrgId, userOrgs]);

  const sessionsQ = useSessions({
    organizationId: selectedOrgId || undefined,
    state: stateFilters.length === 1 ? stateFilters[0] : undefined,
    search,
  });
  const sessions = (sessionsQ.data?.data || [])
    .slice()
    .sort((a: any, b: any) => (a.startAt < b.startAt ? 1 : -1));

  const delMut = useDeleteSession();
  const updateMut = useUpdateSession();

  const handleAdd = () => {
    setEditingId(null);
    setEditingData(null);
    setOpen(true);
  };
  const handleEdit = (session: any) => {
    setEditingId(session?.id ?? null);
    setEditingData(session || null);
    setOpen(true);
  };
  const askDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const handleDelete = async () => {
    if (deleteId == null) return;
    await delMut.mutateAsync(deleteId);
    setConfirmOpen(false);
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <PanelHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
          <div>
            <PanelTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" /> مدیریت
              جلسات ارزیابی
            </PanelTitle>
            <PanelDescription className="text-xs sm:text-sm">
              ایجاد، جستجو و مدیریت جلسات مبتنی بر قالب‌های تعریف‌شده.
            </PanelDescription>
          </div>
          <PanelAction className="flex items-center gap-2">
            <Button size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4 ms-1" /> افزودن جلسه
            </Button>
          </PanelAction>
        </PanelHeader>
        <PanelContent className="flex-col gap-3">
          {/* Toolbar row under header */}
          <div className="w-full flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 shrink-0 whitespace-nowrap">
                  فیلتر وضعیت
                  {stateFilters.length > 0 ? (
                    <Badge variant="secondary" className="text-[10px]">
                      {stateFilters.length}
                    </Badge>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56">
                <DropdownMenuLabel>انتخاب وضعیت‌ها</DropdownMenuLabel>
                {SessionStateEnum.values.map((st) => {
                  const checked = stateFilters.includes(st);
                  return (
                    <DropdownMenuItem
                      key={st}
                      onClick={(e) => {
                        e.preventDefault();
                        setStateFilters((prev) =>
                          checked ? prev.filter((x) => x !== st) : [...prev, st]
                        );
                      }}>
                      <Checkbox checked={checked} className="ms-2" />
                      {SessionStateEnum.t(st)}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStateFilters([])}>
                  حذف فیلترها
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <OrganizationCombobox
              value={selectedOrgId}
              onChange={(id) => setSelectedOrgId(id)}
              placeholder={
                userOrgsQ.isLoading ? "در حال بارگذاری..." : "انتخاب سازمان"
              }
              className="w-full sm:w-[260px]"
            />
            <div className="relative w-full items-center justify-center sm:w-[260px] min-w-[140px]">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی جلسه"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {sessionsQ.isLoading ? (
              <div className="text-sm text-muted-foreground">
                در حال بارگذاری…
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                جلسه‌ای یافت نشد.
              </div>
            ) : (
              sessions.map((s: any) => (
                <SessionCard
                  key={s.id}
                  s={s}
                  onEdit={() => handleEdit(s)}
                  onAskDelete={askDelete}
                  onChangeState={(state) =>
                    updateMut.mutate({ id: s.id, body: { state } })
                  }
                />
              ))
            )}
          </div>
        </PanelContent>
      </Panel>

      <SessionUpsertDialog
        key={(open ? "open" : "closed") + ":" + String(editingId ?? "new")}
        open={open}
        onOpenChange={setOpen}
        sessionId={editingId}
        initialSession={editingData || undefined}
        defaultOrganizationId={orgIdProp || null}
        onSuccess={() => setOpen(false)}
      />

      {/* Delete confirmation dialog */}
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
    </div>
  );
}

function SessionCard({
  s,
  onEdit,
  onAskDelete,
  onChangeState,
}: {
  s: any;
  onEdit: () => void;
  onAskDelete: (id: number) => void;
  onChangeState: (state: string) => void;
}) {
  const orgQ = useOrganization(s.organizationId ?? null);
  const tplQ = useTemplate(s.templateId ?? null);
  const orgName = orgQ.data?.name || `سازمان #${s.organizationId}`;
  const tplName = (tplQ.data as any)?.name || `تمپلیت #${s.templateId}`;

  return (
    <Panel className="bg-primary/4">
      <PanelHeader className="flex-row items-start justify-between gap-2">
        <PanelTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" /> {s.name}
        </PanelTitle>
        <PanelAction className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuLabel>تغییر وضعیت</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onChangeState("SCHEDULED")}>
                <CalendarCheck className="h-4 w-4" /> زمان‌بندی شده
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeState("IN_PROGRESS")}>
                <PlayCircle className="h-4 w-4" /> در حال انجام
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeState("ANALYZING")}>
                <BarChart2 className="h-4 w-4" /> در حال تحلیل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeState("COMPLETED")}>
                <CheckCircle2 className="h-4 w-4" /> تکمیل شده
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeState("CANCELLED")}>
                <XCircle className="h-4 w-4" /> لغو شده
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>اقدامات</DropdownMenuLabel>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4" /> ویرایش
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onAskDelete(s.id)}>
                <Trash2 className="h-4 w-4" /> حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </PanelAction>
      </PanelHeader>
      <PanelContent className="flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant={
              s.state === "CANCELLED"
                ? "destructive"
                : s.state === "COMPLETED"
                ? "secondary"
                : "default"
            }>
            {SessionStateEnum.t(s.state)}
          </Badge>
          {s.teamScopeId ? (
            <Badge variant="outline" className="text-[11px]">
              <Users className="h-3 w-3" /> تیم #{s.teamScopeId}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[11px]">
              کل سازمان
            </Badge>
          )}
          <Badge variant="outline" className="text-[11px]">
            <Hash className="h-3 w-3" /> شناسه #{s.id}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1.5">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(s.startAt).toLocaleString("fa-IR")} →{" "}
            {new Date(s.endAt).toLocaleString("fa-IR")}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> {tplName}
          </span>
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" /> {orgName}
          </span>
          {s.description ? (
            <span className="flex items-center gap-1 col-span-full">
              <FileText className="h-3 w-3" />
              <span className="line-clamp-2">{s.description}</span>
            </span>
          ) : null}
        </div>
      </PanelContent>
    </Panel>
  );
}
