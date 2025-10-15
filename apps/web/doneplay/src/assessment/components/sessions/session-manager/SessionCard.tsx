"use client";
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
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  formatJalali,
  parseJalali,
  formatJalaliRelative,
} from "@/lib/jalali-date";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";
import { useTemplate } from "@/assessment/api/templates-hooks"; // template hooks remain here
import { useSessionQuestionCount } from "@/assessment/api/sessions-hooks";
import { useOrgState } from "@/organizations/organization/context";
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
import SessionInviteLinksDialog from "@/assessment/components/invite-links/SessionInviteLinksDialog";
import { SessionInviteLinksMenuItem } from "@/assessment/components/invite-links/SessionInviteLinksMenuItem";
import { composeBadgeClass } from "@/components/status-badges";
import SessionStateDropdown from "./SessionStateDropdown";
import {
  Panel,
  PanelHeader,
  PanelContent,
  PanelAction,
  PanelTitle,
  PanelDescription,
} from "@/components/ui/panel";

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
  const orgCtx = useOrgState();
  const activeOrgId =
    orgCtx.activeOrganizationId || session.organizationId || null;
  const orgQ = useOrganization(session.organizationId ?? null);
  const tplQ = useTemplate(activeOrgId, session.templateId ?? null);
  const questionCountQuery = useSessionQuestionCount(
    activeOrgId,
    session.id ?? null
  );
  // Defer question count to avoid SSR/CSR mismatch when query resolves only on client
  const [questionCount, setQuestionCount] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (typeof questionCountQuery.data?.total === "number") {
      setQuestionCount(questionCountQuery.data.total);
    }
  }, [questionCountQuery.data?.total]);

  const [orgName, setOrgName] = React.useState<string>(
    `سازمان #${session.organizationId}`
  );
  React.useEffect(() => {
    if (
      typeof orgQ.data?.name === "string" &&
      orgQ.data.name.trim().length > 0
    ) {
      setOrgName(orgQ.data.name);
    }
  }, [orgQ.data?.name]);

  const [tplName, setTplName] = React.useState<string>(
    `تمپلیت #${session.templateId}`
  );
  React.useEffect(() => {
    const templateData = tplQ.data as { name?: string | null } | undefined;
    if (
      typeof templateData?.name === "string" &&
      templateData.name.trim().length > 0
    ) {
      setTplName(templateData.name);
    }
  }, [tplQ.data]);

  let startStr: string | null = null;
  let endStr: string | null = null;

  try {
    startStr = formatJalali(parseJalali(session.startAt), true);
    endStr = formatJalali(parseJalali(session.endAt), true);
  } catch {
    // ignore parse errors and fall back to raw values
  }

  // Relative time is unstable between server & client (time passes between render phases)
  // We compute it after mount to avoid hydration mismatches.
  const [rel, setRel] = React.useState<string | null>(null);
  React.useEffect(() => {
    setRel(formatJalaliRelative(session.startAt, { futureMode: "relative" }));
  }, [session.startAt]);

  // Removed per new unified card styling (we no longer show a colored border per state)
  const [inviteOpen, setInviteOpen] = React.useState(false);

  return (
    <>
      <Panel
        className={cn(
          "relative group overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-muted/50 backdrop-blur-sm shadow-sm hover:shadow-md transition"
        )}>
        <PanelHeader className="gap-3 pb-0">
          <div className="flex flex-col gap-1.5 min-w-0">
            <PanelTitle className="flex items-center gap-1.5 text-[13px]">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="truncate" title={session.name}>
                {session.name}
              </span>
            </PanelTitle>
            <PanelDescription className="flex flex-wrap items-center gap-1.5">
              <span
                className={composeBadgeClass("violet", { size: "xs" })}
                suppressHydrationWarning
                title={
                  questionCount !== null
                    ? `تعداد سوالات: ${questionCount}`
                    : "در حال بارگذاری سوالات"
                }>
                سوال: {questionCount ?? "…"}
              </span>
              <SessionStateDropdown
                state={session.state}
                onChange={onChangeState}
              />
              <span
                className="inline-flex items-center gap-1 rounded-md bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground/80"
                suppressHydrationWarning>
                <Calendar className="h-3 w-3" /> {rel || "…"}
              </span>
            </PanelDescription>
          </div>
          <PanelAction className="flex items-start gap-2">
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
                <SessionInviteLinksMenuItem
                  onSelect={() => setInviteOpen(true)}
                />
                <DropdownMenuSeparator />
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
          </PanelAction>
        </PanelHeader>
        <PanelContent className="flex flex-col gap-4 pt-3 text-[11px] leading-5 text-muted-foreground">
          <div className="grid gap-3 @2xl/panel-header:grid-cols-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Calendar className="h-3.5 w-3.5" />
              <span>{startStr || session.startAt}</span>
              <span className="opacity-60">→</span>
              <span>{endStr || session.endAt}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <FileText className="h-3.5 w-3.5" />
              <span
                className="font-medium text-foreground/90 truncate"
                title={tplName}>
                {tplName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate" title={orgName}>
                {orgName}
              </span>
            </div>
            {session.description ? (
              <div className="col-span-full">
                <div className="flex items-start gap-1.5">
                  <FileText className="h-3.5 w-3.5 mt-0.5" />
                  <p className="line-clamp-3 text-foreground/80">
                    {session.description}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <SessionParticipantsMenu
              session={session}
              onQuickAssign={onOpenQuickAssign}
              triggerClassName="h-6 px-2 text-[11px]"
            />
          </div>
        </PanelContent>
      </Panel>
      <SessionInviteLinksDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        organizationId={session.organizationId || activeOrgId}
        sessionId={session.id}
      />
    </>
  );
}
