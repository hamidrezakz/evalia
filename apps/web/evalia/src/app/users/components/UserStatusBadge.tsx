import { cn } from "@/lib/utils";

export function UserStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const color =
    status === "ACTIVE"
      ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20"
      : status === "PENDING"
      ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
      : status === "BLOCKED"
      ? "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20"
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
