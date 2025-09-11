"use client";

import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import {
  Home,
  Users,
  LineChart,
  Layers3,
  Puzzle,
  BookOpen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * PrimaryNavigation
 * منوی اصلی سایت / لندینگ که روی هدر هیرو می‌آید.
 * از NavigationMenu (Radix) و کامپوننت‌های داخلی استفاده می‌کند.
 */
export interface PrimaryNavigationProps {
  className?: string;
  alignContent?: "start" | "center" | "end";
}

const PRODUCTS: Array<{
  title: string;
  href: string;
  desc: string;
  icon: LucideIcon;
}> = [
  {
    title: "داشبورد منابع انسانی",
    href: "/dashboard",
    desc: "مرکز یکپارچه بینش‌های عملکرد، حضور و فرهنگ.",
    icon: Home,
  },
  {
    title: "کاربران / کارکنان",
    href: "/dashboard/employees",
    desc: "مدیریت پروفایل، نقش، تیم و وضعیت کاربری.",
    icon: Users,
  },
  {
    title: "تحلیل و گزارش",
    href: "/dashboard/analysis",
    desc: "گراف‌ها، ترندها و بینش‌های تصمیم‌محور.",
    icon: LineChart,
  },
  {
    title: "ساختار سازمان",
    href: "/dashboard/organization",
    desc: "مدیریت تیم‌ها، سطوح و انسجام چارت.",
    icon: Layers3,
  },
];

const RESOURCES: Array<{
  title: string;
  href: string;
  desc: string;
  icon: LucideIcon;
}> = [
  {
    title: "مستندات",
    href: "/docs",
    desc: "راهنماهای پیاده‌سازی و مفاهیم سیستم.",
    icon: BookOpen,
  },
  {
    title: "پکیج UI",
    href: "/dashboard/ui",
    desc: "اجزای رابط کاربری و الگوهای کاربردی.",
    icon: Puzzle,
  },
  {
    title: "ریلیز نوت",
    href: "/changelog",
    desc: "تغییرات نسخه‌ها و قابلیت‌های تازه.",
    icon: Sparkles,
  },
];

function MenuPanel({ children }: { children: React.ReactNode }) {
  return (
    <Panel
      dir="rtl"
      className="w-auto min-w-[320px] md:min-w-[400px] p-3 md:p-4 grid gap-2">
      {children}
    </Panel>
  );
}

export function PrimaryNavigation({
  className,
  alignContent = "center",
}: PrimaryNavigationProps) {
  return (
    <NavigationMenu
      viewport={false}
      className={cn(
        "hidden sm:flex",
        alignContent === "start" && "justify-start",
        alignContent === "center" && "justify-center",
        alignContent === "end" && "justify-end",
        className
      )}>
      <NavigationMenuList className="gap-1">
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-xs md:text-sm">
            محصول
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <MenuPanel>
              <div className="grid gap-1">
                {PRODUCTS.map((p) => (
                  <NavigationMenuLink asChild key={p.href}>
                    <Link
                      href={p.href}
                      className="flex items-start gap-3 rounded-md px-2 py-2.5 hover:bg-accent/60 transition">
                      <p.icon className="size-4 md:size-5 text-primary mt-0.5" />
                      <span className="flex flex-col text-right">
                        <span className="font-medium leading-none text-sm md:text-[13px]">
                          {p.title}
                        </span>
                        <span className="text-[11px] md:text-xs text-muted-foreground leading-5 line-clamp-2">
                          {p.desc}
                        </span>
                      </span>
                    </Link>
                  </NavigationMenuLink>
                ))}
              </div>
            </MenuPanel>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-xs md:text-sm">
            منابع
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <MenuPanel>
              <div className="grid gap-1">
                {RESOURCES.map((r) => (
                  <NavigationMenuLink asChild key={r.href}>
                    <Link
                      href={r.href}
                      className="flex items-start gap-3 rounded-md px-2 py-2.5 hover:bg-accent/60 transition">
                      <r.icon className="size-4 md:size-5 text-primary mt-0.5" />
                      <span className="flex flex-col text-right">
                        <span className="font-medium leading-none text-sm md:text-[13px]">
                          {r.title}
                        </span>
                        <span className="text-[11px] md:text-xs text-muted-foreground leading-5 line-clamp-2">
                          {r.desc}
                        </span>
                      </span>
                    </Link>
                  </NavigationMenuLink>
                ))}
              </div>
            </MenuPanel>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/pricing"
              className="inline-flex h-9 items-center rounded-md px-4 text-xs md:text-sm font-medium hover:bg-accent/60 focus:bg-accent/60 transition">
              قیمت‌گذاری
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/blog"
              className="inline-flex h-9 items-center rounded-md px-4 text-xs md:text-sm font-medium hover:bg-accent/60 focus:bg-accent/60 transition">
              وبلاگ
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <div className="hidden md:flex items-center gap-2 pl-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">ورود</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">ثبت‌نام</Link>
        </Button>
      </div>
    </NavigationMenu>
  );
}

export default PrimaryNavigation;
