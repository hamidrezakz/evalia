"use client";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { GitBranch } from "lucide-react";
import { OrganizationsList } from "@/organizations/organization/components/OrganizationsList";

export default function DashboardMyChildrenOrganizationsPage() {
  return (
    <div className="w-full space-y-4" dir="rtl">
      <Panel>
        <PanelHeader className="border-b">
          <PanelTitle className="flex items-center gap-2 text-base">
            <GitBranch className="h-4 w-4 text-primary" />
            مدیریت سازمان‌های زیرمجموعه (سازمان فعال)
          </PanelTitle>
          <PanelDescription>
            در این صفحه تنها سازمان‌های زیرمجموعه سازمان فعال شما نمایش داده
            می‌شود.
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="block">
          <OrganizationsList
            parentSelectionMode="active-only"
            initialQuery={{ q: "", page: 1, pageSize: 20 }}
            canEdit={() => true}
            canSuspend={() => true}
            canActivate={() => true}
            canDelete={() => true}
            canRestore={() => true}
          />
        </PanelContent>
      </Panel>
    </div>
  );
}
