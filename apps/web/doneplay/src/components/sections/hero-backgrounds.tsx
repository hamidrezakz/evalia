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
export const SubtleGrid: React.FC<{
  className?: string;
  density?: "normal" | "compact" | "loose";
  tone?: "auto" | "primary" | "neutral";
  intensity?: "subtle" | "base" | "bold";
  animated?: boolean;
  motion?: "drift" | "pulse" | "shift";
  speed?: "slow" | "normal" | "fast";
}> = ({
  className,
  density = "normal",
  tone = "auto",
  intensity = "base",
  animated = false,
  motion = "drift",
  speed = "normal",
}) => {
  const size = density === "compact" ? 32 : density === "loose" ? 56 : 44;
  // Slightly increased opacities per request (very subtle)
  const baseRaw =
    intensity === "subtle" ? 0.055 : intensity === "bold" ? 0.155 : 0.095;
  const darkRaw =
    intensity === "subtle" ? 0.085 : intensity === "bold" ? 0.33 : 0.135;
  const opacityBase = Math.min(baseRaw, 0.2);
  const opacityDark = Math.min(darkRaw, 0.26);
  const colorLight =
    tone === "primary"
      ? "hsl(var(--primary)/0.20)"
      : tone === "neutral"
      ? "rgba(0,0,0,0.11)"
      : "rgba(0,0,0,0.14)";
  const colorDark =
    tone === "primary"
      ? "hsl(var(--primary)/0.80)"
      : tone === "neutral"
      ? "hsla(0,0%,100%,0.70)"
      : "hsl(var(--primary)/0.8)";

  const speedMs = speed === "slow" ? 90000 : speed === "fast" ? 35000 : 55000;
  let animation: string | undefined;
  if (animated) {
    if (motion === "drift") animation = `grid-pan ${speedMs}ms linear infinite`;
    else if (motion === "shift")
      animation = `grid-shift ${speedMs * 0.8}ms linear infinite`;
    else if (motion === "pulse")
      animation = `grid-pulse ${speedMs * 0.6}ms ease-in-out infinite`;
  }

  return (
    <>
      {animated && (
        <style
          dangerouslySetInnerHTML={{
            __html: `@keyframes grid-pan {from {background-position:0px 0px,0px 0px;} to {background-position:var(--grid-size) var(--grid-size),var(--grid-size) var(--grid-size);}}
@keyframes grid-shift {0% {background-position:0 0,0 0;} 50% {background-position:calc(var(--grid-size)*0.6) calc(var(--grid-size)*0.6),calc(var(--grid-size)*0.6) calc(var(--grid-size)*0.6);} 100% {background-position:0 0,0 0;}}
@keyframes grid-pulse {0%,100% {opacity:var(--grid-opacity-light);} 50% {opacity:calc(var(--grid-opacity-light) + 0.05);} }
@media (prefers-color-scheme: dark){@keyframes grid-pulse {0%,100% {opacity:var(--grid-opacity-dark);} 50% {opacity:calc(var(--grid-opacity-dark) + 0.05);} }}`,
          }}
        />
      )}
      <div
        aria-hidden
        style={{
          ["--grid-color-light" as any]: colorLight,
          ["--grid-color-dark" as any]: colorDark,
          ["--grid-opacity-light" as any]: opacityBase.toString(),
          ["--grid-opacity-dark" as any]: opacityDark.toString(),
          ["--grid-size" as any]: `${size}px`,
          ...(animation ? { animation } : {}),
        }}
        className={cn(
          "absolute inset-0 mix-blend-multiply dark:mix-blend-overlay",
          "bg-[linear-gradient(to_right,var(--grid-color-light)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color-light)_1px,transparent_1px)]",
          "dark:bg-[linear-gradient(to_right,var(--grid-color-dark)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color-dark)_1px,transparent_1px)]",
          "[background-size:var(--grid-size)_var(--grid-size)]",
          "opacity-[var(--grid-opacity-light)] dark:opacity-[var(--grid-opacity-dark)]",
          animated && "will-change-background",
          className
        )}
      />
    </>
  );
};

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
  style?: React.CSSProperties;
  animation?:
    | "float-slow"
    | "float-medium"
    | "float-fast"
    | "rotate-slow"
    | "rotate-slower"
    | "rotate-reverse-slower";
}> = ({ children = "★", className, style, animation = "float-slow" }) => (
  <span
    aria-hidden
    style={style}
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
  variant?:
    | "immersive"
    | "soft"
    | "minimal"
    | "centered"
    | "dual"
    | "mesh"
    | "signal"
    | "clean-grid"
    | "gradient-orbit"
    | "icons-assessment"
    | "icons-edu"
    | "icons-team"
    | "icons-dev";
  className?: string;
  showMasks?: boolean; // محو بالا/پایین – پیش‌فرض خاموش
}> = ({ variant = "immersive", className, showMasks = false }) => {
  // Unified icon-only handler (dispersed layout)
  if (
    variant === "icons-assessment" ||
    variant === "icons-edu" ||
    variant === "icons-team" ||
    variant === "icons-dev"
  ) {
    const variantIndexMap: Record<string, number> = {
      "icons-assessment": 0,
      "icons-edu": 1,
      "icons-team": 2,
      "icons-dev": 3,
    };
    const symbolsMap: Record<string, string[]> = {
      "icons-assessment": [
        "⚑",
        "◎",
        "▣",
        "◇",
        "✦",
        "◔",
        "◆",
        "▵",
        "✳︎",
        "•",
        "◆",
        "◒",
      ],
      "icons-edu": ["⌘", "✹", "✦", "★", "◇", "✺", "✶", "✧", "✸", "✱", "✻", "✷"],
      "icons-team": [
        "☉",
        "✳︎",
        "◎",
        "⬢",
        "◇",
        "✦",
        "⬡",
        "◯",
        "◆",
        "✷",
        "✶",
        "✧",
      ],
      "icons-dev": [
        "λ",
        "</>",
        "⚙︎",
        "✸",
        "◇",
        "⌬",
        "∑",
        "∞",
        "⌗",
        "△",
        "⚑",
        "◯",
      ],
    };
    const vIndex = variantIndexMap[variant];
    const symbols = symbolsMap[variant];

    // Dispersed rows & base columns (avoid concentration at center)
    const rows = [12, 24, 38, 52, 68, 82]; // Y percentages
    const colsBase = [10, 28, 46, 64, 82]; // X spread

    // Generate positions (two per row) with deterministic shift per variant
    const positions: {
      top: number;
      left: number;
      sym: string;
      anim: string;
      size: string;
      tone: string;
    }[] = [];
    const animations = [
      "float-slow",
      "float-medium",
      "float-fast",
      "rotate-slow",
      "rotate-slower",
      "rotate-reverse-slower",
    ];
    const sizes = ["text-[10px]", "text-[11px]", "text-xs", "text-sm"];
    const tones = [
      "text-primary/10",
      "text-primary/12",
      "text-primary/15",
      "text-primary/18",
      "text-primary/22",
      "text-primary/25",
    ];
    let symPtr = 0;
    rows.forEach((rowY, r) => {
      for (let c = 0; c < 2; c++) {
        const baseCol = colsBase[(r * 2 + c + vIndex) % colsBase.length];
        const jitterSeed = (r * 13 + c * 7 + vIndex * 11) % 5; // 0..4
        const jitter = (jitterSeed - 2) * 1.4; // spread ~ -2.8..+2.8
        const x = Math.min(90, Math.max(8, baseCol + jitter));
        const y = Math.min(90, Math.max(8, rowY + (jitterSeed - 2) * 1.2));
        positions.push({
          top: y,
          left: x,
          sym: symbols[symPtr % symbols.length],
          anim: animations[(symPtr + vIndex) % animations.length],
          size: sizes[(symPtr + vIndex) % sizes.length],
          tone: tones[(symPtr * 2 + vIndex) % tones.length],
        });
        symPtr++;
      }
    });

    return (
      <>
        <RadialGlow className={className} />
        {positions.map((p, i) => (
          <FloatingSymbol
            key={i}
            className={cn(p.size, p.tone)}
            animation={p.anim as any}
            style={{ top: `${p.top}%`, left: `${p.left}%` }}>
            {p.sym}
          </FloatingSymbol>
        ))}
        {showMasks && <FadingMasks />}
      </>
    );
  }
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
  if (variant === "centered") {
    return (
      <>
        <RadialGlow className={className} />
        <SubtleGrid />
        <BlurBlob
          className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          sizeClass="w-[520px] h-[520px]"
          colorClass="bg-primary/20 dark:bg-primary/15"
        />
        <BlurBlob
          className="left-1/2 top-[58%] -translate-x-1/2"
          sizeClass="w-72 h-72"
          colorClass="bg-blue-500/15 dark:bg-blue-400/10"
        />
        <ConcentricRings className="opacity-40" />
        <FloatingSymbol
          className="top-1/3 left-1/2 -translate-x-1/2 text-lg"
          animation="float-slow">
          ✦
        </FloatingSymbol>
        {showMasks && <FadingMasks />}
      </>
    );
  }
  if (variant === "dual") {
    return (
      <>
        <RadialGlow className={className} />
        <SubtleGrid />
        <BlurBlob
          className="left-[20%] top-1/2 -translate-y-1/2"
          sizeClass="w-80 h-80"
          colorClass="bg-primary/22 dark:bg-primary/18"
        />
        <BlurBlob
          className="right-[18%] top-[55%] -translate-y-1/2"
          sizeClass="w-[380px] h-[380px]"
          colorClass="bg-blue-500/18 dark:bg-blue-400/14"
        />
        <FloatingSymbol
          className="top-[42%] left-[38%] text-base"
          animation="float-medium">
          ★
        </FloatingSymbol>
        <FloatingSymbol
          className="top-[60%] left-[52%] text-sm"
          animation="float-fast">
          ◇
        </FloatingSymbol>
        {showMasks && <FadingMasks />}
      </>
    );
  }
  if (variant === "mesh") {
    return (
      <>
        <RadialGlow className={className} />
        <SubtleGrid />
        {/* Clustered mid‑area blobs (not clipped at edges) */}
        <BlurBlob
          className="left-[30%] top-[45%]"
          sizeClass="w-64 h-64"
          colorClass="bg-primary/18 dark:bg-primary/14"
        />
        <BlurBlob
          className="left-[48%] top-[40%]"
          sizeClass="w-56 h-56"
          colorClass="bg-fuchsia-500/20 dark:bg-fuchsia-400/15"
        />
        <BlurBlob
          className="left-[58%] top-[58%]"
          sizeClass="w-60 h-60"
          colorClass="bg-blue-500/16 dark:bg-blue-400/12"
        />
        <FloatingSymbol
          className="top-[46%] left-[44%] text-base"
          animation="float-slow">
          ⬢
        </FloatingSymbol>
        <FloatingSymbol
          className="top-[54%] left-[52%] text-xs"
          animation="float-medium">
          ✳︎
        </FloatingSymbol>
        {showMasks && <FadingMasks />}
      </>
    );
  }
  if (variant === "signal") {
    return (
      <>
        <RadialGlow className={className} />
        <ConcentricRings className="opacity-60" />
        <BlurBlob
          className="left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2"
          sizeClass="w-[460px] h-[460px]"
          colorClass="bg-primary/15 dark:bg-primary/12"
        />
        <FloatingSymbol
          className="top-[38%] left-1/2 -translate-x-1/2 text-xl"
          animation="rotate-slow">
          ◯
        </FloatingSymbol>
        <FloatingSymbol
          className="top-[62%] left-1/2 -translate-x-1/2 text-sm"
          animation="rotate-reverse-slower">
          ◇
        </FloatingSymbol>
        {showMasks && <FadingMasks />}
      </>
    );
  }
  if (variant === "clean-grid") {
    return (
      <>
        <SubtleGrid />
        <RadialGlow className={className} />
        <FloatingSymbol
          className="top-[48%] left-[52%] text-xs"
          animation="float-medium">
          ✦
        </FloatingSymbol>
      </>
    );
  }
  if (variant === "gradient-orbit") {
    return (
      <>
        <RadialGlow className={className} />
        <SubtleGrid />
        <BlurBlob
          className="left-[35%] top-[48%]"
          sizeClass="w-[340px] h-[340px]"
          colorClass="bg-primary/18 dark:bg-primary/14"
        />
        <BlurBlob
          className="left-[55%] top-[52%]"
          sizeClass="w-[260px] h-[260px]"
          colorClass="bg-amber-500/25 dark:bg-amber-400/20"
        />
        <ConcentricRings className="opacity-30" />
        <FloatingSymbol
          className="top-[50%] left-[45%] text-sm"
          animation="rotate-slower">
          ⬢
        </FloatingSymbol>
        <FloatingSymbol
          className="top-[56%] left-[57%] text-base"
          animation="rotate-reverse-slower">
          ▣
        </FloatingSymbol>
        {showMasks && <FadingMasks />}
      </>
    );
  }
  // immersive
  return (
    <>
      <BlurBlob className="-left-28 top-1/3" />
      <BlurBlob
        className="-right-32 top-1/2"
        colorClass="bg-primary/25 dark:bg-primary/10"
        sizeClass="w-80 h-80"
      />
      <BlurBlob
        className="left-1/2 -translate-x-1/2 top-7/10 w-40 h-40"
        colorClass="bg-primary/8"
        sizeClass="w-40 h-40"
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
      {showMasks && <FadingMasks />}
    </>
  );
};

/**
 * مثال استفاده سفارشی:
 * <HeroSection background={<HeroBackground variant="soft" />} />
 * یا ترکیب دستی: <HeroSection background={<><RadialGlow /><BlurBlob ... /></>} />
 */
