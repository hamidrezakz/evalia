"use client";
import * as React from "react";
import moment from "moment-jalaali";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Lightweight Jalali calendar grid (month view only) – enough for picking a date.
export interface JalaliDatePickerProps {
  value?: string | null; // ISO string or yyyy-mm-dd
  onChange: (iso: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

function toIsoFromJ(ymd: { y: number; m: number; d: number }) {
  const m = moment()
    .jYear(ymd.y)
    .jMonth(ymd.m - 1)
    .jDate(ymd.d)
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0);
  return m.toISOString();
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  value,
  onChange,
  disabled,
  placeholder = "انتخاب تاریخ",
  className,
}) => {
  const parsed = React.useMemo(() => {
    if (!value) return null;
    const mObj = moment(value, moment.ISO_8601, true).isValid()
      ? moment(value)
      : moment(value, "YYYY-MM-DD", true);
    if (!mObj.isValid()) return null;
    return mObj;
  }, [value]);
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState(() => {
    const base = parsed || moment();
    return { jy: base.jYear(), jm: base.jMonth() + 1 };
  });

  // Ensure persian loaded (safe no-op if already)
  React.useEffect(() => {
    try {
      if ((moment as any).loadPersian) {
        (moment as any).loadPersian({
          dialect: "persian-modern",
          usePersianDigits: true,
        });
      }
    } catch {}
  }, []);

  function daysInMonth(jy: number, jm: number) {
    // Total days: moment-jalaali exposes jDaysInMonth(year, monthIndex)
    let total: number;
    if (typeof (moment as any).jDaysInMonth === "function") {
      total = (moment as any).jDaysInMonth(jy, jm - 1);
    } else {
      // Fallback: jump to end of jMonth
      total = moment()
        .jYear(jy)
        .jMonth(jm - 1)
        .endOf("jMonth")
        .jDate();
    }
    const start = moment()
      .jYear(jy)
      .jMonth(jm - 1)
      .jDate(1);
    const firstWeekday = start.weekday();
    const days: Array<{ d: number; current: boolean } | null> = [];
    const offset = (firstWeekday + 1) % 7; // heuristic alignment with our header order
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= total; d++) days.push({ d, current: true });
    return days;
  }
  const grid = daysInMonth(view.jy, view.jm);

  function selectDay(d: number) {
    const iso = toIsoFromJ({ y: view.jy, m: view.jm, d });
    onChange(iso);
    setOpen(false);
  }

  function monthLabel() {
    const mObj = moment()
      .jYear(view.jy)
      .jMonth(view.jm - 1)
      .jDate(1);
    return mObj.format("jMMMM jYYYY");
  }

  function prevMonth() {
    let jy = view.jy;
    let jm = view.jm - 1;
    if (jm < 1) {
      jm = 12;
      jy -= 1;
    }
    setView({ jy, jm });
  }
  function nextMonth() {
    let jy = view.jy;
    let jm = view.jm + 1;
    if (jm > 12) {
      jm = 1;
      jy += 1;
    }
    setView({ jy, jm });
  }

  const displayValue = parsed ? parsed.format("jYYYY/jMM/jDD") : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "justify-start font-normal h-8 w-full",
            !parsed && "text-muted-foreground",
            className
          )}>
          <CalendarIcon className="h-4 w-4 ml-2 opacity-70" />
          <span>{displayValue}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-3"
        side="bottom"
        align="center"
        dir="rtl">
        <div className="flex items-center justify-between mb-2 text-xs font-medium">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={prevMonth}
            className="h-6 px-2">
            ‹
          </Button>
          <div>{monthLabel()}</div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={nextMonth}
            className="h-6 px-2">
            ›
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-[10px] mb-1 text-center text-muted-foreground">
          {["ی", "د", "س", "چ", "پ", "ج", "ش"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {grid.map((cell, idx) => {
            if (!cell) return <div key={idx} className="h-7" />;
            const isSelected =
              parsed &&
              parsed.jYear() === view.jy &&
              parsed.jMonth() + 1 === view.jm &&
              parsed.jDate() === cell.d;
            return (
              <button
                type="button"
                key={idx}
                onClick={() => selectDay(cell.d)}
                className={cn(
                  "h-7 w-7 rounded-md text-[11px] flex items-center justify-center transition",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}>
                {cell.d}
              </button>
            );
          })}
        </div>
        {parsed && (
          <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
            <span>ISO: {parsed.toISOString().slice(0, 10)}</span>
            <button
              type="button"
              className="underline hover:text-foreground"
              onClick={() => onChange(null)}>
              پاک کردن
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default JalaliDatePicker;
