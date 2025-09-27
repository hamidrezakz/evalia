import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";

export function SessionCardSkeleton() {
  return (
    <Panel className="border border-border/50 bg-background/40 p-0 overflow-hidden">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-5 w-14 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <div className="grid gap-2 text-[11px]">
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </Panel>
  );
}

export default SessionCardSkeleton;
