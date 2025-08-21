import { meanBy as lodashMeanBy, sumBy as lodashSumBy } from "lodash";

export type Delta = { diff: number; pct: number };

/**
 * Format number in Persian locale. When opts.percent is true, appends '%'.
 */
export const formatFa = (n: number, opts?: { percent?: boolean }) =>
  opts?.percent ? `${n.toLocaleString("fa-IR")}%` : n.toLocaleString("fa-IR");

/**
 * Calculate absolute and percentage delta between two numbers.
 */
export const calcDelta = (now: number, prev: number): Delta => {
  const diff = now - prev;
  const pct = prev === 0 ? 0 : Math.round((diff / prev) * 100);
  return { diff, pct };
};

/**
 * Sum values using lodash's sumBy under the hood for consistency.
 */
export const sumBy = <T>(arr: T[], pluck: (item: T) => number) =>
  lodashSumBy(arr, pluck);

/**
 * Average values using lodash's meanBy, rounded to the nearest integer to match UI usage.
 */
export const avgBy = <T>(arr: T[], pluck: (item: T) => number) =>
  arr.length ? Math.round(lodashMeanBy(arr, pluck)) : 0;

// =====================
// Usage Examples
// =====================

// Example for formatFa
// formatFa(1234567) // خروجی: "۱٬۲۳۴٬۵۶۷"
// formatFa(85, { percent: true }) // خروجی: "۸۵%"

// Example for calcDelta
// calcDelta(120, 100) // خروجی: { diff: 20, pct: 20 }
// calcDelta(80, 100) // خروجی: { diff: -20, pct: -20 }

// Example for sumBy
// const arr = [ { value: 10 }, { value: 20 }, { value: 30 } ];
// sumBy(arr, item => item.value) // خروجی: 60

// Example for avgBy
// const arr2 = [ { score: 15 }, { score: 20 }, { score: 25 } ];
// avgBy(arr2, item => item.score) // خروجی: 20
