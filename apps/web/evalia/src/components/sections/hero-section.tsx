"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageSection } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { PrimaryNavigation } from "@/components/primary-navigation";

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
};

export type HeroSectionProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  primaryAction?: Action;
  secondaryAction?: Action;
  className?: string;
  highlight?: string; // متن کوچک بالای عنوان
  fullHeight?: boolean; // پر کردن ارتفاع ویوپرت
  headerLeft?: React.ReactNode; // محتوای سمت چپ هدر (مثلاً ModeToggle)
  headerRight?: React.ReactNode; // محتوای سمت راست هدر (مثلاً لوگو)
  headerCenter?: React.ReactNode; // منو یا ناوبری وسط هدر
  headerLeftClassName?: string; // کلاس سفارشی برای کانتینر ناحیه چپ
  headerRightClassName?: string; // کلاس سفارشی برای کانتینر ناحیه راست
  headerCenterClassName?: string; // کلاس سفارشی برای کانتینر ناحیه وسط
  headerBarClassName?: string; // کلاس سفارشی برای wrapper اصلی هدر
};

/**
 * HeroSection: سکشن قهرمان ساده، وسط‌چین و تمیز
 * - از سیستم رنگ و تایپوگرافی فعلی استفاده می‌کند
 * - دکمه‌ها با shadcn/ui Button ساخته می‌شوند
 * - با PageSection یکپارچه است و container را رعایت می‌کند
 */
export function HeroSection({
  title = (
    <>
      راهکار سازمانی <span className="text-primary">Evalia</span>
    </>
  ),
  description = "داشبورد منابع انسانی مدرن با تمرکز بر سادگی، سرعت و یکپارچگی",
  primaryAction = { label: "شروع کنید", href: "/dashboard/ui" },
  secondaryAction = { label: "مشاهده مستندات", href: "/dashboard/ui/feedback" },
  className,
  highlight,
  fullHeight,
  headerLeft,
  headerRight,
  headerCenter,
  headerLeftClassName,
  headerRightClassName,
  headerCenterClassName,
  headerBarClassName,
}: HeroSectionProps) {
  return (
    <PageSection
      className={cn(
        "flex text-center relative items-center align-middle",
        fullHeight && "items-center py-0 px-2 min-h-[100svh]",
        className
      )}>
      <div className="mx-auto max-w-3xl space-y-4">
        {/* هدر شناور داخل هیرو: چپ/راست با فاصله 4 */}
        <div className={cn("absolute inset-x-0 top-0", headerBarClassName)}>
          <div className="container flex items-start justify-between gap-2">
            {/* ناحیه راست (معمولاً لوگو در RTL) */}
            <div className={cn("p-4 flex items-center", headerRightClassName)}>
              {headerRight ?? (
                <div
                  className="size-10 md:size-12 rounded-lg bg-muted/50 border border-border"
                  aria-label="لوگو پیش‌فرض"
                  role="img"
                />
              )}
            </div>
            <div
              className={cn(
                "p-4 flex-1 flex items-center justify-center",
                headerCenterClassName
              )}>
              {headerCenter ?? <PrimaryNavigation className="max-w-full" />}
            </div>
            {/* ناحیه چپ (اکشن‌ها / سوییچر تم و غیره) */}
            <div className={cn("p-4 flex items-center", headerLeftClassName)}>
              {headerLeft}
            </div>
          </div>
        </div>
        {highlight ? (
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
            {highlight}
          </div>
        ) : null}

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-balance">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground text-base md:text-lg leading-7 text-pretty">
            {description}
          </p>
        ) : null}

        {(primaryAction || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {primaryAction &&
              (primaryAction.href ? (
                <Button
                  asChild
                  variant={primaryAction.variant ?? "default"}
                  size={primaryAction.size ?? "lg"}>
                  <Link href={primaryAction.href}>{primaryAction.label}</Link>
                </Button>
              ) : (
                <Button
                  onClick={primaryAction.onClick ?? (() => {})}
                  variant={primaryAction.variant ?? "default"}
                  size={primaryAction.size ?? "lg"}>
                  {primaryAction.label}
                </Button>
              ))}
            {secondaryAction &&
              (secondaryAction.href ? (
                <Button
                  asChild
                  variant={secondaryAction.variant ?? "outline"}
                  size={secondaryAction.size ?? "lg"}>
                  <Link href={secondaryAction.href}>
                    {secondaryAction.label}
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={secondaryAction.onClick ?? (() => {})}
                  variant={secondaryAction.variant ?? "outline"}
                  size={secondaryAction.size ?? "lg"}>
                  {secondaryAction.label}
                </Button>
              ))}
          </div>
        )}
      </div>
    </PageSection>
  );
}
