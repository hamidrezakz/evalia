import {
  Circle,
  Users,
  Command,
  BarChart2,
  FileText,
  Building2,
  FileBarChart2,
} from "lucide-react";
import type { SidebarIconComponent } from "./types";

export const iconMap: Record<string, SidebarIconComponent> = {
  Circle, // /dashboard
  Command, // /dashboard
  Building2, // /dashboard/myorg  , /dashboard/organizations
  Users, // /dashboard/users
  FileText, // /dashboard/sessions  , /dashboard/sessions/my-org
  BarChart2, // /dashboard/testbuilder
  FileBarChart2, // /dashboard/testbuilder/templates
};
