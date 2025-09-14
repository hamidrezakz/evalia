import { cn } from "@/lib/utils";
import type { Organization } from "../types/organization.types";

export function OrganizationStatusBadge({
  status,
  className,
}: {
  status: Organization["status"];
  className?: string;
}) {
  const color =
    status === "ACTIVE"
      ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20"
      : status === "SUSPENDED"
      ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
      : status === "INACTIVE"
      ? "bg-zinc-500/10 text-zinc-600 ring-1 ring-zinc-500/20"
      : "bg-zinc-500/10 text-zinc-600 ring-1 ring-zinc-500/20";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        color,
        className
      )}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
