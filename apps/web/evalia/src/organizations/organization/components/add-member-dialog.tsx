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
import { UserSelectCombobox } from "@/users/components/UserSelectCombobox";
import { OrgRoleEnum } from "@/lib/enums";

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
          <DialogTitle className="text-sm">
            افزودن عضو جدید به سازمان #{orgId}
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
            <Label className="text-xs">نقش‌ها (اختیاری، چندتایی)</Label>
            <div className="flex flex-wrap gap-1 border rounded-md p-2 min-h-[42px] bg-muted/30">
              {roleOptions.map((opt) => {
                const active = roles.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => toggleRole(opt.value)}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] border transition-colors",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent border-muted-foreground/20"
                    )}>
                    {opt.label}
                  </button>
                );
              })}
              {roles.length === 0 && (
                <span className="text-[10px] text-muted-foreground select-none">
                  حداقل یک نقش (اختیاری)
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
