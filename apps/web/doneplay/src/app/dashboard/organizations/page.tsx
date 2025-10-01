"use client";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { Building2 } from "lucide-react";
import { OrganizationsList } from "@/organizations/organization/components/OrganizationsList";

export default function DashboardOrganizationsPage() {
  return (
    <div className="w-full space-y-4" dir="rtl">
      <Panel>
        <PanelHeader className="border-b">
          <PanelTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" /> مدیریت کل سازمان‌ها
          </PanelTitle>
          <PanelDescription>
            تمام جستجو، مشاهده جزئیات، تغییر وضعیت (فعال / تعلیق / آرشیو) و مدیریت
            پلن سازمان‌ها.
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="block">
          <OrganizationsList
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
