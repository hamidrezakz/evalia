// src/app/dashboard/layout.tsx
import { AppSidebar } from "@/app/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MobileSidebarAutoClose } from "@/app/dashboard/components/mobile-sidebar-auto-close";

import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        {/* Auto-close the sidebar on mobile navigation changes */}
        <MobileSidebarAutoClose />
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="p-4 sm:p-5 md:p-6">{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
