import { Skeleton } from "@/components/ui/skeleton";

function FilterBar() {
  return (
    <div className="bg-muted/50 rounded-xl p-3 md:p-4 flex flex-wrap items-center gap-3">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-36" />
      <div className="ms-auto flex items-center gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

function KpiRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-muted/50 rounded-xl p-4 md:p-5 space-y-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-2/3" />
          <div className="flex items-center gap-3 pt-1" aria-hidden>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartsRow() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-7 bg-muted/50 rounded-xl p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
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
      <div className="xl:col-span-5 bg-muted/50 rounded-xl p-4 md:p-5 space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-2 gap-3" aria-hidden>
          <Skeleton className="h-28 w-full rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CorrelationMatrix() {
  return (
    <div className="bg-muted/50 rounded-xl p-4 md:p-5 space-y-4">
      <Skeleton className="h-5 w-40" />
      <div className="grid grid-cols-12 gap-1" aria-hidden>
        {Array.from({ length: 12 * 6 }).map((_, i) => (
          <div key={i} className="aspect-square">
            <Skeleton className="h-full w-full rounded-[2px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryTable() {
  return (
    <div className="bg-muted/50 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-48" />
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

export default function AnalysisPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold">تحلیل منابع انسانی</h1>

      <FilterBar />
      <KpiRow />
      <ChartsRow />
      <CorrelationMatrix />
      <SummaryTable />
    </div>
  );
}
