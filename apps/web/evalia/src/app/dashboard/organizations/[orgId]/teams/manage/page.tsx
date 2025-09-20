"use client";

import { useParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Panel } from "@/components/ui/panel";
import TeamBuilderPanel from "@/organizations/team/components/TeamBuilderPanel";

export default function ManageTeamsPage() {
  const params = useParams();
  const orgId = Number(params?.orgId);

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
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>مدیریت تیم‌ها</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            مدیریت تیم‌های سازمان
          </h1>
          <p className="text-muted-foreground">
            ساخت تیم جدید، جستجو و مدیریت اعضای تیم‌ها
          </p>
        </div>
      </div>

      <Panel className="">
        <div className="px-2">
          <TeamBuilderPanel organizationId={orgId} />
        </div>
      </Panel>
    </div>
  );
}
