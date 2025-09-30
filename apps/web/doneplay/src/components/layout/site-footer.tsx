"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Globe2,
  ShieldCheck,
  Workflow,
  Github,
  LayoutDashboard,
  BookOpen,
  Scale,
  ArrowRight,
} from "lucide-react";

interface SiteFooterProps {
  className?: string;
}

const navGroups: {
  heading: string;
  links: { label: string; href: string }[];
}[] = [
  {
    heading: "محصول",
    links: [
      { label: "داشبورد", href: "/dashboard" },
      { label: "معرفی", href: "#intro" },
      { label: "ارزش‌ها", href: "#value" },
      { label: "معماری", href: "#features" },
      { label: "قیمت", href: "#pricing" },
    ],
  },
  {
    heading: "منابع",
    links: [
      { label: "مستندات", href: "#" },
      { label: "راهنمای شروع", href: "#" },
      { label: "وبلاگ", href: "#" },
      { label: "سوالات متداول", href: "#" },
    ],
  },
  {
    heading: "حقوقی",
    links: [
      { label: "شرایط استفاده", href: "#" },
      { label: "حریم خصوصی", href: "#" },
      { label: "سیاست کوکی", href: "#" },
      { label: "امنیت", href: "#security" },
    ],
  },
];

const valueSignals = [
  { icon: <ShieldCheck className="size-4" />, label: "Data Governance" },
  { icon: <Workflow className="size-4" />, label: "Flow Automation" },
  { icon: <Sparkles className="size-4" />, label: "Human-Centered" },
];

const groupIcons: Record<string, React.ReactNode> = {
  محصول: <LayoutDashboard className="size-3.5 text-primary" />,
  منابع: <BookOpen className="size-3.5 text-primary" />,
  حقوقی: <Scale className="size-3.5 text-primary" />,
};

export const SiteFooter: React.FC<SiteFooterProps> = ({ className }) => {
  const year = new Date().getFullYear();
  return (
    <footer
      className={cn(
        "relative isolate overflow-hidden border-t border-border/60 bg-gradient-to-b from-background/95 via-background to-background/98 px-4 md:px-8 pt-20 pb-14 mt-32",
        className
      )}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_70%_10%,hsl(var(--primary)/0.25),transparent_55%)]" />
      </div>
      <div className="mx-auto max-w-7xl">
        {/* CTA band */}
        <div className="mb-14 rounded-xl border border-border/50 bg-background/60 backdrop-blur-md p-5 md:p-6 flex flex-col md:flex-row gap-5 md:items-center md:justify-between shadow-[0_4px_28px_-10px_hsla(var(--primary-h),var(--primary-s),var(--primary-l),0.25)]">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              آماده ورود به فضای یکپارچه دآن؟
            </h3>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed max-w-md">
              داشبورد تحلیلی و جریان ساخت ارزیابی را تجربه کنید؛ از مشاهده تا
              اقدام ساخت‌یافته فقط یک کلیک فاصله دارد.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground shadow hover:bg-primary/90 transition">
              ورود به داشبورد
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition" />
            </a>
            <a
              href="https://wa.me/989173001130"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background/60 px-4 py-2 text-[12px] font-medium text-foreground hover:bg-background/80 transition">
              مشاوره سریع
            </a>
          </div>
        </div>
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-12 items-start">
          {/* Brand / narrative */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-primary/10 ring-1 ring-primary/25 flex items-center justify-center text-primary">
                <Sparkles className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight">
                  دآن پلتفرم
                </span>
                <span className="text-[10px] text-muted-foreground/80">
                  ارزیابی • رشد • اقدام
                </span>
              </div>
            </div>
            <p className="text-[12px] leading-relaxed text-muted-foreground/90 max-w-md">
              هسته‌ی یک سامانه یکپارچه برای تبدیل داده تعامل و عملکرد به سیگنال
              قابل اقدام؛ تسهیل حلقه مداوم مشاهده، تفسیر، تصمیم و تثبیت.
            </p>
            <div className="flex flex-wrap gap-2">
              {valueSignals.map((v) => (
                <span
                  key={v.label}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary/80 backdrop-blur-sm">
                  {v.icon}
                  {v.label}
                </span>
              ))}
            </div>
            <div className="space-y-3 text-[11px] text-muted-foreground/80">
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <span>شیراز، معالی‌آباد، آموزشگاه نمازی</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="size-4 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0">
                  <a
                    href="tel:09173001130"
                    className="hover:text-primary transition">
                    09173001130
                  </a>
                  <a
                    href="tel:09305138169"
                    className="hover:text-primary transition">
                    09305138169
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="size-4 text-primary shrink-0 mt-0.5" />
                <a
                  href="mailto:info@don-platform.app"
                  className="hover:text-primary transition">
                  info@don-platform.app
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Globe2 className="size-4 text-primary shrink-0 mt-0.5" />
                <a
                  href="https://don-platform.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition">
                  don-platform.app
                </a>
              </div>
            </div>
          </div>
          {/* Navigation groups */}
          <div className="lg:col-span-4 grid sm:grid-cols-2 gap-8 lg:gap-10">
            {navGroups.map((group) => (
              <div key={group.heading} className="space-y-4">
                <h3 className="text-[11px] font-semibold tracking-wide text-muted-foreground/70 inline-flex items-center gap-1.5">
                  {groupIcons[group.heading]}
                  <span>{group.heading}</span>
                </h3>
                <ul className="space-y-2">
                  {group.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-[12px] text-muted-foreground/80 hover:text-primary transition inline-flex items-center gap-1">
                        <span className="h-px w-2 bg-primary/30 rounded-full transition-all duration-300 group-hover:w-3" />
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* Extra / newsletter */}
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold tracking-tight">
                خبرنامه و به‌روزرسانی
              </h4>
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                انتشار ماژول‌ها، قابلیت‌های تحلیلی جدید و راهنماهای کاربردی را
                دریافت کنید.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="flex flex-wrap items-center gap-2">
                <input
                  type="email"
                  required
                  placeholder="ایمیل سازمانی"
                  className="flex-1 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="submit"
                  className="rounded-md bg-primary text-primary-foreground text-[12px] font-medium px-4 py-2 hover:bg-primary/90 transition">
                  عضویت
                </button>
              </form>
            </div>
            <div className="space-y-3 text-[11px] text-muted-foreground/70 leading-relaxed">
              <p>
                سطوح دسترسی و ممیزی امنیتی به صورت دوره‌ای بازبینی می‌شود. گزارش
                امنیتی و سطوح انطباق بنا به درخواست ارائه می‌گردد.
              </p>
              <p>
                در صورت نیاز به یکپارچه‌سازی سفارشی یا API اختصاصی با ما در تماس
                باشید.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition inline-flex items-center gap-1">
                <Github className="size-4" /> Github
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
          <p className="text-[10.5px] text-muted-foreground/70 tracking-tight">
            © {year} Don Platform. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground/60">
            <span>Build: v1.0.0</span>
            <span>Latency Aware</span>
            <span>Secure Edge</span>
            <span>Multi-tenant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

SiteFooter.displayName = "SiteFooter";
