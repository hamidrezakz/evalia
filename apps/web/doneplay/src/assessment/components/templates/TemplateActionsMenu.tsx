"use client";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Edit2,
  PlayCircle,
  Pencil,
  Lock,
  Archive,
  Trash2,
} from "lucide-react";
import type { Template } from "@/assessment/types/templates.types";
import { TemplateStateBadge } from "@/components/status-badges";

export interface TemplateActionsMenuProps {
  template: Template;
  onEdit: () => void;
  onChangeState: (state: "ACTIVE" | "DRAFT" | "CLOSED" | "ARCHIVED") => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function TemplateActionsMenu({
  template,
  onEdit,
  onChangeState,
  onDelete,
  isDeleting,
}: TemplateActionsMenuProps) {
  return (
    <div className="flex items-center justify-end">
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            icon={<MoreVertical className="h-4 w-4" />}
            iconPosition="left"></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-52">
          <DropdownMenuLabel>اقدامات</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onEdit}>
            <Edit2 className="h-4 w-4" /> ویرایش
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>تغییر وضعیت</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onChangeState("ACTIVE")}>
            <TemplateStateBadge state="ACTIVE" size="xs" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeState("DRAFT")}>
            <TemplateStateBadge state="DRAFT" size="xs" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeState("CLOSED")}>
            <TemplateStateBadge state="CLOSED" size="xs" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeState("ARCHIVED")}>
            <TemplateStateBadge state="ARCHIVED" size="xs" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={onDelete}
            disabled={!!isDeleting}>
            <Trash2 className="h-4 w-4" /> حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default TemplateActionsMenu;
