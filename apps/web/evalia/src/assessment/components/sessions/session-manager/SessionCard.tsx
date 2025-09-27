import * as React from "react";

import {
  Pencil,
  Calendar,
  Users,
  Trash2,
  FileText,
  Building2,
  MoreVertical,
  Clock,
  Hash,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  formatJalali,
  parseJalali,
  formatJalaliRelative,
} from "@/lib/jalali-date";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";
import {
  useTemplate,
  useSessionQuestionCount,
} from "@/assessment/api/templates-hooks";
import type { SessionState } from "@/lib/enums";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import SessionParticipantsMenu from "../SessionParticipantsMenu";
import { composeBadgeClass } from "@/components/status-badges";
import SessionStateDropdown from "./SessionStateDropdown";

export interface SessionSummary {
  id: number;
  name: string;
  state: SessionState;
  organizationId?: number | null;
  templateId?: number | null;
  startAt: string;
  endAt: string;
  teamScopeId?: number | null;
  description?: string | null;
}

export type SessionCardProps = {
  session: SessionSummary;
  onEdit: () => void;
  onAskDelete: (id: number) => void;
  onChangeState: (state: SessionState) => void;
  onOpenQuickAssign: (session: SessionSummary) => void;
};

export default function SessionCard({
  session,
  onEdit,
  onAskDelete,
  onChangeState,
  onOpenQuickAssign,
}: SessionCardProps) {
  const orgQ = useOrganization(session.organizationId ?? null);
  const tplQ = useTemplate(session.templateId ?? null);

  const questionCountQuery = useSessionQuestionCount(session.id ?? null);
  const questionCount = questionCountQuery.data?.total ?? null;

  const orgName =
    (typeof orgQ.data?.name === "string" && orgQ.data.name.trim().length > 0
      ? orgQ.data.name
      : null) || `سازمان #${session.organizationId}`;

  const templateData = tplQ.data as { name?: string | null } | undefined;
  const tplName =
    (typeof templateData?.name === "string" &&
    templateData.name.trim().length > 0
      ? templateData.name
      : null) || `تمپلیت #${session.templateId}`;

  let startStr: string | null = null;
  let endStr: string | null = null;

  try {
    startStr = formatJalali(parseJalali(session.startAt), true);
    endStr = formatJalali(parseJalali(session.endAt), true);
  } catch {
    // ignore parse errors and fall back to raw values
  }

  const rel = formatJalaliRelative(session.startAt, { futureMode: "relative" });

  const stateColors: Partial<Record<SessionState, string>> = {
    SCHEDULED: "border-sky-400/40 hover:border-sky-500/60",
    IN_PROGRESS: "border-emerald-400/50 hover:border-emerald-500/70",
    ANALYZING: "border-violet-400/40 hover:border-violet-500/60",
    COMPLETED: "border-teal-400/50 hover:border-teal-500/70",
    CANCELLED: "border-zinc-400/40 hover:border-zinc-500/70 opacity-90",
  };

  const panelBorder =
    stateColors[session.state] ?? "border-border/50 hover:border-primary/50";

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-background/60 dark:bg-muted/40 transition-colors overflow-hidden p-0 flex flex-col shadow-sm hover:shadow-md",
        panelBorder
      )}>
      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-primary/70 to-primary/30 opacity-60 group-hover:opacity-100 transition" />
      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <h3 className="text-[13px] font-semibold flex items-center gap-1.5 mt-0.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {session.name}
              </h3>
              <SessionStateDropdown
                state={session.state}
                onChange={onChangeState}
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              {questionCount !== null && (
                <span
                  className={composeBadgeClass("violet", { size: "xs" })}
                  title={`تعداد سوالات: ${questionCount}`}>
                  سوال: {questionCount}
                </span>
              )}

              <span className="inline-flex items-center gap-1 rounded-md bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground/90">
                <Hash className="h-3 w-3" /> جلسه #{session.id}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground/90">
                <Calendar className="h-3 w-3" /> {rel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end">
            <SessionParticipantsMenu
              session={session}
              onQuickAssign={onOpenQuickAssign}
              triggerClassName="h-6 px-2 text-[11px]"
            />
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem onClick={() => onOpenQuickAssign(session)}>
                  <Users className="h-4 w-4" />
                  <span className="ms-2">دعوت سریع</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                  <span className="ms-2">ویرایش</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onAskDelete(session.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="ms-2">حذف</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid gap-2 text-[11px] text-muted-foreground leading-5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Calendar className="h-3.5 w-3.5" />
            <span>{startStr || session.startAt}</span>
            <span className="opacity-60">→</span>
            <span>{endStr || session.endAt}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <FileText className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground/90">{tplName}</span>
            </div>
            <span className="pl-5 text-[10px] text-muted-foreground/70">
              شناسه تمپلیت #{session.templateId}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Building2 className="h-3.5 w-3.5" />
            <span>{orgName}</span>
          </div>
          {session.description ? (
            <div className="flex items-start gap-1.5">
              <FileText className="h-3.5 w-3.5 mt-0.5" />
              <p className="line-clamp-3 text-foreground/80">
                {session.description}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
