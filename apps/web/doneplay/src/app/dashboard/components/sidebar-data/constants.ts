import { LifeBuoy, MessageCircle } from "lucide-react";
import type { SidebarNavItem } from "./types";

export const navSecondaryStatic: SidebarNavItem[] = [
  { title: "پشتیبانی", url: "/dashboard/support", icon: LifeBuoy },
  { title: "ارسال بازخورد", url: "/dashboard/feedback", icon: MessageCircle },
];
