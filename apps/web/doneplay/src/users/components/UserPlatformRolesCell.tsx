"use client";
import * as React from "react";
import { Check, ChevronDown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { PlatformRoleBadge } from "@/components/status-badges";
import { PlatformRoleEnum } from "@/lib/enums";
import { updateUser } from "@/users/api/users.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersKeys } from "@/users/api/users-query-keys";

export default function UserPlatformRolesCell({
  userId,
  roles,
  className,
}: {
  userId: number;
  roles: string[];
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [local, setLocal] = React.useState<string[]>(roles || []);
  const hoverCloseTimer = React.useRef<number | null>(null);
  const openMenu = React.useCallback(() => {
    if (hoverCloseTimer.current) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
    setOpen(true);
  }, []);
  const scheduleCloseMenu = React.useCallback(() => {
    if (hoverCloseTimer.current) window.clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = window.setTimeout(() => setOpen(false), 150);
  }, []);
  const qc = useQueryClient();
  React.useEffect(() => setLocal(roles || []), [roles]);

  const mut = useMutation({
    mutationFn: async (next: string[]) => {
      const unique = Array.from(new Set(next));
      return updateUser(userId, { globalRoles: unique });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });

  const opts = PlatformRoleEnum.options();
  const hasAny = local && local.length > 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="ویرایش نقش‌های پلتفرم"
          variant="outline"
          size="icon"
          className={"h-7 w-7 relative " + (className || "")}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleCloseMenu}>
          <Shield className="size-3.5" />
          <span
            className={`absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full text-[10px] min-w-4 h-4 px-1 ${
              hasAny
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}>
            {local?.length ?? 0}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-56 p-1 text-[12px]"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleCloseMenu}>
        <DropdownMenuLabel className="text-[11px] text-muted-foreground flex items-center gap-2">
          <Shield className="size-3.5" /> نقش‌های پلتفرم
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {opts.map((o) => {
          const checked = local.includes(o.value);
          return (
            <DropdownMenuCheckboxItem
              key={o.value}
              checked={checked}
              onCheckedChange={(v) => {
                const next = v
                  ? Array.from(new Set([...(local || []), o.value]))
                  : (local || []).filter((x) => x !== o.value);
                setLocal(next);
                mut.mutate(next);
              }}
              className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PlatformRoleBadge
                  role={o.value as any}
                  active={checked}
                  tone={checked ? "solid" : "soft"}
                  size="xs"
                />
              </div>
            </DropdownMenuCheckboxItem>
          );
        })}
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-[10px] text-muted-foreground">
          برای اعمال سریع، روی گزینه‌ها تیک بزنید/بردارید.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
