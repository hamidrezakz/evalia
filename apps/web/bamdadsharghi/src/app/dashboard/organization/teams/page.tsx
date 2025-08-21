import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationTeamsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-lg font-bold">مدیریت تیم‌ها</h1>
      <div className="bg-muted/50 rounded-xl p-4 md:p-5 space-y-4">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
