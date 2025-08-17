"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Command,
  BarChart2,
  LifeBuoy,
  MessageCircle,
  FileText,
  Building2,
  FileBarChart2,
} from "lucide-react";

import { NavMain } from "@/app/dashboard/components/nav-main";
import { NavProjects } from "@/app/dashboard/components/nav-projects";
import { NavSecondary } from "@/app/dashboard/components/nav-secondary";
import { NavUser } from "@/app/dashboard/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "مدیر سازمان",
    email: "manager@company.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "داشبورد",
      url: "/dashboard",
      icon: BarChart2,
      isActive: true,
      items: [
        {
          title: "گزارش کلی",
          url: "/dashboard/reports",
        },
        {
          title: "تحلیل منابع انسانی",
          url: "/dashboard/analysis",
        },
      ],
    },
    {
      title: "کارکنان",
      url: "/dashboard/employees",
      icon: Users,
      items: [
        {
          title: "لیست کارکنان",
          url: "/dashboard/employees/list",
        },
        {
          title: "افزودن کارمند جدید",
          url: "/dashboard/employees/add",
        },
        {
          title: "تایید/رد استخدام",
          url: "/dashboard/employees/approve",
        },
      ],
    },
    {
      title: "سازمان",
      url: "/dashboard/organization",
      icon: Building2,
      items: [
        {
          title: "اطلاعات سازمان",
          url: "/dashboard/organization/info",
        },
        {
          title: "مدیریت تیم‌ها",
          url: "/dashboard/organization/teams",
        },
      ],
    },
    {
      title: "مستندات ui",
      url: "/dashboard/ui",
      icon: BookOpen,
      items: [
        {
          title: "دکمه‌ها",
          url: "/dashboard/ui/buttons",
        },
        {
          title: "فرم ها",
          url: "/dashboard/ui/forms",
        },
        {
          title: "بازخورد",
          url: "/dashboard/ui/feedback",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "پشتیبانی",
      url: "/dashboard/support",
      icon: LifeBuoy,
    },
    {
      title: "ارسال بازخورد",
      url: "/dashboard/feedback",
      icon: MessageCircle,
    },
  ],
  projects: [
    {
      name: "تحلیل عملکرد",
      url: "/dashboard/analysis",
      icon: FileBarChart2,
    },
    {
      name: "مدیریت منابع انسانی",
      url: "/dashboard/employees",
      icon: Users,
    },
    {
      name: "مستندسازی",
      url: "/dashboard/docs",
      icon: FileText,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      side="right"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-right text-md leading-tight">
                  <span className="truncate font-bold">ماسا </span>
                  <span className="truncate text-[0.6rem]">پلتفرم سازمانی</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-2">
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter dir="ltr">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
