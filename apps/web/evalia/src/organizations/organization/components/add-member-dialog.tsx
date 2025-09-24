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
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { useUsers } from "@/users/api/users-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { OrgRoleEnum } from "@/lib/enums"; // centralized enum with translations
import { Label } from "@/components/ui/label";
// Removed Select imports (multi-role chips implementation)
import { cn } from "@/lib/utils";
import { useAddOrganizationMember } from "@/organizations/member/api/organization-membership-hooks";

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
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(
    null
  );
  const [roles, setRoles] = React.useState<string[]>([]);
  const usersQ = useUsers({ q: search, pageSize: 20 });

  const addMemberMut = useAddOrganizationMember(orgId);

  function handleAdd() {
    if (!selectedUserId) return;
    addMemberMut.mutate(
      { userId: selectedUserId, roles: roles.length ? roles : undefined },
      {
        onSuccess: () => {
          // reset local form state
          setSelectedUserId(null);
          setRoles([]);
          setSearch("");
          onOpenChange(false);
        },
      }
    );
  }

  // Localized options from enum translator
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
            <Combobox<any>
              searchable
              items={usersQ.data?.data || []}
              value={selectedUserId}
              onChange={(v) => setSelectedUserId(v == null ? null : Number(v))}
              searchValue={search}
              onSearchChange={setSearch}
              loading={usersQ.isLoading}
              placeholder="جستجوی نام، ایمیل..."
              getKey={(u) => u.id}
              getLabel={(u) => u.fullName || u.email || `#${u.id}`}
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
