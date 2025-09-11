"use client";

import React from "react";
import { SidebarIcon } from "lucide-react";
import { usePathname } from "next/navigation";
// جایگزینی سرچ ساده با کامند پالت حرفه ای
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/modetoggle";
import { useSidebar } from "@/components/ui/sidebar";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // مپ فارسی برای نمایش breadcrumb
  const labels: Record<string, string> = {
    // لایه اصلی داشبورد
    dashboard: "داشبورد سازمانی",

    // کارکنان
    employees: "کارکنان",
    list: "لیست",
    add: "افزودن",
    approve: "تأیید",

    // سازمان
    organization: "سازمان",
    info: "اطلاعات",
    teams: "تیم‌ها",

    // گزارش و تحلیل
    reports: "گزارش‌ها",
    analysis: "تحلیل",

    // سایر بخش‌ها
    support: "پشتیبانی",
    feedback: "بازخورد",
    docs: "مستندات",

    // مستندات UI داخلی
    ui: "راهنمای UI",
    buttons: "دکمه‌ها",
    forms: "فرم‌ها",
  };

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}>
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="md:ml-2 h-4" />
        <Breadcrumb className="hidden sm:block text-xs">
          <BreadcrumbList>
            {segments.map((segment, idx) => {
              const href = "/" + segments.slice(0, idx + 1).join("/");
              const isLast = idx === segments.length - 1;
              return (
                <React.Fragment key={segment}>
                  <BreadcrumbItem className="text-xs">
                    {isLast ? (
                      <BreadcrumbPage>
                        {labels[segment] || segment}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href} prefetch={false}>
                          {labels[segment] || segment}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator>
                      <ChevronLeft />
                    </BreadcrumbSeparator>
                  )}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className=" ml-auto w-auto rtl:mr-auto rtl:ml-0">
          
        </div>
        <div className="ml-auto rtl:ml-0">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
