/* "use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { sidebarNavData } from "@/app/dashboard/components/app-sidebar";
import { activities, recentEmployees, dashboardTasks } from "../data/dashboard";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  User2,
  Settings2,
  ListTodo,
  Activity,
  Waypoints,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ساختار آیتم جستجو
export interface GlobalSearchItem {
  id: string;
  type: "nav" | "employee" | "task" | "activity" | "action";
  title: string;
  subtitle?: string;
  href?: string; // برای ناوبری
  action?: () => void; // برای اکشن سفارشی
  keywords?: string[];
  group: string; // جهت گروه‌بندی نمایشی
  shortcut?: string[]; // برای نمایش شورتکات (فقط نمونه آموزشی)
}

// جمع آوری داده ها برای سرچ (در صورت سنگین شدن می توان lazy / remote کرد)
function buildItems(): GlobalSearchItem[] {
  const items: GlobalSearchItem[] = [];

  // ناوبری اصلی و زیر آیتم ها
  sidebarNavData.navMain.forEach((cat) => {
    items.push({
      id: `nav-${cat.url}`,
      type: "nav",
      title: cat.title,
      href: cat.url,
      group: "ناوبری",
      keywords: [cat.title],
      shortcut: cat.url === "/dashboard" ? ["G", "D"] : undefined,
    });
    cat.items?.forEach((sub) =>
      items.push({
        id: `nav-${sub.url}`,
        type: "nav",
        title: sub.title,
        href: sub.url,
        group: "ناوبری فرعی",
        keywords: [sub.title, cat.title],
      })
    );
  });

  // ناوبری ثانویه
  sidebarNavData.navSecondary.forEach((n) =>
    items.push({
      id: `nav-${n.url}`,
      type: "nav",
      title: n.title,
      href: n.url,
      group: "پشتیبانی",
      keywords: [n.title],
      shortcut: n.url.includes("support") ? ["G", "S"] : undefined,
    })
  );

  // پروژه ها
  sidebarNavData.projects.forEach((p) =>
    items.push({
      id: `project-${p.url}`,
      type: "nav",
      title: p.name,
      href: p.url,
      group: "پروژه ها",
      keywords: [p.name],
      shortcut: p.url.includes("hr") ? ["P", "H"] : undefined,
    })
  );

  // پرسنل جدید (نمونه - می توان توسعه داد)
  recentEmployees.slice(0, 10).forEach((e) =>
    items.push({
      id: `employee-${e.id}`,
      type: "employee",
      title: e.name,
      subtitle: e.role,
      group: "کارکنان",
      keywords: [e.name, e.role, e.team],
    })
  );

  // تسک ها
  dashboardTasks.forEach((t) =>
    items.push({
      id: `task-${t.id}`,
      type: "task",
      title: t.title,
      subtitle: t.assignee || "(بدون مسئول)",
      group: "وظایف",
      keywords: [t.title, t.assignee || ""],
      shortcut: t.priority ? ["T", t.priority[0].toUpperCase()] : undefined,
    })
  );

  // فعالیت ها
  activities.slice(0, 15).forEach((a) =>
    items.push({
      id: `activity-${a.id}`,
      type: "activity",
      title: a.message,
      subtitle: a.time,
      group: "رویدادها",
      keywords: [a.message],
    })
  );

  // اکشن های سیستمی
  const actions: GlobalSearchItem[] = [
    {
      id: "action-toggle-sidebar",
      type: "action",
      title: "باز/بستن سایدبار",
      group: "اکشن ها",
      shortcut: ["Ctrl", "B"],
    },
    {
      id: "action-go-settings",
      type: "action",
      title: "تنظیمات سیستم",
      group: "اکشن ها",
      shortcut: ["G", "S"],
    },
  ];
  items.push(...actions);
  return items;
}

// فیلتر ساده (در صورت نیاز می توان fuse.js اضافه کرد)
function filterItems(items: GlobalSearchItem[], query: string) {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(
    (it) =>
      it.title.toLowerCase().includes(q) ||
      (it.subtitle && it.subtitle.toLowerCase().includes(q)) ||
      it.keywords?.some((k) => k.toLowerCase().includes(q))
  );
}

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const allItems = React.useMemo(() => buildItems(), []);
  const filtered = React.useMemo(
    () => filterItems(allItems, query),
    [allItems, query]
  );
  const router = useRouter();
  const pathname = usePathname();

  // شورتکات کیبورد (Ctrl|Cmd + K)
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function runItem(item: GlobalSearchItem) {
    if (item.type === "nav" && item.href) {
      setOpen(false);
      if (pathname !== item.href) router.push(item.href);
      return;
    }
    if (item.type === "action") {
      if (item.id === "action-toggle-sidebar") {
        const evt = new CustomEvent("__toggle_sidebar");
        window.dispatchEvent(evt);
      }
      if (item.id === "action-go-settings") {
        router.push("/dashboard/settings");
      }
      setOpen(false);
      return;
    }
    // موارد دیگر بعدا قابل گسترش
  }

  // گروه بندی جهت نمایش
  const groups = React.useMemo(() => {
    const map = new Map<string, GlobalSearchItem[]>();
    filtered.forEach((it) => {
      if (!map.has(it.group)) map.set(it.group, []);
      map.get(it.group)!.push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <>
      <Button
        variant="outline"
        className="size-9  sm:px-4 sm:py-2 sm:has-[>svg]:px-3 sm:w-fit"
        onClick={() => setOpen(true)}
        aria-label="جستجو (Ctrl+K)">
        <Search />
        <kbd className="hidden sm:flex font-sans text-[10px] opacity-60 ltr:ml-1 rtl:mr-1 mt-[3px]">
          Ctrl + K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="جستجو"
        description="پالت فرمان و جستجو"
        className="sm:max-w-xl md:max-w-2xl xl:max-w-3xl w-full max-h-[90vh] h-[60vh] top-[36vh] md:top-[40vh] md:h-[70vh] 2xl:top-[50vh] 2xl:h-[90vh]">
        <CommandInput
          className="mr-6"
          searchIconClassName="hidden"
          placeholder="جستجو یا فرمان..."
          autoFocus
          value={query}
          onValueChange={setQuery as (v: string) => void}
        />
        <CommandList className="max-h-[60vh] sm:max-h-[65vh] lg:max-h-[90vh]">
          <CommandEmpty>موردی یافت نشد</CommandEmpty>
          {groups.map(([group, items]) => (
            <CommandGroup heading={group} key={group}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title}
                  onSelect={() => runItem(item)}
                  className="flex items-center gap-2">
                  {iconForItem(item)}
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="truncate text-[12px] md:text-[13px] font-medium">
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="truncate text-[10px] text-muted-foreground">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-2 rtl:ml-0 rtl:mr-auto">
                    {item.shortcut && (
                      <CommandShortcut className="flex gap-1 text-[10px]">
                        {item.shortcut.map((s, i) => (
                          <kbd
                            key={i}
                            className="rounded-sm border bg-muted px-1 py-0.5 font-sans text-[10px] tracking-wide text-muted-foreground">
                            {s}
                          </kbd>
                        ))}
                      </CommandShortcut>
                    )}
                    {badgeForType(item.type)}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="راهنما">
            <CommandItem disabled>
              <PanelLeft className="size-4" />
              <span>Ctrl + K برای باز/بستن</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function badgeForType(t: GlobalSearchItem["type"]) {
  const variant: Record<
    GlobalSearchItem["type"],
    "secondary" | "outline" | "default" | "destructive"
  > = {
    nav: "secondary",
    employee: "outline",
    task: "default",
    activity: "secondary",
    action: "destructive",
  };
  const label: Record<GlobalSearchItem["type"], string> = {
    nav: "مسیر",
    employee: "کارمند",
    task: "وظیفه",
    activity: "رویداد",
    action: "اکشن",
  };
  return (
    <Badge
      variant={variant[t]}
      className="ml-auto rtl:mr-auto text-[10px] font-normal">
      {label[t]}
    </Badge>
  );
}

function iconForItem(item: GlobalSearchItem) {
  switch (item.type) {
    case "employee":
      return <User2 className="size-4" />;
    case "task":
      return <ListTodo className="size-4" />;
    case "activity":
      return <Activity className="size-4" />;
    case "action":
      return <Settings2 className="size-4" />;
    case "nav":
    default:
      return <Waypoints className="size-4" />;
  }
}

/*
  نکات توسعه آینده:
  - افزودن fuzzy search حرفه‌ای (FUSE.js)
  - پشتیبانی از history آیتم های انتخاب شده
  - افزودن quick preview پنل کناری برای آیتم ها
  - بارگذاری lazy داده های سنگین (مثل لیست کامل کارمندان)
  - اتصال به API واقعی
*/
 