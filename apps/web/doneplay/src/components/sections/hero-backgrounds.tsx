"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * مجموعه‌ای از لایه‌های تزئینی پس‌زمینه برای هیرو یا سکشن‌های ویژه.
 * هر لایه جدا قابل استفاده، ترکیب یا غیرفعال کردن است.
 * می‌توانید در صفحات مختلف با مونتاژ دلخواه استفاده کنید.
 */

// لایه گرادیان رادیال مرکزی
export const RadialGlow: React.FC<{ className?: string }> = ({ className }) => (
  <div
    aria-hidden
    className={cn(
      "absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.25),transparent_60%)]",
      className
    )}
  />
);

// شبکه (Grid) بسیار ظریف
export const SubtleGrid: React.FC<{ className?: string }> = ({ className }) => (
  <div
    aria-hidden
    className={cn(
      "absolute inset-0 opacity-[0.06] md:opacity-[0.08] mix-blend-overlay bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:42px_42px]",
      className
    )}
  />
);

// بلاب محو (قابل چندبار استفاده)
export const BlurBlob: React.FC<{
  className?: string;
  colorClass?: string;
  sizeClass?: string;
  style?: React.CSSProperties;
}> = ({
  className,
  colorClass = "bg-primary/25 dark:bg-primary/20",
  sizeClass = "w-72 h-72",
  style,
}) => (
  <div
    aria-hidden
    style={style}
    className={cn(
      "absolute rounded-full blur-3xl animate-pulse [animation-duration:7s]",
      colorClass,
      sizeClass,
      className
    )}
  />
);

// حلقه‌های متحدالمرکز چرخان
export const ConcentricRings: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    aria-hidden
    className={cn(
      "absolute inset-0 flex items-center justify-center opacity-50",
      className
    )}>
    <div className="relative">
      <div className="size-[620px] max-sm:hidden rounded-full border border-primary/10 animate-rotate-slower" />
      <div className="size-[430px] max-sm:hidden rounded-full border border-primary/15 absolute inset-0 m-auto animate-rotate-reverse-slower" />
      <div className="size-[260px] max-sm:hidden rounded-full border border-primary/20 absolute inset-0 m-auto animate-rotate-slow" />
    </div>
  </div>
);

// سمبل شناور یا چرخان (جنریک)
export const FloatingSymbol: React.FC<{
  children?: React.ReactNode;
  className?: string;
  animation?:
    | "float-slow"
    | "float-medium"
    | "float-fast"
    | "rotate-slow"
    | "rotate-slower"
    | "rotate-reverse-slower";
}> = ({ children = "★", className, animation = "float-slow" }) => (
  <span
    aria-hidden
    className={cn(
      "absolute text-primary/25",
      `animate-${animation}`,
      className
    )}>
    {children}
  </span>
);

// ماسک محو شونده بالا/پایین
export const FadingMasks: React.FC<{
  topClassName?: string;
  bottomClassName?: string;
}> = ({ topClassName, bottomClassName }) => (
  <>
    <div
      aria-hidden
      className={cn(
        "absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/60 to-transparent",
        topClassName
      )}
    />
    <div
      aria-hidden
      className={cn(
        "absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/60 to-transparent",
        bottomClassName
      )}
    />
  </>
);

// کامپوننت ترکیبی پیش‌فرض (ایمونسیو / immersive)
export const HeroBackground: React.FC<{
  variant?: "immersive" | "soft" | "minimal";
  className?: string;
}> = ({ variant = "immersive", className }) => {
  if (variant === "minimal") {
    return <RadialGlow className={className} />;
  }
  if (variant === "soft") {
    return (
      <>
        <RadialGlow className={className} />
        <SubtleGrid />
        <BlurBlob className="-left-32 top-1/3" />
        <BlurBlob
          className="-right-40 top-1/2"
          colorClass="bg-blue-500/20 dark:bg-blue-400/20"
          sizeClass="w-80 h-80"
        />
      </>
    );
  }
  // immersive
  return (
    <>
      <RadialGlow className={className} />
      <SubtleGrid />
      <BlurBlob className="-left-28 top-1/3" />
      <BlurBlob
        className="-right-32 top-1/2"
        colorClass="bg-primary/25 dark:bg-primary/10"
        sizeClass="w-80 h-80"
      />
      <BlurBlob
        className="left-1/2 -translate-x-1/2 top-3/4 w-96 h-96"
        colorClass="bg-primary/8"
        sizeClass="w-96 h-96"
      />
      <ConcentricRings />
      <FloatingSymbol className="top-16 left-10" animation="float-slow">
        ★
      </FloatingSymbol>
      <FloatingSymbol className="bottom-24 right-16" animation="float-medium">
        ✦
      </FloatingSymbol>
      <FloatingSymbol className="top-1/2 right-1/3" animation="float-fast">
        ✳︎
      </FloatingSymbol>
      <FloatingSymbol
        className="top-1/3 left-1/2 -translate-x-1/2 text-3xl"
        animation="rotate-slow">
        ⬢
      </FloatingSymbol>
      <FloatingSymbol
        className="bottom-16 left-1/4 text-2xl"
        animation="rotate-reverse-slower">
        ◇
      </FloatingSymbol>
      <FloatingSymbol
        className="top-1/4 right-1/4 text-xl"
        animation="rotate-slower">
        ▣
      </FloatingSymbol>
      <FadingMasks />
    </>
  );
};

/**
 * مثال استفاده سفارشی:
 * <HeroSection background={<HeroBackground variant="soft" />} />
 * یا ترکیب دستی: <HeroSection background={<><RadialGlow /><BlurBlob ... /></>} />
 */
