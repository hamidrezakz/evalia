"use client";
import React from "react";
import { Button } from "@/components/ui/button";
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
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="inline-flex items-center gap-1 font-normal h-8"
          aria-label="انتخاب پرسپکتیو"
          aria-haspopup="menu">
          <UserCircle2 className="size-4" />
          <span className="text-xs">
            {active
              ? ResponsePerspectiveEnum.t(active as any)
              : "انتخاب پرسپکتیو"}
          </span>
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48" sideOffset={6}>
        <DropdownMenuLabel className="text-[11px]">
          انتخاب پرسپکتیو
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {perspectives?.length ? (
          perspectives.map((p) => (
            <DropdownMenuItem
              key={p}
              onClick={() => onChange(p)}
              className="text-[12px] flex items-center gap-2">
              <span>{ResponsePerspectiveEnum.t(p as any)}</span>
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
