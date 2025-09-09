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

export interface UsersRowActionsProps {
  canEdit?: boolean;
  canBlock?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onBlock?: () => void;
  onDelete?: () => void;
}

export function UsersRowActions({
  canEdit,
  canBlock,
  canDelete,
  onEdit,
  onBlock,
  onDelete,
}: UsersRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="More">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>اقدامات</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {canEdit && (
          <DropdownMenuItem onClick={onEdit}>ویرایش</DropdownMenuItem>
        )}
        {canBlock && (
          <DropdownMenuItem onClick={onBlock}>مسدود کردن</DropdownMenuItem>
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
