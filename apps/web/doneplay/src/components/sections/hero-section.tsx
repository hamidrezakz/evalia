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
  icon?: React.ReactNode; // آیکون اختیاری برای دکمه
  iconPosition?: "start" | "end"; // موقعیت آیکون نسبت به متن
  className?: string; // سفارشی‌سازی استایل دکمه
  labelClassName?: string; // سفارشی‌سازی متن دکمه
};

export type HeroSectionProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  primaryAction?: Action;
  secondaryAction?: Action;
  className?: string;
  highlight?: React.ReactNode; // متن کوچک بالای عنوان (قبلاً string بود)
  highlightClassName?: string; // سفارشی‌سازی استایل هایلایت
  fullHeight?: boolean; // پر کردن ارتفاع ویوپرت
  headerLeft?: React.ReactNode; // محتوای سمت چپ هدر (مثلاً ModeToggle)
  headerRight?: React.ReactNode; // محتوای سمت راست هدر (مثلاً لوگو)
  headerCenter?: React.ReactNode; // منو یا ناوبری وسط هدر
  headerLeftClassName?: string; // کلاس سفارشی برای کانتینر ناحیه چپ
  headerRightClassName?: string; // کلاس سفارشی برای کانتینر ناحیه راست
  headerCenterClassName?: string; // کلاس سفارشی برای کانتینر ناحیه وسط
  headerBarClassName?: string; // کلاس سفارشی برای wrapper اصلی هدر
  background?: React.ReactNode; // دکورهای پس‌زمینه (shapes / gradients)
  showScrollCue?: boolean; // نمایش یا عدم نمایش نشانگر اسکرول پایین سکشن
  scrollCueLabel?: string; // متن نشانگر اسکرول (پیش فرض: Scroll)
  scrollCueClassName?: string; // کلاس سفارشی برای کانتینر نشانگر
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
  highlightClassName,
  fullHeight,
  headerLeft,
  headerRight,
  headerCenter,
  headerLeftClassName,
  headerRightClassName,
  headerCenterClassName,
  headerBarClassName,
  background,
  showScrollCue = true,
  scrollCueLabel = "اسکرول کنید!",
  scrollCueClassName,
}: HeroSectionProps) {
  return (
    <PageSection
      className={cn(
        "flex text-center w-full relative items-center align-middle",
        fullHeight && "items-center py-0 px-2 min-h-[100svh]",
        className
      )}>
      {/* پس‌زمینه تزئینی */}
      {background ? (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden z-50"
          aria-hidden>
          {background}
        </div>
      ) : null}
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
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary ring-1 ring-primary/20 gap-1",
              highlightClassName
            )}>
            {highlight}
          </div>
        ) : null}

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight ">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground text-[12px] md:text-sm leading-5 text-pretty">
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
                  size={primaryAction.size ?? "default"}
                  className={primaryAction.className}>
                  <Link
                    href={primaryAction.href}
                    className="inline-flex items-center gap-1">
                    {primaryAction.icon &&
                      (primaryAction.iconPosition !== "end" ? (
                        <span className="shrink-0">{primaryAction.icon}</span>
                      ) : null)}
                    <span className={primaryAction.labelClassName}>
                      {primaryAction.label}
                    </span>
                    {primaryAction.icon &&
                      primaryAction.iconPosition === "end" && (
                        <span className="shrink-0">{primaryAction.icon}</span>
                      )}
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={primaryAction.onClick ?? (() => {})}
                  variant={primaryAction.variant ?? "default"}
                  size={primaryAction.size ?? "default"}
                  className={primaryAction.className}>
                  {primaryAction.icon &&
                    (primaryAction.iconPosition !== "end" ? (
                      <span className="shrink-0 mr-1">
                        {primaryAction.icon}
                      </span>
                    ) : null)}
                  <span className={primaryAction.labelClassName}>
                    {primaryAction.label}
                  </span>
                  {primaryAction.icon &&
                    primaryAction.iconPosition === "end" && (
                      <span className="shrink-0 ml-1">
                        {primaryAction.icon}
                      </span>
                    )}
                </Button>
              ))}
            {secondaryAction &&
              (secondaryAction.href ? (
                <Button
                  asChild
                  variant={secondaryAction.variant ?? "outline"}
                  size={secondaryAction.size ?? "lg"}
                  className={secondaryAction.className}>
                  <Link
                    href={secondaryAction.href}
                    className="inline-flex items-center gap-1">
                    {secondaryAction.icon &&
                      (secondaryAction.iconPosition !== "end" ? (
                        <span className="shrink-0">{secondaryAction.icon}</span>
                      ) : null)}
                    <span className={secondaryAction.labelClassName}>
                      {secondaryAction.label}
                    </span>
                    {secondaryAction.icon &&
                      secondaryAction.iconPosition === "end" && (
                        <span className="shrink-0">{secondaryAction.icon}</span>
                      )}
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={secondaryAction.onClick ?? (() => {})}
                  variant={secondaryAction.variant ?? "outline"}
                  size={secondaryAction.size ?? "lg"}
                  className={secondaryAction.className}>
                  {secondaryAction.icon &&
                    (secondaryAction.iconPosition !== "end" ? (
                      <span className="shrink-0 mr-1">
                        {secondaryAction.icon}
                      </span>
                    ) : null)}
                  <span className={secondaryAction.labelClassName}>
                    {secondaryAction.label}
                  </span>
                  {secondaryAction.icon &&
                    secondaryAction.iconPosition === "end" && (
                      <span className="shrink-0 ml-1">
                        {secondaryAction.icon}
                      </span>
                    )}
                </Button>
              ))}
          </div>
        )}
      </div>
      {/* Scroll Cue Indicator */}
      {showScrollCue ? (
        <div
          className={cn(
            "absolute bottom-3 inset-x-0 flex justify-center pointer-events-none select-none",
            scrollCueClassName
          )}
          aria-hidden>
          <div className="flex flex-col items-center gap-1 animate-bounce-slow">
            {/* mouse shape */}
            <div className="h-10 w-6 rounded-full border border-border/60 dark:border-border/70 flex items-start justify-center p-1 relative overflow-hidden bg-background/40 backdrop-blur-sm shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary/80 animate-scroll-wheel" />
              {/* subtle gradient fade */}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
              {scrollCueLabel}
            </span>
          </div>
          <style jsx>{`
            @keyframes scrollWheel {
              0% {
                transform: translateY(0);
                opacity: 1;
              }
              55% {
                transform: translateY(8px);
                opacity: 0;
              }
              56% {
                transform: translateY(-2px);
                opacity: 0;
              }
              100% {
                transform: translateY(0);
                opacity: 1;
              }
            }
            .animate-scroll-wheel {
              animation: scrollWheel 2.1s cubic-bezier(0.65, 0.05, 0.36, 1)
                infinite;
            }
            @keyframes bounceSlow {
              0%,
              100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-4px);
              }
            }
            .animate-bounce-slow {
              animation: bounceSlow 3.4s ease-in-out infinite;
            }
          `}</style>
        </div>
      ) : null}
    </PageSection>
  );
}
