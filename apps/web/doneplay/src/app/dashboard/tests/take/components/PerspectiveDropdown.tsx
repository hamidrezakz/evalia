"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { UserCircle2, ChevronDown } from "lucide-react";
import { ResponsePerspectiveEnum } from "@/lib/enums";
import { ResponsePerspectiveBadge } from "@/components/status-badges";

interface Props {
  perspectives: string[] | null | undefined;
  active: string | null;
  onChange: (p: string) => void;
  disabled?: boolean;
}

export function PerspectiveDropdown({
  perspectives,
  active,
  onChange,
  disabled,
}: Props) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenu dir="rtl" open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <span
          role="button"
          aria-label="انتخاب پرسپکتیو"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-disabled={disabled ? true : undefined}
          tabIndex={disabled ? -1 : 0}
          className={`inline-flex items-center gap-1 h-8 text-xs select-none outline-none ${
            disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"
          }`}>
          {active ? (
            <ResponsePerspectiveBadge
              value={active as any}
              tone="soft"
              size="xs"
            />
          ) : (
            <span>انتخاب پرسپکتیو</span>
          )}
          <ChevronDown
            className={`size-3 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48" sideOffset={6}>
        <DropdownMenuLabel className="relative text-[11px] pr-1">
          <span className="absolute -left-1 -top-1 opacity-10 pointer-events-none">
            <UserCircle2 className="size-5" />
          </span>
          انتخاب پرسپکتیو
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {perspectives?.length ? (
          perspectives.map((p) => (
            <DropdownMenuItem
              key={p}
              onClick={() => onChange(p)}
              className="text-[12px] flex items-center gap-2">
              <ResponsePerspectiveBadge
                value={p as any}
                tone="soft"
                size="xs"
              />
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-2 py-1 text-[11px] text-muted-foreground">
            موردی موجود نیست
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
