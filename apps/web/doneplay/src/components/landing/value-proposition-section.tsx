"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { PageSection } from "@/components/sections";
import { HeroBackground } from "@/components/sections/hero-backgrounds";
import {
  ShieldCheck,
  LineChart,
  Sparkles,
  Users2,
  Layers,
  Workflow,
  Rocket,
  Gauge,
} from "lucide-react";
import { FeatureCard } from "@/components/ui/feature-card";

export interface ValuePropositionSectionProps {
  className?: string;
  subtle?: boolean; // حالت مینیمال تر بدون بلاب های رنگی
}

const features = [
  {
    icon: <ShieldCheck />,
    title: "اعتماد و حاکمیت",
    tagline: "ایزولاسیون • نسخه‌پذیری • ردیابی تغییر",
    bullets: ["ایزولاسیون سازمانی", "ثبت تاریخچه و نسخه", "کنترل دسترسی شفاف"],
  },
  {
    icon: <LineChart />,
    title: "بینش قابل اقدام",
    tagline: "مدل چندبعدی + نرمال‌سازی + الگو",
    bullets: ["تحلیل چندبعدی", "سیگنال همسویی", "تشخیص الگوی رفتاری"],
  },
  {
    icon: <Users2 />,
    title: "همسویی و رشد",
    tagline: "ارزیابی ۳۶۰ + مسیر فردی",
    bullets: ["بازخورد ساخت‌یافته", "دفترچه رشد", "نقشه اقدام"],
  },
  {
    icon: <Gauge />,
    title: "کارایی و مقیاس",
    tagline: "کش واکنشی + کوئری بهینه",
    bullets: ["عملکرد پایدار", "ده‌ها هزار پاسخ", "Invalidation هوشمند"],
  },
  {
    icon: <Sparkles />,
    title: "طراحی انسان‌محور",
    tagline: "متراکم، واضح، بدون اصطکاک",
    bullets: ["تمرکز جریان ساخت", "خوانایی بالا", "Dark / RTL بومی"],
  },
  {
    icon: <Rocket />,
    title: "آمادگی سازمانی",
    tagline: "نقش‌ها • دامنه • انطباق",
    bullets: ["Role Segmentation", "Multi-Domain Ready", "Governance Hooks"],
  },
];

export function ValuePropositionSection({
  className,
  subtle,
}: ValuePropositionSectionProps) {
  return (
    <PageSection
      id="value"
      className={cn(
        "relative isolate overflow-visible p-4 py-20 md:py-28",
        // پس‌زمینه سکشن را کمی شفاف می‌کنیم که لایه‌های تزئینی دیده شوند
        "bg-gradient-to-b from-background/95 via-background/92 to-background/95",
        className
      )}>
      {!subtle && (
        <div
          aria-hidden
          className={
            // بدون z- منفی تا روی رنگ پایه سکشن بنشیند ولی زیر محتوا بماند
            "absolute inset-0 z-0 pointer-events-none overflow-visible"
          }>
          <HeroBackground variant="mesh" />
                  <HeroBackground variant="signal" />
                  <HeroBackground variant="soft" />
                  <HeroBackground variant="icons-edu" />
                  <HeroBackground variant="icons-team" />
                  <HeroBackground variant="icons-assessment" />
        </div>
      )}
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-4 py-1 backdrop-blur-lg text-[11px] font-medium text-primary">
            <Sparkles className="size-3.5" />
            <span>چرا دآن؟</span>
          </div>
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight leading-tight">
            پایه‌ی چابک برای چرخه‌های ارزیابی و رشد
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            دآن فراتر از فرم است؛ حلقه‌ی داده → بینش → اقدام را سبک، منظم و
            مقیاس‌پذیر اجرا می‌کند تا تیم‌ و مدرسه بدون فرسایش ابزارهای پراکنده
            همسو بمانند.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <FeatureCard
              key={f.title}
              title={f.title}
              tagline={f.tagline}
              icon={f.icon}
              iconSize="sm"
              compact
              bullets={f.bullets}
              showSeparator={false}
            />
          ))}
        </div>
      </div>
    </PageSection>
  );
}
