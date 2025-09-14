"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Panel } from "@/components/ui/panel";
import { OrganizationsList } from "@/organizations/organization/components/OrganizationsList";

export default function DashboardOrganizationsPage() {
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
              <BreadcrumbPage>سازمان‌ها</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            مدیریت سازمان‌ها
          </h1>
          <p className="text-muted-foreground">
            جستجو، مشاهده جزئیات و انجام عملیات روی سازمان‌ها
          </p>
        </div>
      </div>

      <Panel className="">
        <div className="px-2">
          {" "}
          <OrganizationsList
            initialQuery={{ q: "", page: 1, pageSize: 20 }}
            canEdit={() => true}
            canSuspend={() => true}
            canActivate={() => true}
            canDelete={() => true}
            canRestore={() => true}
          />
        </div>
      </Panel>
    </div>
  );
}
