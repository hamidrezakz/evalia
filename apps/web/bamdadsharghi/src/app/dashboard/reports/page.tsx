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

function KPIs() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
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

function Charts() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-8 bg-muted/50 rounded-xl p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <div className="flex items-center gap-2" aria-hidden>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="xl:col-span-4 bg-muted/50 rounded-xl p-4 md:p-5 space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-2 gap-3" aria-hidden>
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function Summary() {
  return (
    <div className="bg-muted/50 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-lg font-bold">گزارش کلی سازمان</h1>
      <FilterBar />
      <KPIs />
      <Charts />
      <Summary />
    </div>
  );
}
