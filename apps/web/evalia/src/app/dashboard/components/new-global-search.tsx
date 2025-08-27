"use client";

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
import { ModeToggle } from "@/components/modetoggle";

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
  const [filterDuration, setFilterDuration] = React.useState<number | null>(
    null
  );
  const allItems = React.useMemo(() => buildItems(), []);
  const filtered = React.useMemo(() => {
    const t0 = performance.now();
    const result = filterItems(allItems, query);
    const t1 = performance.now();
    setFilterDuration(t1 - t0);
    return result;
  }, [allItems, query]);
  const router = useRouter();
  const pathname = usePathname();

  // recent & pinned state
  const [recentIds, setRecentIds] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("__gs_recent");
      if (!raw) return [];
      const arr = JSON.parse(raw) as string[];
      return Array.isArray(arr) ? arr.slice(0, 12) : [];
    } catch {
      return [];
    }
  });
  const pinnedIds = React.useMemo(() => ["nav-/dashboard"], []);
  const saveRecent = React.useCallback((id: string) => {
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 12);
      try {
        localStorage.setItem("__gs_recent", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // keyboard shortcut (Ctrl/Cmd + K)
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
      saveRecent(item.id);
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
      saveRecent(item.id);
      setOpen(false);
      return;
    }
  }

  // group building
  const groups = React.useMemo(() => {
    const map = new Map<string, GlobalSearchItem[]>();
    filtered.forEach((it: GlobalSearchItem) => {
      if (!map.has(it.group)) map.set(it.group, []);
      map.get(it.group)!.push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const enhancedGroups = React.useMemo(() => {
    const map = new Map<string, GlobalSearchItem[]>();
    groups.forEach(([g, items]) => map.set(g, items));
    const byId = new Map(allItems.map((i) => [i.id, i] as const));
    const pinnedItems = pinnedIds
      .map((id) => byId.get(id))
      .filter(Boolean) as GlobalSearchItem[];
    const recentItems = recentIds
      .map((id) => byId.get(id))
      .filter(Boolean) as GlobalSearchItem[];
    const ordered: [string, GlobalSearchItem[]][] = [];
    if (pinnedItems.length) ordered.push(["پین شده", pinnedItems]);
    if (recentItems.length) ordered.push(["اخیر", recentItems]);
    map.forEach((val, key) => ordered.push([key, val]));
    return ordered;
  }, [groups, pinnedIds, recentIds, allItems]);

  const highlight = React.useCallback(
    (text: string) => {
      if (!query.trim()) return text;
      const q = query.trim();
      try {
        const regex = new RegExp(
          `(${q.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`,
          "ig"
        );
        return text.split(regex).map((part, i) => {
          if (!part) return null;
          return regex.test(part) ? (
            <mark
              key={i}
              className="rounded-sm bg-amber-200/60 px-0.5 py-0.5 text-amber-800 dark:bg-amber-400/20 dark:text-amber-100">
              {part}
            </mark>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          );
        });
      } catch {
        return text;
      }
    },
    [query]
  );

  const [hovered, setHovered] = React.useState<GlobalSearchItem | null>(null);

  return (
    <>
      <Button
        variant="outline"
        className="size-9 sm:px-4 sm:py-2 sm:has-[>svg]:px-3 sm:w-fit"
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
        className="sm:max-w-xl md:max-w-2xl xl:max-w-3xl w-full max-h-[90vh] h-[65vh] md:h-[70vh] top-[38vh] md:top-[40vh]">
        <div className="relative flex flex-col gap-3 pb-2">
          <CommandInput
            className="mr-8 rounded-lg backdrop-blur supports-[backdrop-filter]:backdrop-blur-md"
            searchIconClassName="hidden"
            placeholder="جستجو یا فرمان..."
            autoFocus
            value={query}
            onValueChange={setQuery as any}
          />
          <div className="pointer-events-none absolute inset-x-0 top-full h-px bg-gradient-to-r from-transparent via-border/70 to-transparent" />
        </div>
        <CommandList className="max-h-[60vh] items-center sm:max-h-[65vh] lg:max-h-[90vh] pr-2">
          <CommandEmpty>موردی یافت نشد</CommandEmpty>
          <div className="flex h-full w-full flex-col lg:flex-row lg:gap-3">
            <div className="flex-1 overflow-y-auto pr-1">
              {enhancedGroups.map(([group, items]) => (
                <CommandGroup
                  heading={group}
                  key={group}
                  className="relative mt-2 space-y-0.5 [&_[cmdk-group-heading]]:hidden">
                  <div className="sticky -top-1 z-10 mb-1 rounded-md border border-border/50 bg-gradient-to-l from-background/95 to-background/70 px-2 py-1 text-[11px] font-semibold backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
                    {group}
                  </div>
                  {items.map((item) => (
                    <SearchResultItem
                      key={item.id}
                      item={item}
                      highlight={highlight}
                      pinned={pinnedIds.includes(item.id)}
                      onSelect={() => runItem(item)}
                      onHover={() => setHovered(item)}
                    />
                  ))}
                </CommandGroup>
              ))}
            </div>
            {/* Preview panel */}
            <div className="hidden lg:flex w-[32%] min-w-[240px] max-h-[420px] flex-col rounded-xl border bg-gradient-to-br from-background/80 to-background/40 p-3 backdrop-blur-sm">
              <div className="mb-2 text-xs font-semibold text-muted-foreground">
                پیش‌نمایش
              </div>
              {hovered ? (
                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground/70 ring-1 ring-border/50">
                      {iconForItem(hovered)}
                    </span>
                    <span className="font-medium text-[12px]">
                      {hovered.title}
                    </span>
                  </div>
                  {hovered.subtitle && (
                    <p className="text-muted-foreground">{hovered.subtitle}</p>
                  )}
                  <div className="rounded-md border bg-background/50 p-2 text-[10px] text-muted-foreground">
                    نوع: {badgeLabelForType(hovered.type)}
                  </div>
                  <p className="text-[10px] text-foreground/70">
                    (پنل پیش‌نمایش قابل توسعه برای نمایش جزئیات بیشتر، میانبرها
                    و اکشن‌های سریع)
                  </p>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                  یک مورد را انتخاب یا هاور کنید
                </div>
              )}
            </div>
          </div>
          <CommandSeparator className="my-3" />
          <CommandGroup heading="راهنما">
            <CommandItem disabled>
              <PanelLeft className="size-4" />
              <span>Ctrl + K برای باز/بستن</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <SearchFooter
          filtered={filtered.length}
          total={allItems.length}
          duration={filterDuration}
          query={query}
          onClear={() => setQuery("")}
        />
      </CommandDialog>
    </>
  );
}

// --- Footer helper component key hints ---
function KeyHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-0.5">
      {keys.map((k, i) => (
        <kbd
          key={i}
          className="rounded-sm border bg-muted px-1 py-0.5 font-sans text-[9px] tracking-wide text-muted-foreground shadow-sm">
          {k}
        </kbd>
      ))}
      <span className="text-[9px] opacity-70">{label}</span>
    </span>
  );
}

function badgeForType(t: GlobalSearchItem["type"]) {
  const variant: Record<string, string> = {
    nav: "secondary",
    employee: "outline",
    task: "default",
    activity: "secondary",
    action: "destructive",
  };
  const label: Record<string, string> = {
    nav: "مسیر",
    employee: "کارمند",
    task: "وظیفه",
    activity: "رویداد",
    action: "اکشن",
  };
  return (
    <Badge
      variant={variant[t] as any}
      className="ml-auto rtl:mr-auto text-[10px] font-normal">
      {label[t]}
    </Badge>
  );
}

interface SearchFooterProps {
  filtered: number;
  total: number;
  duration: number | null;
  query: string;
  onClear: () => void;
}

function SearchFooter({
  filtered,
  total,
  duration,
  query,
  onClear,
}: SearchFooterProps) {
  return (
    <div
      dir="rtl"
      aria-label="نوار راهنمای جستجو"
      className="mt-2 hidden sm:flex flex-col gap-2 border-t border-border/60 bg-gradient-to-tr from-background/60 to-background/30 px-3 py-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
        <KeyHint keys={["Esc"]} label="بستن" />
        <KeyHint keys={["Enter"]} label="انتخاب" />
        <KeyHint keys={["↑", "↓"]} label="حرکت" />
        <KeyHint keys={["Tab"]} label="گروه بعد" />
        <KeyHint keys={["Ctrl", "K"]} label="باز/بستن" />
        <span className="mx-2 hidden h-3 w-px bg-border sm:inline" />
        <span aria-live="polite">
          {filtered} نتیجه{query && " / " + total}
          {duration !== null && (
            <span className="opacity-60"> · {duration.toFixed(1)}ms</span>
          )}
        </span>
        {query && (
          <button
            type="button"
            onClick={onClear}
            className="rounded border border-transparent px-1.5 py-0.5 text-[10px] font-medium text-foreground/80 hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            پاک کردن
          </button>
        )}
        <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </div>
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

// label helper for preview panel
function badgeLabelForType(t: GlobalSearchItem["type"]) {
  switch (t) {
    case "nav":
      return "مسیر";
    case "employee":
      return "کارمند";
    case "task":
      return "وظیفه";
    case "activity":
      return "رویداد";
    case "action":
      return "اکشن";
    default:
      return t;
  }
}

interface SearchResultItemProps {
  item: GlobalSearchItem;
  highlight: (s: string) => React.ReactNode | string;
  pinned: boolean;
  onSelect: () => void;
  onHover: () => void;
}

const SearchResultItem = React.memo(function SearchResultItem({
  item,
  highlight,
  pinned,
  onSelect,
  onHover,
}: SearchResultItemProps) {
  return (
    <CommandItem
      key={item.id}
      value={item.title}
      onSelect={onSelect}
      onMouseEnter={onHover}
      className="group relative flex items-center gap-3 rounded-md border border-transparent px-2 py-2 text-[12px] transition-all data-[selected=true]:border-primary/40 data-[selected=true]:bg-primary/5 hover:border-border hover:bg-muted/40 focus-visible:outline-none">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-muted to-muted/60 text-foreground/70 shadow-inner ring-1 ring-border/50 group-data-[selected=true]:from-primary/20 group-data-[selected=true]:to-primary/10">
        {iconForItem(item)}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 overflow-hidden">
        <span className="truncate font-medium text-[12px] md:text-[13px]">
          {highlight(item.title) as any}
        </span>
        {item.subtitle && (
          <span className="truncate text-[10px] text-muted-foreground">
            {highlight(item.subtitle) as any}
          </span>
        )}
      </div>
      <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
        {item.shortcut && (
          <CommandShortcut className="flex gap-1 text-[10px]">
            {item.shortcut.map((s, i) => (
              <kbd
                key={i}
                className="rounded-sm border bg-muted px-1 py-0.5 font-sans text-[10px] tracking-wide text-muted-foreground shadow-sm">
                {s}
              </kbd>
            ))}
          </CommandShortcut>
        )}
        {badgeForType(item.type)}
        {pinned && (
          <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary/80 ring-1 ring-primary/20">
            پین
          </span>
        )}
      </div>
    </CommandItem>
  );
});

/*
  نکات توسعه آینده:
  - افزودن fuzzy search حرفه‌ای (FUSE.js)
  - پشتیبانی از history آیتم های انتخاب شده
  - افزودن quick preview پنل کناری برای آیتم ها
  - بارگذاری lazy داده های سنگین (مثل لیست کامل کارمندان)
  - اتصال به API واقعی
*/
