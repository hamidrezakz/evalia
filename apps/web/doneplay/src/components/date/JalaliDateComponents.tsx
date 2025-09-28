"use client";
/**
 * Jalali (Persian) Date Components
 * --------------------------------
 * This module provides ready-to-use date picking and calendar components
 * integrated with react-multi-date-picker + moment-jalaali utilities.
 *
 * Components:
 *  - JalaliDatePicker: Single date (optional time) with input field.
 *  - JalaliRangePicker: Date range selection (start / end).
 *  - JalaliCalendar: Inline calendar (single or range) without input (visual only).
 *
 * All values are emitted as ISO (Gregorian) strings for storage while UI shows Jalali.
 * Under the hood we still rely on ISO -> moment-jalaali parse utilities from `jalali-date.ts`.
 *
 * Notes:
 *  - These components are client-only and use dynamic import friendly rendering
 *    (react-multi-date-picker already assumes browser environment).
 *  - They are RTL-aware and tuned for Tailwind + shadcn/ui design system.
 *  - Clear button & accessibility considerations included.
 */

import * as React from "react";
import dynamic from "next/dynamic";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { parseJalali, formatJalali } from "@/lib/jalali-date";
import type { JalaliDateObject } from "@/lib/jalali-date";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Lazy import of base picker (no SSR)
const BaseDatePicker: any = dynamic(() => import("react-multi-date-picker"), {
  ssr: false,
  // loading: () => <div className="h-9 rounded-md border bg-muted animate-pulse" />,
});

// Optional time picker plugin (loaded only when needed)
let TimePickerPluginPromise: Promise<any> | null = null;
function getTimePickerPlugin() {
  if (!TimePickerPluginPromise) {
    TimePickerPluginPromise = import(
      "react-multi-date-picker/plugins/time_picker"
    ).then((m) => (m as any).default);
  }
  return TimePickerPluginPromise;
}

// -----------------------------
// Types
// -----------------------------
export interface JalaliDatePickerProps {
  value?: string | Date | null;
  onChange?: (iso: string | null, meta?: { jalali?: JalaliDateObject }) => void;
  placeholder?: string;
  withTime?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
  name?: string;
  required?: boolean;
  autoFocus?: boolean;
  // Called when user presses clear button
  onClear?: () => void;
}

export interface JalaliRangePickerProps {
  value?: { start: string | Date | null; end: string | Date | null } | null;
  onChange?: (range: {
    start: string | null;
    end: string | null;
    jalali?: { start?: JalaliDateObject; end?: JalaliDateObject };
  }) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  inputClassName?: string;
  withTime?: boolean; // If true, applies time plugin for both ends.
}

export interface JalaliCalendarProps {
  mode?: "single" | "range";
  value?:
    | string
    | Date
    | { start: string | Date | null; end: string | Date | null }
    | null;
  onChange?: (
    payload:
      | { iso: string | null; jalali?: JalaliDateObject }
      | {
          start: string | null;
          end: string | null;
          jalali?: { start?: JalaliDateObject; end?: JalaliDateObject };
        }
  ) => void;
  withTime?: boolean;
  className?: string;
  disabled?: boolean;
}

