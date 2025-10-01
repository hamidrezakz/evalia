"use client";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { Users as UsersIcon } from "lucide-react";
import { UsersList } from "@/users/components";

export default function DashboardUsersPage() {
  return (
    <div className="w-full space-y-4" dir="rtl">
      <Panel>
        <PanelHeader className="border-b">
          <PanelTitle className="text-base flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-primary" /> مدیریت تمام کاربران
          </PanelTitle>
          <PanelDescription>
            جستجو، مشاهده جزئیات و انجام عملیات روی تمام کاربران سیستم
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="block">
          <UsersList
            initialQuery={{ q: "", page: 1, pageSize: 20 }}
            canEdit={() => true}
            canBlock={() => true}
            canDelete={() => true}
          />
        </PanelContent>
      </Panel>
    </div>
  );
}
