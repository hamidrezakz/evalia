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
import { config } from "process";

const data = {
  user: {
    name: "مدیر مدرسه",
    email: "admin@bamdadsharghi.ir",
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
          url: "/dashboard",
        },
        {
          title: "تحلیل آموزشی",
          url: "/dashboard/analysis",
        },
      ],
    },
    {
      title: "دانش‌آموزان",
      url: "/dashboard/students",
      icon: Users,
      items: [
        {
          title: "لیست دانش‌آموزان",
          url: "/dashboard/students",
        },
        {
          title: "افزودن دانش‌آموز",
          url: "/dashboard/students/add",
        },
        {
          title: "ثبت/لغو ثبت‌نام",
          url: "/dashboard/students/enrollment",
        },
      ],
    },
    {
      title: "کلاس‌ها",
      url: "/dashboard/classes",
      icon: Building2,
      items: [
        {
          title: "مدیریت کلاس‌ها",
          url: "/dashboard/classes",
        },
        {
          title: "برنامه هفتگی",
          url: "/dashboard/classes/schedule",
        },
      ],
    },
    {
      title: "آزمون‌ها",
      url: "/dashboard/exams",
      icon: FileBarChart2,
      items: [
        {
          title: "تقویم آزمون",
          url: "/dashboard/exams/calendar",
        },
        {
          title: "نتایج و کارنامه",
          url: "/dashboard/exams/results",
        },
      ],
    },
    {
      title: "راهنمای UI",
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
  name: "ارزشیابی و کارنامه",
  url: "/dashboard/exams/results",
  icon: FileBarChart2,
    },
    {
  name: "مدیریت کلاس‌ها",
  url: "/dashboard/classes",
  icon: Building2,
    },
    {
  name: "پرونده دانش‌آموز",
  url: "/dashboard/students",
  icon: Users,
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
                  <span className="truncate font-bold">مدرسه بامداد شرقی</span>
                  <span className="truncate text-[0.6rem]">سامانه مدیریت مدرسه</span>
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
