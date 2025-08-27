import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeesListPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-lg font-bold">لیست کارکنان</h1>
      <div className="bg-muted/50 rounded-xl p-4 md:p-5">
        <Skeleton className="h-5 w-40 mb-4" />
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
          {Array.from({ length: 8 }).map((_, i) => (
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
    </div>
  );
}
