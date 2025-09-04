// src/app/dashboard/layout.tsx
import { AppSidebar } from "@/app/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MobileSidebarAutoClose } from "@/app/dashboard/components/mobile-sidebar-auto-close";
import { AuthProvider } from "@/app/auth/context/AuthContext";

import { ReactNode, Suspense } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        {/* Auto-close the sidebar on mobile navigation changes (needs Suspense for routing hooks) */}
        <Suspense fallback={null}>
          <MobileSidebarAutoClose />
        </Suspense>
        {/* Header needs Suspense because it uses usePathname/useSearchParams via client hooks */}
        <Suspense
          fallback={
            <header className="bg-background border-b h-(--header-height) flex items-center px-4 text-xs text-muted-foreground">
              ...
            </header>
          }>
          <SiteHeader />
        </Suspense>
        <div className="flex flex-1">
          <Suspense
            fallback={
              <aside className="hidden md:block w-56 border-l border-border/40 bg-muted/20 animate-pulse" />
            }>
            <AppSidebar />
          </Suspense>
          <SidebarInset className="p-4 sm:p-5 md:p-6">
            <Suspense fallback={null}>{children}</Suspense>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  </AuthProvider>
  );
}
