import * as React from "react";
import type { SidebarNavItem } from "./sidebar-data/types";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavSecondary(
  props: { items: SidebarNavItem[] } & React.ComponentPropsWithoutRef<
    typeof SidebarGroup
  >
) {
  const { items, ...rest } = props;
  return (
    <SidebarGroup {...rest}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item: SidebarNavItem) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <Link href={item.url}>
                  {typeof item.icon === "function" ? (
                    <item.icon />
                  ) : (
                    React.createElement(item.icon)
                  )}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
