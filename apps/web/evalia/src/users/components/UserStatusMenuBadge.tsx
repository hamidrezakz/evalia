"use client";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserStatusEnum } from "@/lib/enums";
import { updateUser } from "@/users/api/users.api";
import { useUpdateUser } from "@/users/api/users-hooks";
import { ChevronDown } from "lucide-react";

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
          <UserStatusBadge status={pending || status} />
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
        {UserStatusEnum.options().map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(opt.value);
            }}
            className="text-[12px]">
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserStatusMenuBadge;
