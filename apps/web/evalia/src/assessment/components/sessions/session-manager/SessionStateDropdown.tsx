import * as React from "react";

import { Check, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionStateBadge, type Tone } from "@/components/status-badges";
import { SessionStateEnum, type SessionState } from "@/lib/enums";
import { cn } from "@/lib/utils";

export interface SessionStateDropdownProps {
  state: SessionState | null | undefined;
  onChange: (next: SessionState) => void | Promise<void>;
  disabled?: boolean;
  tone?: Tone;
}

export function SessionStateDropdown({
  state,
  onChange,
  disabled,
  tone = "soft",
}: SessionStateDropdownProps) {
  const value = SessionStateEnum.coerce(state ?? null);

  function handleSelect(next: SessionState) {
    if (disabled) return;
    onChange(next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 border-none text-[11px] font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          )}>
          <SessionStateBadge state={value} tone={tone} size="xs" />
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48" align="end">
        {SessionStateEnum.values.map((option) => {
          const isActive = option === value;
          return (
            <DropdownMenuItem
              key={option}
              onClick={(event) => {
                event.preventDefault();
                handleSelect(option);
              }}
              className="flex items-center justify-between gap-2 text-xs">
              <SessionStateBadge
                state={option}
                tone={isActive ? "solid" : "soft"}
                size="xs"
              />
              {isActive ? (
                <Check className="h-3.5 w-3.5 text-muted-foreground" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SessionStateDropdown;
