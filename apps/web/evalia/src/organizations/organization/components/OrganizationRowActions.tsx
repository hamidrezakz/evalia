"use client";
import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface OrganizationRowActionsProps {
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function OrganizationRowActions({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: OrganizationRowActionsProps) {
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="More">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44" sideOffset={4}>
        <div className="px-2 pt-1 pb-1.5 text-[11px] font-medium text-muted-foreground select-none">
          عملیات سازمان
        </div>
        <DropdownMenuSeparator />
        {canEdit && (
          <DropdownMenuItem onClick={onEdit}>ویرایش سازمان</DropdownMenuItem>
        )}
        {canDelete && (
          <>
            {canEdit && <DropdownMenuSeparator />}
            <DropdownMenuItem className="text-rose-600" onClick={onDelete}>
              حذف سازمان
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
