"use client";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { UserStatusBadge } from "@/components/status-badges";
import { UserStatusEnum } from "@/lib/enums";
import { updateUser } from "@/users/api/users.api";
import { useUpdateUser } from "@/users/api/users-hooks";
import { ChevronDown, Check, CircleCheck } from "lucide-react";

export function UserStatusMenuBadge({
  userId,
  status,
}: {
  userId: number;
  status: string;
}) {
  const mutation = useUpdateUser(async ({ id, data }) => updateUser(id, data));
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<string | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  // Hover to open/close
  const onMouseEnter = () => setOpen(true);
  const onMouseLeave = (e: React.MouseEvent) => {
    // Close only if leaving the whole menu region
    const related = e.relatedTarget as Node | null;
    if (!related || !(e.currentTarget as Node).contains(related)) {
      setOpen(false);
    }
  };
  const onSelect = async (next: string) => {
    if (next === status) return;
    setPending(next);
    try {
      await mutation.mutateAsync({ id: userId, data: { status: next } });
    } finally {
      setPending(null);
      setOpen(false);
    }
  };
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex items-center gap-1"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={(e) => e.stopPropagation()}>
          <UserStatusBadge status={(pending || status) as any} />
          <ChevronDown
            className={
              "size-4 text-muted-foreground transition-transform duration-200 " +
              (open ? "rotate-180" : "rotate-0")
            }
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-48"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}>
        <DropdownMenuLabel className="text-[11px] text-muted-foreground flex items-center gap-2">
          <CircleCheck className="size-3.5" /> وضعیت کاربر
        </DropdownMenuLabel>
        {UserStatusEnum.options().map((opt) => {
          const isActive = (pending || status) === opt.value;
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(opt.value);
              }}
              className="text-[12px] flex items-center justify-between gap-2">
              <UserStatusBadge
                status={opt.value as any}
                tone={isActive ? "solid" : "soft"}
                size="xs"
              />
              {isActive && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserStatusMenuBadge;
