"use client";
import * as React from "react";
import { useOrganization } from "../api/organization-hooks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { OrganizationStatusBadge } from "./OrganizationStatusBadge";

export interface OrganizationDetailSheetProps {
  organizationId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationDetailSheet({
  organizationId,
  open,
  onOpenChange,
}: OrganizationDetailSheetProps) {
  const { data, isLoading, isError } = useOrganization(organizationId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>سازمان</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-6">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">
              در حال بارگذاری…
            </div>
          ) : isError ? (
            <div className="text-sm text-rose-600">
              خطا در دریافت اطلاعات سازمان
            </div>
          ) : data ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-lg">{data.name}</span>
                  <span className="text-muted-foreground text-sm">
                    /{data.slug}
                  </span>
                </div>
                <OrganizationStatusBadge status={data.status} />
              </div>

              <div className="text-xs text-muted-foreground">
                شناسه: #{data.id}
              </div>
              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">پلن</div>
                  <div className="font-medium">{data.plan}</div>
                </div>
                {data.locale && (
                  <div>
                    <div className="text-muted-foreground">زبان</div>
                    <div className="font-medium">{data.locale}</div>
                  </div>
                )}
                {data.timezone && (
                  <div>
                    <div className="text-muted-foreground">منطقه زمانی</div>
                    <div className="font-medium">{data.timezone}</div>
                  </div>
                )}
                {data.billingEmail && (
                  <div className="col-span-2">
                    <div className="text-muted-foreground">ایمیل مالی</div>
                    <div className="font-medium ltr:text-left">
                      {data.billingEmail}
                    </div>
                  </div>
                )}
              </div>

              {data.membership && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium mb-2">عضویت شما</div>
                    <div className="text-sm text-muted-foreground">
                      نقش:{" "}
                      <span className="font-medium">
                        {data.membership.roles}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
