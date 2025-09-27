"use client";
import * as React from "react";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ActiveOrgMembersSkeleton
 * اسکیلتون بارگذاری لیست اعضای سازمان
 * - ساختار مشابه کامپوننت اصلی: فیلتر بار + پنل نتایج
 * - انیمیشن یکنواخت (animate-pulse) و ارتفاع‌های نزدیک به ردیف واقعی
 */
export function ActiveOrgMembersSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3" dir="rtl">
      <Panel className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16 ms-auto" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </Panel>
      <Panel className="divide-y">
        <div className="flex items-center justify-between px-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 animate-pulse">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-10" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </Panel>
    </div>
  );
}

export default ActiveOrgMembersSkeleton;
