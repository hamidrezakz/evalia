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
  ChevronDown,
  Check,
  Plus,
  Settings2,
  Star,
} from "lucide-react";

import { NavMain } from "@/app/dashboard/components/nav-main";
import { NavProjects } from "@/app/dashboard/components/nav-projects";
import { NavSecondary } from "@/app/dashboard/components/nav-secondary";
import { NavUser } from "@/app/dashboard/components/nav-user";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export const sidebarNavData = {
  user: {
    name: "دکتر مهسا میرصادقی",
    email: "mahsa@company.com",
    avatar: "/avatars/shadcn.jpg",
  },
  // حساب‌ها / سازمان‌هایی که کاربر در آن‌ها عضو است
  accounts: [
    {
      id: "org-1",
      name: "ماسا",
      slug: "central",
      plan: "Enterprise",
      logo: "/avatars/org-1.png",
      isPrimary: true,
    },
    {
      id: "org-2",
      name: "آموزگاه نمازی",
      slug: "sales",
      plan: "Pro",
      logo: "/avatars/org-2.png",
    },
    {
      id: "org-3",
      name: "ایوالیا",
      slug: "hr",
      plan: "Standard",
      logo: "/avatars/org-3.png",
    },
  ],
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
  // --- Active Organization State (with localStorage persistence) ---
  const [activeOrgId, setActiveOrgId] = React.useState<string | undefined>(
    undefined
  );

  // Load persisted org (once)
  React.useEffect(() => {
    const persisted =
      typeof window !== "undefined"
        ? localStorage.getItem("activeOrgId")
        : null;
    const fallback =
      sidebarNavData.accounts.find((a) => a.isPrimary)?.id ||
      sidebarNavData.accounts[0]?.id;
    if (persisted && sidebarNavData.accounts.some((a) => a.id === persisted)) {
      setActiveOrgId(persisted);
    } else {
      setActiveOrgId(fallback);
    }
  }, []);

  const setActiveOrg = React.useCallback((id: string) => {
    setActiveOrgId(id);
    try {
      if (typeof window !== "undefined")
        localStorage.setItem("activeOrgId", id);
    } catch {}
  }, []);

  const activeOrg = React.useMemo(
    () => sidebarNavData.accounts.find((a) => a.id === activeOrgId),
    [activeOrgId]
  );

  return (
    <Sidebar
      side="right"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Dropdown switcher for organizations */}
            <SidebarMenuButton
              asChild
              size="lg"
              className="group relative data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground px-2">
              <div className="w-full">
                <OrgSwitcher
                  accounts={sidebarNavData.accounts}
                  activeOrgId={activeOrgId}
                  onSelect={setActiveOrg}
                  activeOrg={activeOrg}
                />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-2">
        <NavMain items={sidebarNavData.navMain} />
        <NavProjects projects={sidebarNavData.projects} />
        <NavSecondary items={sidebarNavData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter dir="ltr">
        <NavUser user={sidebarNavData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

// ----- Organization Switcher Component -----

interface OrgAccount {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  logo?: string;
  isPrimary?: boolean;
}

interface OrgSwitcherProps {
  accounts: OrgAccount[];
  activeOrgId?: string;
  activeOrg?: OrgAccount;
  onSelect: (id: string) => void;
}

function OrgSwitcher({
  accounts,
  activeOrgId,
  activeOrg,
  onSelect,
}: OrgSwitcherProps) {
  const planColor = (plan?: string) => {
    switch (plan?.toLowerCase()) {
      case "enterprise":
        return "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300";
      case "pro":
        return "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300";
      case "standard":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="تغییر حساب کاری"
          className="flex w-full items-center gap-2 rounded-md text-right focus:outline-none">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg border border-border/40 shadow-sm">
            {activeOrg?.logo ? (
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={activeOrg.logo} alt={activeOrg.name} />
                <AvatarFallback className="rounded-lg text-xs font-medium">
                  {activeOrg.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ) : activeOrg ? (
              <Command className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
          </div>
          <div className="grid flex-1 text-right leading-tight">
            <span className="truncate font-semibold text-sm">
              {activeOrg?.name || "انتخاب حساب کاری"}
            </span>
            <span className="truncate text-[0.60rem] text-muted-foreground flex items-center gap-1 justify-start">
              {activeOrg?.plan ? (
                <span
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.55rem] font-medium shadow-sm ${planColor(
                    activeOrg.plan
                  )}`}>
                  {activeOrg.isPrimary && (
                    <Star className="size-3 mb-0.5 fill-current" />
                  )}
                  {activeOrg.plan}
                </span>
              ) : (
                "پلتفرم سازمانی"
              )}
            </span>
          </div>
          <ChevronDown className="size-4 opacity-70 transition group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="w-72 rounded-lg">
        <DropdownMenuLabel className="text-xs tracking-wide text-muted-foreground flex items-center justify-between">
          <span>حساب‌های کاری</span>
          <span className="text-[0.6rem] font-normal text-muted-foreground/70">
            {accounts.length} حساب
          </span>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {accounts.map((acc) => {
            const isActive = acc.id === activeOrgId;
            return (
              <DropdownMenuItem
                key={acc.id}
                onClick={() => onSelect(acc.id)}
                className="gap-2 cursor-pointer group"
                data-active={isActive}
                aria-current={isActive ? "true" : undefined}>
                <div className="flex items-center gap-2">
                  <Avatar className="size-8 rounded-md border border-border/40 ring-0 group-data-[active=true]:ring-2 group-data-[active=true]:ring-primary/40 transition">
                    {acc.logo && <AvatarImage src={acc.logo} alt={acc.name} />}
                    <AvatarFallback className="rounded-md text-[10px] font-medium">
                      {acc.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-right leading-tight">
                    <span className="text-[12px] font-medium flex items-center gap-1">
                      {acc.name}
                      {acc.isPrimary && (
                        <Star
                          className="size-3 text-amber-500"
                          aria-label="اصلی"
                        />
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {acc.plan || "Standard"}
                    </span>
                  </div>
                </div>
                {isActive && <Check className="ms-auto size-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 mt-0.5 text-[0.8rem]">
          <Plus className="size-4" />
          افزودن / پیوستن به حساب جدید
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-[0.8rem] mb-0.5">
          <Settings2 className="size-4" />
          مدیریت حساب‌ها و تنظیمات
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
