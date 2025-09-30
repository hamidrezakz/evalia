"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { PageSection } from "@/components/sections";
import { HeroBackground } from "@/components/sections/hero-backgrounds";
import {
  LayoutDashboard,
  ServerCog,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FeatureCard } from "@/components/ui/feature-card";
import { Badge } from "@/components/ui/badge";

export interface FeatureShowcaseSectionProps {
  className?: string;
  dark?: boolean; // حالت تیره تر پس زمینه
}

interface ShowcaseItem {
  title: string;
  tagline: string;
  icon: React.ReactNode;
  bullets: string[];
  badge: string;
}
const showcase: ShowcaseItem[] = [
  {
    title: "هسته داشبورد",
    tagline: "نمای ۳۶۰ + جریان واحد",
    icon: <LayoutDashboard className="size-6" />,
    bullets: [
      "Navigation ماژولار فشرده",
      "Context همزمان چند سازمان",
      "Dark / RTL بومی",
    ],
    badge: "ui",
  },
  {
    title: "زیرساخت سرویس",
    tagline: "مقیاس بهینه + انزوا",
    icon: <ServerCog className="size-6" />,
    bullets: ["Multi-tenant ایزوله", "Versioned Schema", "Reactive Cache"],
    badge: "core",
  },
  {
    title: "تحلیل و سیگنال",
    tagline: "الگو • نرمال‌سازی • هشدار",
    icon: <BarChart3 className="size-6" />,
    bullets: [
      "مدل چندبعدی عملکرد",
      "سیگنال همسویی / انرژی",
      "Early Warning Layer",
    ],
    badge: "insight",
  },
  {
    title: "امنیت و انطباق",
    tagline: "کنترل • ممیزی • اعتماد",
    icon: <ShieldCheck className="size-6" />,
    bullets: ["Role Segmentation", "Token Hygiene", "Audit Trail"],
    badge: "security",
  },
];

export function FeatureShowcaseSection({
  className,
  dark,
}: FeatureShowcaseSectionProps) {
  return (
    <PageSection
      id="features"
      className={cn(
        "relative isolate overflow-visible p-4 py-24 md:py-32",
        dark
          ? "bg-gradient-to-b from-background/95 via-background/90 to-background/95"
          : "bg-gradient-to-b from-background/96 via-background/93 to-background/96",
        className
      )}>
      <div
        aria-hidden
        className="absolute inset-0 z-0 pointer-events-none overflow-visible">
        <HeroBackground variant="soft" />
         <HeroBackground variant="icons-assessment" />
        <HeroBackground variant="icons-team" />
        <HeroBackground variant="icons-dev" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-[11px] font-medium text-primary/90 backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              <span>معماری محصول</span>
            </div>
            <h2 className="text-xl md:text-3xl font-extrabold leading-tight tracking-tight">
              معماری پنل: هسته منسجم، لایه‌های تخصصی
            </h2>
            <p className="text-muted-foreground text-[12px] leading-relaxed">
              داشبورد دآن به‌جای پراکندگی ابزار، سطح واحد مشاهده، تحلیل و اقدام
              می‌سازد؛ هر لایه بدون شکستن جریان قابل گسترش است.
            </p>
          </div>
          <div className="text-[11px] text-muted-foreground/80 max-w-sm leading-relaxed">
            تمرکز: کاهش اصطکاک شناختی، انسجام داده، سطح تکی تصمیم. از تیم کوچک
            تا ساختار چندسازمانی، جریان ثابت می‌ماند.
          </div>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {showcase.map((item) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              tagline={item.tagline}
              bullets={item.bullets}
              badge={item.badge}
              icon={item.icon}
              iconSize="sm"
              compact
              showSeparator={false}
            />
          ))}
        </div>
      </div>
    </PageSection>
  );
}
