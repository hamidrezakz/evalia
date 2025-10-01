"use client";
import * as React from "react";
import { SessionManager } from "@/assessment/components/sessions";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { CalendarRange } from "lucide-react";

export default function SessionsPage() {
  return (
    <div className="space-y-4" dir="rtl">
      <Panel>
        <PanelHeader className="border-b">
          <PanelTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="h-4 w-4 text-primary" />  همه جلسات پلتفرم
          </PanelTitle>
          <PanelDescription>
            مدیریت و مشاهده همه جلسات شما (بدون فیلتر سازمان). برای تمرکز روی یک
            سازمان، از تب «جلسات سازمان» استفاده کنید.
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="block p-1 md:p-2">
          <SessionManager />
        </PanelContent>
      </Panel>
    </div>
  );
}
