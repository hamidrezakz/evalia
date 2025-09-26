"use client";
import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
          variant="outline"
          size="sm"
          className={"h-7 px-2 gap-1 text-[11px] " + (className || "")}
          onClick={(e) => e.stopPropagation()}>
          <span className="inline-flex items-center gap-1">
            <span className="text-muted-foreground">نقش‌ها:</span>
            <Badge
              variant={hasAny ? "secondary" : "outline"}
              className="h-5 px-1 text-[10px] ltr:font-mono">
              {local?.length ?? 0}
            </Badge>
          </span>
          <ChevronDown
            className={`h-3 w-3 opacity-60 ${open ? "rotate-180" : ""}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48 p-1 text-[12px]">
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
              }}>
              <span className="text-[12px]">{o.label}</span>
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
