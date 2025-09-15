/**
 * Motion (animation) presets & utilities
 * --------------------------------------------------
 * Central place to manage motion tokens, durations, easing and reusable presets.
 * Standardizes animation language across the app and allows quick global tuning.
 */
import type { Transition } from "motion/react";

/** Root timing scale (seconds). Adjusting these scales propagates project-wide. */
const basetime = 1;
export const motionTimings = {
  xFast: basetime * 0.1,
  fast: basetime * 0.16,
  base: basetime * 0.22,
  medium: basetime * 0.3,
  slow: basetime * 0.4,
  xSlow: basetime * 0.55,
} as const;

/** Shared easing curves */
export const motionEasings = {
  /** Quick entrance / UI micro */ easeOut: "easeOut",
  /** Slightly softer exit */ easeIn: "easeIn",
  /** Natural pop (spring-like) */ pop: [0.22, 0.9, 0.24, 1],
  /** Gentle deceleration */ smooth: [0.16, 0.84, 0.44, 1],
} as const;

/** Helper to build a transition quickly */
export function t(
  duration: number = motionTimings.base,
  ease: Transition["ease"] = motionEasings.smooth,
  extra?: Partial<Transition>
): Transition {
  return { duration, ease, ...extra };
}
/*use: const transition = t(motionTimings.fast, motionEasings.pop, { delay: 0.1 });
<motion.div transition={transition}>...</motion.div> */

export interface MotionPresetShape {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit?: Record<string, any>;
  transition: Transition;
}

/** Generic fade preset */
export const fade: MotionPresetShape = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: t(motionTimings.base),
};

/** Fade + slight upward slide */
export const fadeSlideUp: MotionPresetShape = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
  transition: t(motionTimings.fast, motionEasings.smooth),
};

/** Grow vertical height (auto) */
export const growY: MotionPresetShape = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: t(motionTimings.base, motionEasings.smooth),
};

/** List item entrance (subtle scale) */
export const listItem: MotionPresetShape = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: t(motionTimings.fast, motionEasings.pop),
};

/** Slight pop (for small confirmation / highlight) */
export const popIn: MotionPresetShape = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: t(motionTimings.fast, motionEasings.pop),
};

/** Utility to clone/override a preset inline without mutating original */
export function overridePreset<T extends { transition?: Transition }>(
  base: T,
  patch: Partial<T>
): T {
  return {
    ...base,
    ...patch,
    transition: { ...base.transition, ...patch.transition },
  } as T;
}

/**
 * Example usage:
 *
 * import { fade, overridePreset } from "@/lib/motion/presets";
 *
 * // Create a custom fade preset with longer duration and custom easing
 * const customFade = overridePreset(fade, {
 *   transition: { duration: 0.5, ease: "easeInOut" },
 *   animate: { opacity: 1, scale: 1.05 }, // you can override any key
 * });
 *
 * // Use in a motion.div
 * <motion.div {...customFade}>
 *   Custom animated content
 * </motion.div>
 *
 * // You can also override only one property:
 * const fastFade = overridePreset(fade, { transition: { duration: 0.1 } });
 *
 * // Or use with other presets
 * const popFade = overridePreset(popIn, { animate: { scale: 1.1 } });
 */

/** Registry (optional) - could be extended for dynamic lookups */
export const motionPresets = {
  fade,
  fadeSlideUp,
  growY,
  listItem,
  popIn,
} as const;

export type MotionPresetKey = keyof typeof motionPresets;
export type MotionPreset = (typeof motionPresets)[MotionPresetKey];
