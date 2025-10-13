"use client";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TemplateStateBadge,
  OrganizationStatusBadge,
} from "@/components/status-badges";
import { OrgPlanBadge } from "@/components/status-badges";
import { parseJalali, formatJalali } from "@/lib/jalali-date";
import type {
  Template,
  TemplateState,
} from "@/assessment/types/templates.types";
import { Hash, CalendarDays, Clock, FileText, Building2 } from "lucide-react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelAction,
  PanelContent,
} from "@/components/ui/panel";
import TemplateActionsMenu from "./TemplateActionsMenu";
import TemplateStateDropdown from "./TemplateStateDropdown";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";
import { useAvatarImage } from "@/users/api/useAvatarImage";

export interface TemplateInfoCardProps {
  template: Template;
  orgName: string;
  orgAvatarSrc?: string | null;
  orgInitials?: string;
  orgPlan?: string | null;
  orgStatus?: string | null;
  onEdit: () => void;
  onChangeState: (state: TemplateState) => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function TemplateInfoCard({
  template,
  orgName,
  orgAvatarSrc,
  orgInitials = "",
  orgPlan,
  orgStatus,
  onEdit,
  onChangeState,
  onDelete,
  isDeleting,
}: TemplateInfoCardProps) {
  // Prefer the template owner organization derived from createdByOrganizationId
  const ownerOrgId = (template as any).createdByOrganizationId as
    | number
    | undefined;
  const ownerOrgQ = useOrganization(ownerOrgId || null, true);
  const owner = (ownerOrgQ.data as any) || null;
  const finalOrgName = owner?.name || orgName;
  const finalPlan = owner?.plan || orgPlan || null;
  const finalStatus = owner?.status || orgStatus || null;
  const { src: finalAvatarSrc } = useAvatarImage(
    owner?.avatarUrl || orgAvatarSrc || null
  );
  const finalInitials = (finalOrgName || "").slice(0, 2) || orgInitials;
  return (
    <Panel className="card-surface card-surface-focus mt-2">
      <PanelHeader className="flex-row items-center justify-between gap-2">
        <PanelTitle className="text-sm flex items-center gap-2 min-w-0 font-semibold">
          <span className="truncate" title={template.name}>
            {template.name}
          </span>
          <TemplateStateDropdown
            value={template.state}
            onChange={onChangeState}
          />
        </PanelTitle>
        <PanelAction>
          <TemplateActionsMenu
            template={template}
            onEdit={onEdit}
            onChangeState={onChangeState}
            onDelete={onDelete}
            isDeleting={!!isDeleting}
          />
        </PanelAction>
      </PanelHeader>
      <PanelContent className="min-w-full">
        <div className="space-y-1 text-[11px] w-full">
          <div className="flex items-center gap-2">
            <Hash className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">شناسه:</span>
            <span className="ltr:font-mono direction-ltr">{template.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">ایجاد:</span>
            <span className="ltr:font-mono direction-ltr">
              {formatJalali(parseJalali(template.createdAt))}
            </span>
          </div>
          {template.updatedAt ? (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">به‌روزرسانی:</span>
              <span className="ltr:font-mono direction-ltr">
                {formatJalali(parseJalali(template.updatedAt), true)}
              </span>
            </div>
          ) : null}
          {/* Organization box */}
          <div className="rounded-md border bg-muted/40 p-2 mt-4 min-w-full">
            {/* Row 0: label */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
              <Building2 className="h-3 w-3" />
              <span>سازمان مالک</span>
            </div>
            {/* Row 1: identity (avatar + name) */}
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-5 w-5">
                {finalAvatarSrc ? (
                  <AvatarImage
                    src={finalAvatarSrc || undefined}
                    alt={finalOrgName}
                  />
                ) : null}
                <AvatarFallback className="text-[9px]">
                  {finalInitials}
                </AvatarFallback>
              </Avatar>
              <span
                className="truncate font-bold text-[12px]"
                title={finalOrgName}>
                {finalOrgName}
              </span>
            </div>
            {/* Row 2: badges (wrap) */}
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              {finalStatus ? (
                <OrganizationStatusBadge
                  status={finalStatus as any}
                  size="xs"
                />
              ) : null}
              {finalPlan ? (
                <OrgPlanBadge plan={finalPlan as any} size="xs" tone="soft" />
              ) : null}
            </div>
          </div>
        </div>

        {template.description ? (
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>توضیحات</span>
            </div>
            <div
              className="text-[12px] text-muted-foreground/90 leading-relaxed line-clamp-3"
              title={template.description || undefined}>
              {template.description}
            </div>
          </div>
        ) : null}
      </PanelContent>
    </Panel>
  );
}

export default TemplateInfoCard;
