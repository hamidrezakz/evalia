"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { SessionStateEnum } from "@/lib/enums";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";

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

  const sessionsQ = useSessions({
    organizationId: orgIdProp || undefined,
    search,
  });
  const sessions = (sessionsQ.data?.data || [])
    .slice()
    .sort((a: any, b: any) => (a.startAt < b.startAt ? 1 : -1));

  const delMut = useDeleteSession();

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
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">مدیریت جلسات</h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="جستجوی جلسه"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-[220px]"
          />
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 ms-1" /> افزودن جلسه
          </Button>
        </div>
      </div>
      <Separator />

      <div className="grid grid-cols-1 gap-2">
        {sessionsQ.isLoading ? (
          <div className="text-sm text-muted-foreground">در حال بارگذاری…</div>
        ) : sessions.length === 0 ? (
          <div className="text-sm text-muted-foreground">جلسه‌ای یافت نشد.</div>
        ) : (
          sessions.map((s: any) => (
            <SessionCard
              key={s.id}
              s={s}
              onEdit={() => handleEdit(s)}
              onAskDelete={askDelete}
            />
          ))
        )}
      </div>

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
}: {
  s: any;
  onEdit: () => void;
  onAskDelete: (id: number) => void;
}) {
  const orgQ = useOrganization(s.organizationId ?? null);
  const tplQ = useTemplate(s.templateId ?? null);
  const orgName = orgQ.data?.name || `سازمان #${s.organizationId}`;
  const tplName = (tplQ.data as any)?.name || `تمپلیت #${s.templateId}`;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="font-medium">{s.name}</div>
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
          </div>
          <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(s.startAt).toLocaleString()} →{" "}
              {new Date(s.endAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> {tplName}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {orgName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4 ms-1" /> ویرایش
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onAskDelete(s.id)}>
            <Trash2 className="h-4 w-4 ms-1" /> حذف
          </Button>
        </div>
      </div>
    </Card>
  );
}
