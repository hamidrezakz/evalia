import { iconMap } from "./icons";
import type { SidebarNavItem, SidebarProjectItem } from "./types";

export function buildNavMain(rawItems: any[]): SidebarNavItem[] {
  return rawItems.map((item: any) => {
    let iconComp = item.iconName;
    if (typeof iconComp === "string")
      iconComp = iconMap[iconComp] || iconMap["Circle"];
    if (!iconComp) iconComp = iconMap["Circle"];
    return {
      title: item.label,
      url: item.path,
      icon: iconComp,
      isActive: item.isActive,
      items: Array.isArray(item.children)
        ? item.children.map((sub: any) => ({ title: sub.label, url: sub.path }))
        : undefined,
    };
  });
}

export function buildProjects(flatten: any): SidebarProjectItem[] {
  return (typeof flatten === "function" ? flatten() : [])
    .filter((item: any) => item.project)
    .map((item: any) => ({
      name: item.title,
      url: item.path || item.url,
      icon: item.icon,
    }));
}
