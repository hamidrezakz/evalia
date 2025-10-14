"use client";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Power,
  Users,
  UserCheck,
  Tag,
  Hash,
  Calendar,
} from "lucide-react";

export type InviteLinkActionMenuProps = {
  onToggleEnabled?: () => void;
  enabled?: boolean;
  onToggleAutoJoin?: () => void;
  autoJoinOrg?: boolean;
  onToggleAutoAssign?: () => void;
  autoAssignSelf?: boolean;
  onEditLabel?: () => void;
  onEditMaxUses?: () => void;
  onEditExpiry?: () => void;
  size?: "sm" | "md";
};

export function InviteLinkActionMenu(props: InviteLinkActionMenuProps) {
  const size = props.size || "sm";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={size === "sm" ? "h-7 w-7" : "h-8 w-8"}>
          <MoreHorizontal className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 rtl:text-right">
        <DropdownMenuLabel>ویرایش لینک</DropdownMenuLabel>
        <DropdownMenuItem onClick={props.onToggleEnabled}>
          <Power className="h-4 w-4 ml-2" />
          {props.enabled ? "غیرفعال کن" : "فعال کن"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={props.onToggleAutoJoin}>
          <Users className="h-4 w-4 ml-2" />
          عضویت خودکار: {props.autoJoinOrg ? "روشن" : "خاموش"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={props.onToggleAutoAssign}>
          <UserCheck className="h-4 w-4 ml-2" />
          تخصیص SELF: {props.autoAssignSelf ? "روشن" : "خاموش"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={props.onEditLabel}>
          <Tag className="h-4 w-4 ml-2" />
          تغییر برچسب
        </DropdownMenuItem>
        <DropdownMenuItem onClick={props.onEditMaxUses}>
          <Hash className="h-4 w-4 ml-2" />
          تغییر تعداد مجاز
        </DropdownMenuItem>
        <DropdownMenuItem onClick={props.onEditExpiry}>
          <Calendar className="h-4 w-4 ml-2" />
          تغییر تاریخ انقضا
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
