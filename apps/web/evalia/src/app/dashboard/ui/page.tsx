import Link from "next/link";

export default function UIShowcaseIndex() {
  const items: { href: string; title: string; desc: string }[] = [
    {
      href: "/dashboard/ui/buttons",
      title: "دکمه‌ها",
      desc: "انواع Variant و Size",
    },
    {
      href: "/dashboard/ui/forms",
      title: "ورودی‌ها و فرم",
      desc: "Input, Label و وضعیت‌ها",
    },
    {
      href: "/dashboard/ui/feedback",
      title: "بازخورد و منوها",
      desc: "Dropdown, Tooltip, Skeleton",
    },
    {
      href: "/dashboard/ui/card",
      title: "کارت‌ها",
      desc: "Card, CardHeader, CardContent",
    },
    {
      href: "/dashboard/ui/panel",
      title: "پنل‌ها",
      desc: "Panel, PanelHeader, PanelContent",
    },
    {
      href: "/dashboard/ui/chart",
      title: "نمودارها",
      desc: "BarChart, LineChart, PieChart",
    }
  ];
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="text-lg font-bold">راهنمای کامپوننت‌های UI</h1>
      <p className="text-sm text-muted-foreground">
        مرتب‌سازی شده برای ارائه به مدیر پروژه
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="bg-muted/50 rounded-xl p-4 hover:bg-muted transition-colors">
            <div className="font-medium mb-1">{it.title}</div>
            <div className="text-xs text-muted-foreground">{it.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
