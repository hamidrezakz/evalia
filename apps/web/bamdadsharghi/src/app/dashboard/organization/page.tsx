import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-lg font-bold">سازمان</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-xl p-4 md:p-5 space-y-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-2/3" />
        </div>
        <div className="bg-muted/50 rounded-xl p-4 md:p-5 space-y-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      </div>
      <div className="bg-muted/50 rounded-xl p-4 md:p-5 mt-6">
        <Skeleton className="h-5 w-1/3 mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
