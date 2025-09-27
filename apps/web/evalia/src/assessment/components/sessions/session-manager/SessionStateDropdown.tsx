import * as React from "react";

import {
  Check,
  ChevronDown,
  PlayCircle,
  CalendarCheck,
  BarChart2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

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

  const iconMap: Record<string, React.ReactNode> = {
    SCHEDULED: <CalendarCheck className="h-3.5 w-3.5 text-sky-500" />,
    IN_PROGRESS: <PlayCircle className="h-3.5 w-3.5 text-emerald-500" />,
    ANALYZING: <BarChart2 className="h-3.5 w-3.5 text-violet-500" />,
    COMPLETED: <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />,
    CANCELLED: <XCircle className="h-3.5 w-3.5 text-zinc-500" />,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 border-none text-[11px] font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md px-1.5 py-0.5 hover:bg-muted/50 transition"
          )}>
          <SessionStateBadge state={value} tone={tone} size="xs" />
          <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56" align="end">
        {SessionStateEnum.values.map((option) => {
          const isActive = option === value;
          const label = SessionStateEnum.t(option);
          return (
            <DropdownMenuItem
              key={option}
              onClick={(event) => {
                event.preventDefault();
                handleSelect(option);
              }}
              className={cn(
                "flex items-center gap-3 pr-2 pl-3 py-2 text-xs",
                isActive && "bg-primary/5"
              )}>
              <span className="flex items-center justify-center h-6 w-6 rounded-md bg-muted/60">
                {iconMap[option] || <Clock className="h-3.5 w-3.5" />}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium leading-none">{label}</span>
                <span className="text-[10px] text-muted-foreground/70">
                  {option}
                </span>
              </div>
              <div className="ms-auto flex items-center gap-2">
                <SessionStateBadge
                  state={option}
                  tone={isActive ? "solid" : "soft"}
                  size="xs"
                />
                {isActive ? (
                  <Check className="h-3.5 w-3.5 text-muted-foreground" />
                ) : null}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SessionStateDropdown;
