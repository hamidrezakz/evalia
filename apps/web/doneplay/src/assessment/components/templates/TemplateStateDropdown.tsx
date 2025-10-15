"use client";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TemplateStateBadge } from "@/components/status-badges";
import type { TemplateState } from "@/assessment/types/templates.types";
import { ChevronDown } from "lucide-react";

export interface TemplateStateDropdownProps {
  value: TemplateState;
  onChange: (state: TemplateState) => void;
}

export function TemplateStateDropdown({
  value,
  onChange,
}: TemplateStateDropdownProps) {
  // Open on click; hover-to-open UX can be handled by trigger styling/tooling later if needed
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <DropdownMenu dir="rtl" open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="inline-flex items-center gap-1">
          <TemplateStateBadge state={value} size="xs" />
          <ChevronDown
            className={`h-3 w-3 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        <DropdownMenuItem onClick={() => onChange("ACTIVE")}>
          <TemplateStateBadge state="ACTIVE" size="xs" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("DRAFT")}>
          <TemplateStateBadge state="DRAFT" size="xs" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("CLOSED")}>
          <TemplateStateBadge state="CLOSED" size="xs" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("ARCHIVED")}>
          <TemplateStateBadge state="ARCHIVED" size="xs" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TemplateStateDropdown;
