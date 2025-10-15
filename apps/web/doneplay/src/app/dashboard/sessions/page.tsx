"use client";
import * as React from "react";
import { SessionManager } from "@/assessment/components/sessions";
import { useOrgState } from "@/organizations/organization/context/org-context";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { CalendarRange } from "lucide-react";

export default function SessionsPage() {
  const { activeOrganizationId } = useOrgState();
  return (
    <div className="space-y-4" dir="rtl">
      <Panel>
        <PanelHeader className="border-b">
          <PanelTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="h-4 w-4 text-primary" /> جلسات ارزیابی
          </PanelTitle>
          <PanelDescription>
            نمایش و مدیریت جلسات سازمان فعال
            {activeOrganizationId ? ` (#${activeOrganizationId})` : ""}. برای
            تغییر، سازمان فعال را از بالای سیستم عوض کنید.
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="block p-1 md:p-2">
          <SessionManager />
        </PanelContent>
      </Panel>
    </div>
  );
}
