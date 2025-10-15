"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Users, UserCheck, Globe } from "lucide-react";

export type InviteLinkStatus = "active" | "expired" | "disabled" | "exhausted";

const baseBadge =
  "px-1 py-0.5 rounded-md border text-[10px] inline-flex items-center gap-1 transition-colors";

export function InviteLinkStatusBadge({
  status,
}: {
  status: InviteLinkStatus;
}) {
  const classes =
    status === "active"
      ? "border-emerald-500/40 text-emerald-700 bg-emerald-100/50 dark:text-emerald-300 dark:bg-emerald-900/40"
      : status === "expired"
      ? "border-amber-500/40 text-amber-700 bg-amber-100/50 dark:text-amber-300 dark:bg-amber-900/40"
      : status === "disabled"
      ? "border-slate-400/40 text-slate-700 bg-slate-100/50 dark:text-slate-300 dark:bg-slate-900/40"
      : "border-rose-500/40 text-rose-700 bg-rose-100/50 dark:text-rose-300 dark:bg-rose-900/40";
  return (
    <span className={cn(baseBadge, classes)}>
      {status === "active"
        ? "فعال"
        : status === "expired"
        ? "منقضی"
        : status === "disabled"
        ? "غیرفعال"
        : "اتمام"}
    </span>
  );
}

export function AutoJoinBadge() {
  return (
    <span
      className={cn(
        baseBadge,
        "border-sky-500/40 text-sky-700 bg-sky-100/50 dark:text-sky-300 dark:bg-sky-900/40"
      )}>
      <Users className="h-3 w-3" /> عضویت خودکار
    </span>
  );
}

export function AutoAssignSelfBadge() {
  return (
    <span
      className={cn(
        baseBadge,
        "border-violet-500/40 text-violet-700 bg-violet-100/50 dark:text-violet-300 dark:bg-violet-900/40"
      )}>
      <UserCheck className="h-3 w-3" /> تخصیص SELF
    </span>
  );
}

export function DomainsBadge({ count }: { count: number }) {
  return (
    <span
      className={cn(
        baseBadge,
        "border-amber-500/40 text-amber-700 bg-amber-100/50 dark:text-amber-300 dark:bg-amber-900/40"
      )}>
      <Globe className="h-3 w-3" /> دامنه‌ها: {count}
    </span>
  );
}
