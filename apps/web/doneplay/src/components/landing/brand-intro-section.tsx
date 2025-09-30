"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { PageSection } from "@/components/sections";
import { HeroBackground } from "@/components/sections/hero-backgrounds";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Workflow,
  LineChart,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { FeatureCard } from "@/components/ui/feature-card";
import { Badge } from "@/components/ui/badge";

interface Metric {
  label: string;
  value: string;
  hint?: string;
}

const metrics: Metric[] = [
  { label: "عمق تحلیل", value: "۶ بعد", hint: "مدل چندبعدی رفتار / تعامل" },
  { label: "زمان استقرار", value: "< ۵ روز", hint: "از طراحی تا اولین خروجی" },
  {
    label: "پایداری مشارکت",
    value: "+۳۲٪",
    hint: "میانگین بهبود در کوهورت‌ها",
  },
  { label: "چرخ تحلیل", value: "۹ جلسه", hint: "چرخه اجرایی پایه" },
];

const featureCards = [
  {
    icon: <Layers />,
    title: "مدل یکپارچه چندبعدی",
    tagline: "عملکرد • همسویی • تعامل • انرژی",
    bullets: ["ترکیب داده رفتاری", "نرمال‌سازی چندلایه", "قابل توسعه سازمانی"],
    badge: { label: "MODEL", icon: <Layers className="size-3" /> },
  },
  {
    icon: <Workflow />,
    title: "حلقه توسعه مداوم",
    tagline: "مشاهده → تفسیر → اقدام → تثبیت",
    bullets: ["چرخه ۹ مرحله‌ای", "کاهش زمان تصمیم", "خروجی ساخت‌یافته"],
    badge: { label: "LOOP", icon: <Workflow className="size-3" /> },
  },
  {
    icon: <LineChart />,
    title: "تحلیل و سیگنال",
    tagline: "کاهش نویز، استخراج الگو و هشدار",
    bullets: ["سیگنال کم‌نویز", "هشدار ریسک زودهنگام", "استخراج الگو"],
    badge: { label: "INSIGHT", icon: <LineChart className="size-3" /> },
  },
  {
    icon: <ShieldCheck />,
    title: "اعتماد و حاکمیت",
    tagline: "چندمستاجری امن + ممیزی + نسخه",
    bullets: ["ایزولاسیون داده", "مسیر ممیزی شفاف", "کنترل نسخه"],
    badge: { label: "TRUST", icon: <ShieldCheck className="size-3" /> },
  },
];

export interface BrandIntroSectionProps {
  id?: string;
  className?: string;
  compact?: boolean;
}

export const BrandIntroSection: React.FC<BrandIntroSectionProps> = ({
  id = "intro",
  className,
  compact,
}) => {
  return (
    <PageSection
      id={id}
      className={cn(
        "relative isolate overflow-visible p-4 md:p-8 py-28 md:py-36",
        "bg-gradient-to-b from-background/96 via-background to-background/96",
        className
      )}>
      <div aria-hidden className="absolute inset-0 z-0 pointer-events-none">
        <HeroBackground variant="mesh" />
        <HeroBackground variant="soft" />
        <HeroBackground variant="signal" />
        <HeroBackground variant="icons-edu" />
        <HeroBackground variant="icons-team" />
        <HeroBackground variant="icons-dev" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-12 lg:gap-20 lg:grid-cols-12 items-start">
          {/* Cards (left on large screens) */}
          <div className="lg:col-span-7 items-center justify-center mt-[6%] order-2">
            <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
              {featureCards.map((c) => (
                <FeatureCard
                  key={c.title}
                  title={c.title}
                  tagline={c.tagline}
                  icon={c.icon}
                  iconSize="sm"
                  bullets={c.bullets}
                  showSeparator
                  badge={
                    <Badge
                      variant="secondary"
                      className="bg-primary/12 text-primary/80 ring-1 ring-primary/20 border-transparent flex items-center gap-1 px-2 py-0.5 text-[10px]">
                      {c.badge.icon}
                      <span className="tracking-wide font-medium">
                        {c.badge.label}
                      </span>
                    </Badge>
                  }
                />
              ))}
            </div>
          </div>
          {/* Narrative (right) */}
          <div className="lg:col-span-5 order-1 space-y-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-[11px] font-medium text-primary/90 backdrop-blur-sm">
                <Sparkles className="size-3.5" />
                <span>هسته پلتفرم دآن</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
                زیرساخت جامع ارزیابی و توسعه
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                دآن هسته‌ی یک پلتفرم ترکیبی برای دیدن «وضعیت واقعی» و هدایت
                <span className="text-primary font-medium">
                  {" "}
                  رشد تکرارشونده{" "}
                </span>
                است؛ ما فاصله بین داده تا اقدام را حداقل می‌کنیم.
              </p>
              <div className="space-y-2 text-[12px] text-muted-foreground/90 leading-relaxed">
                <p>
                  تمرکز: استخراج الگوی معنادار، ارائه سیگنال کم‌نویز و تبدیل آن
                  به نقشه اقدام مستند.
                </p>
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-primary/80 mt-1">
                  <span className="inline-flex items-center gap-1">
                    • ۶ بعد
                  </span>
                  <span className="inline-flex items-center gap-1">
                    • کمتر از ۵ روز استقرار
                  </span>
                  <span className="inline-flex items-center gap-1">
                    • حلقه ۹ مرحله‌ای
                  </span>
                  <span className="inline-flex items-center gap-1">
                    • +۳۲٪ همسویی
                  </span>
                </p>
              </div>
            </div>
            <Panel className="bg-background/30 border-border/60 backdrop-blur-sm p-0 shadow-md overflow-hidden">
              <PanelHeader className="px-5 pt-5 pb-3 flex flex-col gap-1">
                <PanelTitle className="text-sm font-semibold tracking-tight">
                  Snapshot اثر اولیه
                </PanelTitle>
                <PanelDescription className="text-[11px] leading-relaxed">
                  مقادیر نمونه بعد از چند چرخه آزمایشی
                </PanelDescription>
              </PanelHeader>
              <Separator className="mx-5 bg-border/60" />
              <PanelContent className="px-5 py-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                {metrics.map((m) => (
                  <div key={m.label} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-primary tracking-tight">
                      {m.value}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {m.label}
                    </span>
                    {m.hint && (
                      <span className="text-[9px] text-muted-foreground/60 leading-tight">
                        {m.hint}
                      </span>
                    )}
                  </div>
                ))}
              </PanelContent>
            </Panel>
          </div>
        </div>
      </div>
    </PageSection>
  );
};

BrandIntroSection.displayName = "BrandIntroSection";
