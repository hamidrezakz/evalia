import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="text-lg font-bold mb-2">گزارش کلی سازمان</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-muted/40 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="bg-white dark:bg-muted/40 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="bg-white dark:bg-muted/40 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div className="bg-white dark:bg-muted/40 rounded-xl p-4 mt-6 shadow-sm">
        <Skeleton className="h-5 w-1/3 mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
