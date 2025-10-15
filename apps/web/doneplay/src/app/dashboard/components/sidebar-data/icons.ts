import {
  Circle,
  Users,
  Command,
  BarChart2,
  FileText,
  Building2,
  FileBarChart2,
  SquarePen,
  ClipboardCheck,
  Network,
  GitBranch,
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
  // Question/Test creation
  SquarePen, // /dashboard/questions , /dashboard/testbuilder (builder/authoring)
  ClipboardCheck, // /dashboard/exams , /dashboard/tests (exam management)
  // Sub-organization management
  Network, // /dashboard/organizations/structure , hierarchy view
  GitBranch, // /dashboard/organizations/children , branching/sub-orgs
};