// Utility: safe convert provided value to Date or null
function toDateSafe(v: any): Date | null {
  if (!v) return null;
  try {
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

// Build time plugin instance (async) and keep in state
function useTimePlugin(enabled: boolean) {
  const [plugin, setPlugin] = React.useState<any>(null);
  React.useEffect(() => {
    let alive = true;
    if (!enabled) {
      setPlugin(null);
      return;
    }
    getTimePickerPlugin().then((P) => {
      if (!alive) return;
      try {
        const inst = new (P as any)({ position: "bottom" });
        setPlugin(inst);
      } catch {
        setPlugin(null);
      }
    });
    return () => {
      alive = false;
    };
  }, [enabled]);
  return plugin ? [plugin] : [];
}

// Shared input base classes
const baseInputClass =
  "w-full h-9 rounded-md border bg-background/60 backdrop-blur px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/60 transition disabled:opacity-50 disabled:cursor-not-allowed";

// -------------------------------------------------
// Single Date Picker Component
// -------------------------------------------------
export function JalaliDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  withTime = false,
  disabled = false,
  clearable = true,
  className,
  inputClassName,
  id,
  name,
  required,
  autoFocus,
  onClear,
}: JalaliDatePickerProps) {
  const initial = React.useMemo(() => toDateSafe(value), [value]);
  const plugins = useTimePlugin(withTime);

  return (
    <div className={cn("relative flex items-center", className)} dir="rtl">
      <BaseDatePicker
        value={initial || undefined}
        calendar="persian"
        locale="fa"
        calendarPosition="bottom-right"
        format={withTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD"}
        plugins={plugins}
        inputClass={cn(baseInputClass, inputClassName)}
        placeholder={placeholder}
        disableDayPicker={false}
        readOnly={false}
        onChange={(val: any) => {
          if (!val) {
            onChange?.(null);
            return;
          }
          const date: Date | null = val?.toDate?.() || toDateSafe(val);
          if (!date) {
            onChange?.(null);
            return;
          }
          const iso = date.toISOString();
          const jalali = parseJalali(iso);
          onChange?.(iso, { jalali });
        }}
        id={id}
        name={name}
        required={required}
        autoFocus={autoFocus}
        disabled={disabled}
        render={(value: string, openCalendar: () => void) => {
          // Convert ISO (stored) to formatted Jalali for display
          let displayVal: string | null = null;
          if (value) {
            try {
              const j = parseJalali(value);
              displayVal = formatJalali(j, withTime);
            } catch {
              displayVal = value;
            }
          }
          return (
            <div
              className={cn(
                baseInputClass,
                "flex items-center gap-2 pr-2 cursor-text group",
                disabled && "opacity-50"
              )}
              onClick={openCalendar}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openCalendar();
              }}>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span
                className={cn(
                  "flex-1 truncate text-right",
                  !displayVal && "text-muted-foreground/70"
                )}>
                {displayVal || placeholder}
              </span>
              {withTime && (
                <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
              )}
              {clearable && value && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear?.();
                    onChange?.(null);
                  }}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted/60">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}

// -------------------------------------------------
// Range Picker Component
// -------------------------------------------------
export function JalaliRangePicker({
  value,
  onChange,
  placeholder = "بازه تاریخ",
  disabled,
  clearable = true,
  className,
  inputClassName,
  withTime = false,
}: JalaliRangePickerProps) {
  const startDate = value?.start ? toDateSafe(value.start) : null;
  const endDate = value?.end ? toDateSafe(value.end) : null;
  const plugins = useTimePlugin(withTime);

  return (
    <div className={cn("relative flex items-center", className)} dir="rtl">
      <BaseDatePicker
        range
        value={[startDate, endDate].filter(Boolean)}
        calendar="persian"
        locale="fa"
        calendarPosition="bottom-right"
        format={withTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD"}
        plugins={plugins}
        inputClass={cn(baseInputClass, inputClassName)}
        placeholder={placeholder}
        disabled={disabled}
        render={(val: any, openCalendar: () => void) => {
          const label = (() => {
            if (startDate && endDate) {
              return `${val}`; // library already composes label
            }
            if (startDate && !endDate)
              return `از ${val?.split?.(" to ")?.[0] || ""}`;
            return placeholder;
          })();
          return (
            <div
              className={cn(
                baseInputClass,
                "flex items-center gap-2 pr-2 cursor-text group",
                disabled && "opacity-50"
              )}
              onClick={openCalendar}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openCalendar();
              }}>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span
                className={cn(
                  "flex-1 truncate text-right",
                  !(startDate || endDate) && "text-muted-foreground/70"
                )}>
                {label}
              </span>
              {withTime && (
                <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
              )}
              {clearable && (startDate || endDate) && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange?.({ start: null, end: null });
                  }}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted/60">
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          );
        }}
        onChange={(vals: any[]) => {
          if (!Array.isArray(vals) || vals.length === 0) {
            onChange?.({ start: null, end: null });
            return;
          }
          const toISO = (v: any) =>
            v?.toDate ? v.toDate().toISOString() : null;
          const startISO = vals[0] ? toISO(vals[0]) : null;
          const endISO = vals[1] ? toISO(vals[1]) : null;
          onChange?.({
            start: startISO,
            end: endISO,
            jalali: {
              start: startISO ? parseJalali(startISO) : undefined,
              end: endISO ? parseJalali(endISO) : undefined,
            },
          });
        }}
      />
    </div>
  );
}

// -------------------------------------------------
// Inline Calendar (no input) - single or range
// -------------------------------------------------
export function JalaliCalendar({
  mode = "single",
  value,
  onChange,
  withTime = false,
  className,
  disabled,
}: JalaliCalendarProps) {
  const plugins = useTimePlugin(withTime);

  // Normalize incoming value
  const singleDate = mode === "single" ? toDateSafe(value as any) : null;
  const rangeVal =
    mode === "range"
      ? [
          value && (value as any).start
            ? toDateSafe((value as any).start)
            : null,
          value && (value as any).end ? toDateSafe((value as any).end) : null,
        ].filter(Boolean)
      : [];

  return (
    <div className={cn("relative", className)} dir="rtl">
      <BaseDatePicker
        value={mode === "single" ? singleDate || undefined : rangeVal}
        range={mode === "range"}
        calendar="persian"
        locale="fa"
        calendarPosition="bottom-right"
        format={withTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD"}
        plugins={plugins}
        disableDayPicker={false}
        inputClass="hidden" // hide internal input
        containerClassName="w-full"
        onChange={(val: any) => {
          if (mode === "single") {
            if (!val) {
              onChange?.({ iso: null });
              return;
            }
            const date: Date | null = val?.toDate?.() || toDateSafe(val);
            if (!date) {
              onChange?.({ iso: null });
              return;
            }
            const iso = date.toISOString();
            onChange?.({ iso, jalali: parseJalali(iso) });
          } else {
            if (!Array.isArray(val) || val.length === 0) {
              onChange?.({ start: null, end: null });
              return;
            }
            const toISO = (v: any) =>
              v?.toDate ? v.toDate().toISOString() : null;
            const startISO = val[0] ? toISO(val[0]) : null;
            const endISO = val[1] ? toISO(val[1]) : null;
            onChange?.({
              start: startISO,
              end: endISO,
              jalali: {
                start: startISO ? parseJalali(startISO) : undefined,
                end: endISO ? parseJalali(endISO) : undefined,
              },
            });
          }
        }}
      />
    </div>
  );
}

// -------------- Examples (JSDoc) ----------------
/**
 * Usage (Single):
 * <JalaliDatePicker value={iso} onChange={(iso,{jalali}) => setIso(iso)} withTime />
 *
 * Usage (Range):
 * <JalaliRangePicker value={{start, end}} onChange={({start,end}) => setRange({start,end})} />
 *
 * Inline Calendar:
 * <JalaliCalendar mode="single" value={iso} onChange={({iso}) => setIso(iso)} />
 */
