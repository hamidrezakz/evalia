"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Panel } from "@/components/ui/panel";
import { UsersList } from "@/users/components";

export default function DashboardUsersPage() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>داشبورد</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>کاربران</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">مدیریت کاربران</h1>
          <p className="text-muted-foreground">
            جستجو، مشاهده جزئیات و انجام عملیات روی کاربران سیستم
          </p>
        </div>
      </div>

      <Panel className="">
        <div className="px-2">
          {" "}
          <UsersList
            initialQuery={{ q: "", page: 1, pageSize: 20 }}
            canEdit={() => true}
            canBlock={() => true}
            canDelete={() => true}
          />
        </div>
      </Panel>
    </div>
  );
}
