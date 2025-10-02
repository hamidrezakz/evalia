"use client";
import * as React from "react";
import { Panel } from "@/components/ui/panel";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationMembers } from "@/organizations/member/api/organization-membership-hooks";
import { updateOrganizationMemberRoles } from "@/organizations/member/api/organization-membership.api";
import { organizationMembershipKeys } from "@/organizations/member/api/organization-membership-query-keys";
import { getUser } from "@/users/api/users.api";
import { useRemoveOrganizationMember } from "@/organizations/member/api/organization-membership-hooks";
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
import { FiltersBar } from "./active-org-members/FiltersBar";
import { MemberRow } from "./active-org-members/MemberRow";
import { ResultsCount } from "./active-org-members/ResultsCount";
import ActiveOrgMembersSkeleton from "./ActiveOrgMembersSkeleton";

export default function ActiveOrgMembers() {
  const { activeOrganizationId } = useOrgState();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [roleFilter, setRoleFilter] = React.useState<string[]>([]);
  const orgId = activeOrganizationId ?? 0;
  const qc = useQueryClient();

  // Fetch memberships (list returns plain array of {id, orgId, userId, roles})
  const membersQ = useOrganizationMembers(
    orgId,
    { page: 1, pageSize: 200 },
    !!orgId
  );

  // Enrich with user detail map to show phone/status and support searching by name/phone
  const [userMap, setUserMap] = React.useState<Map<number, any>>(new Map());
  React.useEffect(() => {
    const list = (membersQ.data || []) as Array<{ userId: number }>;
    const missing = list
      .map((m) => Number(m.userId))
      .filter((uid) => uid > 0 && !userMap.has(uid));
    if (!missing.length) return;
    let alive = true;
    (async () => {
      const fetched = await Promise.all(
        missing.map((uid) => getUser(uid).catch(() => null))
      );
      if (!alive) return;
      setUserMap((prev) => {
        const next = new Map(prev);
        missing.forEach((uid, idx) => {
          if (fetched[idx]) next.set(uid, fetched[idx]);
        });
        return next;
      });
    })();
    return () => {
      alive = false;
    };
  }, [membersQ.data]);

  // Role update mutation with centralized invalidation
  const updateRolesMut = useMutation({
    mutationFn: async ({
      membershipId,
      roles,
    }: {
      membershipId: number;
      roles: string[];
    }) => updateOrganizationMemberRoles(orgId, membershipId, { roles }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: organizationMembershipKeys.lists(orgId),
      });
    },
  });

  // Remove member hook + confirm dialog state
  const removeMemberMut = useRemoveOrganizationMember(orgId);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<{
    id: number;
    name?: string;
  } | null>(null);

  if (membersQ.isLoading) {
    return <ActiveOrgMembersSkeleton />;
  }

  return (
    <>
      <div className="space-y-3">
        <Panel className="p-4 dark:bg-transparent ring-1 ring-border/40 shadow mb-[-1rem]">
          <FiltersBar
            q={q}
            setQ={(v) => setQ(v)}
            status={status}
            setStatus={setStatus}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
          />
        </Panel>

        <Panel className="dark:bg-transparent bg-transparent @container">
          <ResultsCount
            count={
              ((membersQ.data as any[]) || [])
                .filter((m: any) =>
                  roleFilter.length
                    ? (m.roles || []).some((r: string) =>
                        roleFilter.includes(r)
                      )
                    : true
                )
                .filter((m: any) => {
                  if (!q && !status) return true;
                  const u = userMap.get(m.userId);
                  const name = u?.fullName || u?.name || "";
                  const phone = u?.phone || "";
                  const statusOk = status ? u?.status === status : true;
                  const qOk = q ? name.includes(q) || phone.includes(q) : true;
                  return statusOk && qOk;
                }).length
            }
          />
          <div className="flex flex-col gap-4">
            <div className="w-full" />
            <div
              className="member-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch"
              dir="rtl">
              {((membersQ.data as any[]) || [])
                .filter((m: any) =>
                  roleFilter.length
                    ? (m.roles || []).some((r: string) =>
                        roleFilter.includes(r)
                      )
                    : true
                )
                .filter((m: any) => {
                  if (!q && !status) return true;
                  const u = userMap.get(m.userId);
                  const name = u?.fullName || u?.name || "";
                  const phone = u?.phone || "";
                  const statusOk = status ? u?.status === status : true;
                  const qOk = q ? name.includes(q) || phone.includes(q) : true;
                  return statusOk && qOk;
                })
                .map((m: any) => (
                  <div key={m.id} className="w-full flex h-full">
                    <MemberRow
                      member={m}
                      user={userMap.get(m.userId)}
                      mutateRoles={(membershipId, roles) =>
                        updateRolesMut.mutate({ membershipId, roles })
                      }
                      onRemove={(membershipId, name) => {
                        setSelectedMember({ id: membershipId, name });
                        setConfirmOpen(true);
                      }}
                    />
                  </div>
                ))}
              {((membersQ.data as any[]) || []).length === 0 && (
                <div className="p-6 text-sm text-muted-foreground col-span-full text-center border border-dashed border-border/50 rounded-xl">
                  عضوی یافت نشد
                </div>
              )}
            </div>
          </div>
        </Panel>
      </div>
      {/* Confirm remove member dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف عضو سازمان؟</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedMember?.name ? (
                <>
                  آیا از حذف «{selectedMember?.name}» از سازمان مطمئن هستید؟ این
                  عملیات قابل بازگشت نیست و دسترسی‌های عضو حذف خواهد شد.
                </>
              ) : (
                <>آیا از حذف این عضو از سازمان مطمئن هستید؟</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                if (selectedMember) {
                  removeMemberMut.mutate(selectedMember.id);
                }
                setConfirmOpen(false);
                setSelectedMember(null);
              }}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
