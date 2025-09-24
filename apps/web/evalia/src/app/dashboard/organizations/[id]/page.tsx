"use client";
import * as React from "react";
import { useParams } from "next/navigation";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";
import { Panel, PanelHeader, PanelTitle, PanelDescription, PanelContent } from "@/components/ui/panel";
import { OrganizationStatusBadge } from "@/organizations/organization/components/OrganizationStatusBadge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TeamBuilderPanel from "@/organizations/team/components/TeamBuilderPanel";

export default function OrganizationDetailPage() {
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params?.id[0] : (params as any)?.id;
  const orgId = idParam ? Number(idParam) : NaN;
  const { data, isLoading, isError } = useOrganization(Number.isFinite(orgId) ? orgId : null);

  return (
    <div className="space-y-6" dir="rtl">
      <Panel>
        <PanelHeader>
          <PanelTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
            {isLoading ? "در حال بارگذاری" : isError ? "خطا" : data?.name || "سازمان"}
            {data && <OrganizationStatusBadge status={data.status} />}
          </PanelTitle>
          {data && (
            <PanelDescription className="flex flex-wrap gap-4 text-xs">
              <span className="text-muted-foreground">شناسه: #{data.id}</span>
              <span className="text-muted-foreground">اسلاگ: {data.slug}</span>
              <span className="text-muted-foreground">پلن: {data.plan}</span>
              {data.locale && <span className="text-muted-foreground">زبان: {data.locale}</span>}
            </PanelDescription>
          )}
        </PanelHeader>
        <PanelContent className="flex-col gap-6">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">در حال دریافت اطلاعات…</div>
          ) : isError ? (
            <div className="text-sm text-rose-600">خطا در دریافت اطلاعات سازمان</div>
          ) : !data ? (
            <div className="text-sm text-muted-foreground">یافت نشد.</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <OverviewSection data={data} />
                <MembersSection orgId={data.id} />
              </div>
              <div className="space-y-4">
                <TeamsSection orgId={data.id} />
              </div>
            </div>
          )}
        </PanelContent>
      </Panel>
    </div>
  );
}

function OverviewSection({ data }: { data: any }) {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h2 className="text-sm font-semibold">مرور کلی</h2>
      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        <Field label="نام" value={data.name} />
        <Field label="اسلاگ" value={data.slug} />
        <Field label="پلن" value={data.plan} />
        {data.locale && <Field label="زبان" value={data.locale} />}
        {data.timezone && <Field label="منطقه زمانی" value={data.timezone} />}
        {data.billingEmail && <Field label="ایمیل مالی" value={data.billingEmail} dir="ltr" />}
      </div>
      {data.membership && (
        <div className="text-xs text-muted-foreground">
          نقش شما: <span className="font-medium">{data.membership.roles?.join("، ")}</span>
        </div>
      )}
      <div className="flex justify-end">
        <Link href={`/dashboard/organizations/${data.id}/teams/manage`}>
          <Button size="sm" variant="outline">مدیریت تیم‌ها</Button>
        </Link>
      </div>
    </div>
  );
}

function Field({ label, value, dir }: { label: string; value: any; dir?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground mb-0.5">{label}</span>
      <span className="font-medium break-words" dir={dir}>{value ?? "—"}</span>
    </div>
  );
}

// Placeholder Members & Teams sections (can be expanded)
function MembersSection({ orgId }: { orgId: number }) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">اعضا</h2>
        <Button size="sm" variant="ghost">افزودن</Button>
      </div>
      <p className="text-xs text-muted-foreground">لیست اعضا به زودی...</p>
    </div>
  );
}

function TeamsSection({ orgId }: { orgId: number }) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">تیم‌ها</h2>
        <Link href={`/dashboard/organizations/${orgId}/teams/manage`}><Button size="sm" variant="ghost">مدیریت</Button></Link>
      </div>
      <TeamBuilderPanel organizationId={orgId} />
    </div>
  );
}
