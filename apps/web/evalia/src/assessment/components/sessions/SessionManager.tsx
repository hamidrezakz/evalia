"use client";
import * as React from "react";
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
  useUpdateSession,
} from "@/assessment/api/templates-hooks";
import {
  useOrganization,
  useOrganizations,
} from "@/organizations/organization/api/organization-hooks";
import { Panel, PanelContent } from "@/components/ui/panel";
import QuickAssignmentDialog from "./QuickAssignmentDialog";
import SessionManagerHeader from "./session-manager/SessionManagerHeader";
import SessionCard from "./session-manager/SessionCard";
import SessionCardSkeleton from "./session-manager/SessionCardSkeleton";
import SessionsEmptyState from "./session-manager/SessionsEmptyState";

// ---------------- Manager ----------------
export default function SessionManager({
  organizationId,
}: {
  organizationId?: number;
}) {
  const isScoped = !!organizationId;
  const [selectedOrgId, setSelectedOrgId] = React.useState<number | null>(
    organizationId || null
  );
  React.useEffect(
    () => setSelectedOrgId(organizationId || null),
    [organizationId]
  );

  // Fetch scoped org name when in scoped mode to display it instead of combobox
  const scopedOrgQ = useOrganization(isScoped ? organizationId! : null);

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
        <SessionManagerHeader
          isScoped={isScoped}
          filteredCount={filteredSessions.length}
          stateFilters={stateFilters}
          onStateFiltersChange={(filters) => setStateFilters(filters)}
          toolbarOpen={toolbarOpen}
          onToolbarToggle={() => setToolbarOpen((o) => !o)}
          search={search}
          onSearchChange={(value) => setSearch(value)}
          selectedOrgId={selectedOrgId}
          onOrganizationChange={(id) => setSelectedOrgId(id)}
          scopedOrganizationName={scopedOrgQ.data?.name}
          canCreateSession={!isScoped}
          onCreateSession={handleCreate}
          onClearFilters={() => setStateFilters([])}
          organizationLoading={userOrgsQ.isLoading}
        />
        <PanelContent className="p-4 flex flex-col gap-4">
          {updateError ? (
            <div className="text-sm text-rose-600">{updateError}</div>
          ) : null}
          <div
            className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            data-testid="sessions-grid">
            {sessionsQ.isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <SessionCardSkeleton key={index} />
              ))}
            {!sessionsQ.isLoading && filteredSessions.length === 0 && (
              <SessionsEmptyState
                canCreateSession={!isScoped}
                onResetFilters={() => {
                  setSearch("");
                  setStateFilters([]);
                }}
                onCreateSession={handleCreate}
              />
            )}
            {!sessionsQ.isLoading &&
              filteredSessions.map((s: any) => (
                <SessionCard
                  key={s.id}
                  session={s}
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
