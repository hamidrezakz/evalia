"use client";
import * as React from "react";
import { useUser } from "../api/users-hooks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserStatusBadge } from "./UserStatusBadge";

export interface UserDetailSheetProps {
  orgId?: number; // for future org-scoped actions
  userId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailSheet({
  userId,
  open,
  onOpenChange,
}: UserDetailSheetProps) {
  const { data, isLoading, isError } = useUser(userId);

  const name = data?.fullName || "—";
  const email = data?.email || "—";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>کاربر</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-6">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">
              در حال بارگذاری…
            </div>
          ) : isError ? (
            <div className="text-sm text-rose-600">
              خطا در دریافت اطلاعات کاربر
            </div>
          ) : data ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback>
                    {(name || email).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-lg">{name}</span>
                  <span className="text-muted-foreground text-sm">{email}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UserStatusBadge status={data.status} />
                <span className="text-xs text-muted-foreground">
                  شناسه: #{data.id}
                </span>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2">سازمان‌ها</div>
                <div className="flex flex-wrap gap-1">
                  {data.organizations?.map((o) => (
                    <span
                      key={o.orgId}
                      className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
                      {o.orgId} •{" "}
                      {Array.isArray(o.roles) ? o.roles.join(", ") : o.roles}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">تیم‌ها</div>
                <div className="flex flex-wrap gap-1">
                  {data.teams?.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
