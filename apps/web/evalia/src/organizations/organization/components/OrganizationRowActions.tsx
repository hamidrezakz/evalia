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
  canSuspend?: boolean;
  canActivate?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  onEdit?: () => void;
  onSuspend?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
}

export function OrganizationRowActions({
  canEdit,
  canSuspend,
  canActivate,
  canDelete,
  canRestore,
  onEdit,
  onSuspend,
  onActivate,
  onDelete,
  onRestore,
}: OrganizationRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="More">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>اقدامات</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {canEdit && (
          <DropdownMenuItem onClick={onEdit}>ویرایش</DropdownMenuItem>
        )}
        {canSuspend && (
          <DropdownMenuItem onClick={onSuspend}>تعلیق</DropdownMenuItem>
        )}
        {canActivate && (
          <DropdownMenuItem onClick={onActivate}>فعال‌سازی</DropdownMenuItem>
        )}
        {canRestore && (
          <DropdownMenuItem onClick={onRestore}>بازیابی</DropdownMenuItem>
        )}
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-rose-600" onClick={onDelete}>
              حذف
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
