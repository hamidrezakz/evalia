"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

/**
 * Closes the sidebar sheet automatically on mobile whenever the route changes.
 * Standard approach: watch pathname via next/navigation and close if open.
 */
export function MobileSidebarAutoClose() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = React.useMemo(() => searchParams?.toString() ?? "", [searchParams]);
  const { isMobile, setOpenMobile } = useSidebar();

  React.useEffect(() => {
    // Close on actual URL changes (path or query), not on toggle state changes
    if (isMobile) {
      setOpenMobile(false);
    }
    // Only depend on URL parts and env; avoid openMobile to prevent instant re-close after tapping toggle
  }, [pathname, queryString, isMobile, setOpenMobile]);

  return null;
}
