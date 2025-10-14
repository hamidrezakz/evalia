"use client";
import * as React from "react";
import { Link as LinkIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SessionInviteLinksMenuItem({
  onSelect,
}: {
  onSelect: () => void;
}) {
  return (
    <DropdownMenuItem onClick={onSelect} className="flex items-center gap-2">
      <LinkIcon className="h-4 w-4" />
      <span className="text-[12px]">لینک‌های دعوت</span>
    </DropdownMenuItem>
  );
}
