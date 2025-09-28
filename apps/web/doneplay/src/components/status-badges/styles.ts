import { cn } from "@/lib/utils";

// Tones unify the visual density/intensity.
export type Tone = "soft" | "solid" | "outline";
export type Size = "xs" | "sm" | "md";

export interface BadgeStyleOptions {
  tone?: Tone;
  size?: Size;
  className?: string;
}

export function badgeBaseClasses({ size = "sm" }: { size?: Size } = {}) {
  switch (size) {
    case "xs":
      return "text-[10px] h-4 px-1.5";
    case "sm":
      return "text-[11px] h-5 px-2";
    case "md":
    default:
      return "text-xs h-6 px-2.5";
  }
}

// Semantic color maps per state; we return Tailwind classes, keeping it theme-aware.
type ColorName =
  | "emerald"
  | "sky"
  | "amber"
  | "zinc"
  | "slate"
  | "violet"
  | "teal";

function colorSet(color: string) {
  switch (color as ColorName) {
    case "emerald":
      return {
        soft: {
          bg: "bg-emerald-500/10",
          text: "text-emerald-700 dark:text-emerald-300",
          ring: "ring-1 ring-emerald-500/20",
        },
        solid: {
          bg: "bg-emerald-600",
          text: "text-white",
          ring: "ring-1 ring-emerald-600/20",
        },
        outline: {
          bg: "bg-transparent",
          text: "text-emerald-700 dark:text-emerald-300",
          ring: "border border-emerald-400/50",
        },
      };
    case "sky":
      return {
        soft: {
          bg: "bg-sky-500/10",
          text: "text-sky-700 dark:text-sky-300",
          ring: "ring-1 ring-sky-500/20",
        },
        solid: {
          bg: "bg-sky-600",
          text: "text-white",
          ring: "ring-1 ring-sky-600/20",
        },
        outline: {
          bg: "bg-transparent",
          text: "text-sky-700 dark:text-sky-300",
          ring: "border border-sky-400/50",
        },
      };
    case "amber":
      return {
        soft: {
          bg: "bg-amber-500/10",
          text: "text-amber-700 dark:text-amber-300",
          ring: "ring-1 ring-amber-500/20",
        },
        solid: {
          bg: "bg-amber-600",
          text: "text-white",
          ring: "ring-1 ring-amber-600/20",
        },
        outline: {
          bg: "bg-transparent",
          text: "text-amber-700 dark:text-amber-300",
          ring: "border border-amber-400/50",
        },
      };
    case "slate":
      return {
        soft: {
          bg: "bg-slate-500/10",
          text: "text-slate-700 dark:text-slate-300",
          ring: "ring-1 ring-slate-500/20",
        },
        solid: {
          bg: "bg-slate-600",
          text: "text-white",
          ring: "ring-1 ring-slate-600/20",
        },
        outline: {
          bg: "bg-transparent",
          text: "text-slate-700 dark:text-slate-300",
          ring: "border border-slate-400/50",
        },
      };
    case "violet":
      return {
        soft: {
          bg: "bg-violet-500/10",
          text: "text-violet-700 dark:text-violet-300",
          ring: "ring-1 ring-violet-500/20",
        },
        solid: {
          bg: "bg-violet-600",
          text: "text-white",
          ring: "ring-1 ring-violet-600/20",
        },
        outline: {
          bg: "bg-transparent",
          text: "text-violet-700 dark:text-violet-300",
          ring: "border border-violet-400/50",
        },
      };
    case "teal":
      return {
        soft: {
          bg: "bg-teal-500/10",
          text: "text-teal-700 dark:text-teal-300",
          ring: "ring-1 ring-teal-500/20",
        },
        solid: {
          bg: "bg-teal-600",
          text: "text-white",
          ring: "ring-1 ring-teal-600/20",
        },
        outline: {
          bg: "bg-transparent",
          text: "text-teal-700 dark:text-teal-300",
          ring: "border border-teal-400/50",
        },
      };
    case "zinc":
    default:
      return {
        soft: {
          bg: "bg-zinc-500/10",
          text: "text-zinc-700 dark:text-zinc-300",
          ring: "ring-1 ring-zinc-500/20",
        },
        solid: {
          bg: "bg-zinc-700",
          text: "text-white",
          ring: "ring-1 ring-zinc-700/20",
        },
        outline: {
          bg: "bg-transparent",
          text: "text-zinc-700 dark:text-zinc-300",
          ring: "border border-zinc-400/50",
        },
      };
  }
}

export function toneClasses(color: string, tone: Tone = "soft") {
  const c = colorSet(color);
  return c[tone];
}

export function composeBadgeClass(
  color: string,
  { tone = "soft", size = "sm", className }: BadgeStyleOptions = {}
) {
  const t = toneClasses(color, tone);
  // Scale icon size based on badge size (override Badge base [&>svg]:size-3)
  const iconSizeCls =
    size === "xs"
      ? "[&>svg]:h-2.5 [&>svg]:w-2.5"
      : size === "md"
      ? "[&>svg]:h-3.5 [&>svg]:w-3.5"
      : "[&>svg]:h-3 [&>svg]:w-3";
  return cn(
    "inline-flex items-center gap-1 rounded-full isolate opacity-100 text-opacity-100",
    badgeBaseClasses({ size }),
    iconSizeCls,
    "[&>svg]:opacity-100",
    t.bg,
    t.text,
    t.ring,
    className
  );
}
