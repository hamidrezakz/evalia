import { Skeleton } from "@/components/ui/skeleton";

function KpiCard() {
  return (
    <div className="bg-muted/50 rounded-xl p-4 md:p-5 space-y-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-2/3" />
      <div className="flex items-center gap-3 pt-1" aria-hidden>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

function LargeChartCard() {
  return (
    <div className="bg-muted/50 rounded-xl p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2" aria-hidden>
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <div className="relative">
        <Skeleton className="h-64 w-full" />
        <div
          className="absolute inset-0 p-4 flex flex-col justify-between"
          aria-hidden>
          <div className="flex-1 grid grid-rows-4">
            <div className="border-t border-border/40" />
            <div className="border-t border-border/40" />
            <div className="border-t border-border/40" />
            <div className="border-t border-border/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SecondaryChartCard() {
  return (
    <div className="bg-muted/50 rounded-xl p-4 md:p-5 space-y-4">
      <Skeleton className="h-4 w-40" />
      <div className="grid grid-cols-6 gap-2" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-muted/50 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-12 gap-2 text-xs" aria-hidden>
        <div className="col-span-5">
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="col-span-3">
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="col-span-2">
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="col-span-2">
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div className="mt-4 space-y-3" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-2">
            <div className="col-span-5 flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="col-span-3">
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="col-span-2 flex justify-end">
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityList() {
  return (
    <div className="bg-muted/50 rounded-xl p-4 md:p-5 space-y-4">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-3" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* KPIs */}
      <h2 className="sr-only">شاخص‌های کلیدی</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard />
        <KpiCard />
        <KpiCard />
        <KpiCard />
      </div>

      {/* Charts */}
      <h2 className="sr-only">نمودارها و تحلیل</h2>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-7">
          <LargeChartCard />
        </div>
        <div className="xl:col-span-5">
          <SecondaryChartCard />
        </div>
      </div>

      {/* Table and activity */}
      <h2 className="sr-only">جدول‌ها و فعالیت‌ها</h2>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-7">
          <TableSkeleton />
        </div>
        <div className="xl:col-span-5 space-y-4">
          <ActivityList />
          <div className="bg-muted/50 rounded-xl p-4 md:p-5 space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-3 gap-3" aria-hidden>
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
