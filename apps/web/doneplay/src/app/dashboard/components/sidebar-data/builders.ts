import { iconMap } from "./icons";
import type {
  SidebarNavItem,
  SidebarProjectItem,
  SidebarIconComponent,
} from "./types";

interface RawNavChild {
  label: string;
  path: string;
}

interface RawNavItem {
  label: string;
  path: string;
  iconName?: string | SidebarIconComponent;
  isActive?: boolean;
  children?: RawNavChild[];
}

function isRawNavItem(value: unknown): value is RawNavItem {
  if (typeof value !== "object" || value === null) return false;
  return "label" in value && "path" in value;
}

export function buildNavMain(rawItems: unknown[]): SidebarNavItem[] {
  return rawItems.filter(isRawNavItem).map((item): SidebarNavItem => {
    let iconComp: SidebarIconComponent = iconMap["Circle"]; // default
    const candidate = item.iconName as
      | SidebarIconComponent
      | string
      | undefined;
    if (candidate) {
      if (typeof candidate === "string") {
        iconComp = iconMap[candidate] || iconMap["Circle"];
      } else {
        iconComp = candidate;
      }
    }
    return {
      title: item.label,
      url: item.path,
      icon: iconComp,
      isActive: item.isActive,
      items: Array.isArray(item.children)
        ? item.children.map((sub) => ({ title: sub.label, url: sub.path }))
        : undefined,
    };
  });
}

interface RawProjectItem {
  title: string;
  path?: string;
  url?: string;
  icon?: SidebarIconComponent;
  project?: boolean;
}

export function buildProjects(flatten: unknown): SidebarProjectItem[] {
  const list: unknown[] =
    typeof flatten === "function" ? (flatten as () => unknown[])() : [];
  return list
    .filter(
      (item): item is RawProjectItem =>
        typeof item === "object" && item !== null && "title" in item
    )
    .filter((item) => !!item.project)
    .map((item) => ({
      name: item.title,
      url: item.path || item.url || "#",
      icon: item.icon || iconMap["Circle"],
    }));
}
