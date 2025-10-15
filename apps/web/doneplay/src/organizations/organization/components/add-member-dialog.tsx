"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAddOrganizationMember } from "@/organizations/member/api/organization-membership-hooks";
import { UserSelectCombobox } from "@/globalcomboxs/UserSelectCombobox";
import { OrgRoleEnum } from "@/lib/enums";
import {
  OrgRoleBadge,
  OrganizationStatusBadge,
} from "@/components/status-badges";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";

export interface AddMemberDialogProps {
  orgId: number;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function AddMemberDialog({
  orgId,
  open,
  onOpenChange,
}: AddMemberDialogProps) {
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(
    null
  );
  const [roles, setRoles] = React.useState<string[]>([]);

  const addMemberMut = useAddOrganizationMember(orgId);
  const { data: org } = useOrganization(orgId, open); // fetch org details when dialog open

  function handleAdd() {
    if (!selectedUserId) return;
    addMemberMut.mutate(
      { userId: selectedUserId, roles: roles.length ? roles : undefined },
      {
        onSuccess: () => {
          setSelectedUserId(null);
          setRoles([]);
          onOpenChange(false);
        },
      }
    );
  }

  const roleOptions = OrgRoleEnum.options();

  function toggleRole(r: string) {
    setRoles((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2 flex-wrap">
            <span>افزودن عضو جدید به</span>
            {org ? (
              <span className="inline-flex items-center gap-1 max-w-[220px]">
                <span className="font-semibold truncate" title={org.name}>
                  {org.name}
                </span>
                <OrganizationStatusBadge
                  status={org.status as any}
                  tone="soft"
                  size="xs"
                />
              </span>
            ) : (
              <span className="opacity-60">سازمان…</span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-right">
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="member-user-combobox">
              انتخاب کاربر
            </Label>
            <UserSelectCombobox
              value={selectedUserId}
              onChange={(id) => setSelectedUserId(id)}
              placeholder="جستجوی نام، ایمیل یا تلفن..."
              pageSize={20}
              className="text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">نقش‌ها</Label>
            <div className="flex flex-wrap gap-1 rounded-md p-2 min-h-[42px]">
              {roleOptions.map((opt) => {
                const active = roles.includes(opt.value);
                return (
                  <OrgRoleBadge
                    key={opt.value}
                    role={opt.value as any}
                    active={active}
                    tone={active ? "solid" : "soft"}
                    size="xs"
                    className={cn(
                      "cursor-pointer select-none",
                      !active && "opacity-75 hover:opacity-100"
                    )}
                    onClick={() => toggleRole(opt.value)}
                    onKeyDown={(e: any) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleRole(opt.value);
                      }
                    }}
                    tabIndex={0}
                    aria-pressed={active}
                  />
                );
              })}
              {roles.length === 0 && (
                <span className="text-[10px] text-muted-foreground select-none">
                  (وارد نشده)
                </span>
              )}
            </div>
          </div>
          {addMemberMut.error && (
            <div className="text-[11px] text-rose-600">
              {(addMemberMut.error as any)?.message || "خطا"}
            </div>
          )}
        </div>
        <DialogFooter className="justify-start gap-2 pt-2">
          <Button
            size="sm"
            disabled={!selectedUserId || addMemberMut.isPending}
            onClick={handleAdd}>
            {addMemberMut.isPending ? "در حال ثبت..." : "افزودن"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={addMemberMut.isPending}>
            انصراف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddMemberDialog;
