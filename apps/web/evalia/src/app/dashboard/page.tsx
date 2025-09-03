import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
  PanelDescription,
} from "@/components/ui/panel";
import { FeatureGate } from "@/app/organizations/lib/feature-gate";
import { UserRoles } from "@/app/organizations/lib/permissions";
import {
  ActiveOrgProvider,
  useActiveOrg,
} from "@/app/organizations/lib/active-org-context";

// TODO: Replace this with real authenticated user roles context/hook
function useCurrentUserRoles(): { roles: UserRoles; activeOrgId?: number } {
  // Mock roles for now; integrate with auth provider later
  return {
    roles: { global: ["SUPER_ADMIN"], org: [{ orgId: 1, role: "OWNER" }] },
    activeOrgId: 1,
  };
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

function DashboardInner() {
  return <SummaryTable />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  );
}
