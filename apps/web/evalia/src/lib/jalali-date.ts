import moment from "moment-jalaali";
import type { Moment } from "moment";

export interface JalaliDateObject {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  iso: string;
  moment: Moment;
}

// ----------------------------------
// Persian / Jalali locale bootstrap
// ----------------------------------
// برای جلوگیری از فراخوانی چندباره، فقط یک بار locale را ست می‌کنیم
let _jalaliLocaleReady = false;
function ensureJalaliLocale(options?: { usePersianDigits?: boolean }) {
  if (_jalaliLocaleReady) return;
  // moment-jalaali افزونه ای روی moment است و متدی به نام loadPersian اضافه می‌کند
  // تعریف تایپی این متد در پکیج رسمی وجود ندارد؛ بنابراین از any استفاده می‌کنیم
  (moment as any).loadPersian({
    dialect: "persian-modern",
    usePersianDigits: options?.usePersianDigits ?? true, // true => اعداد فارسی (دیفالت)
  });
  // اطمینان از ست شدن لوکال (معمولاً loadPersian خود این کار را انجام می‌دهد)
  moment.locale("fa");
  _jalaliLocaleReady = true;
}

/**
 * تبدیل رشته ISO یا Date به آبجکت تاریخ شمسی و ساعت
 * @param input تاریخ ISO یا Date
 * @returns آبجکت شامل year/month/day/hour/minute/second و خود moment
 */
export function parseJalali(input: string | Date): JalaliDateObject {
  ensureJalaliLocale();
  const m = moment(input);
  return {
    year: m.jYear(),
    month: m.jMonth() + 1,
    day: m.jDate(),
    hour: m.hour(),
    minute: m.minute(),
    second: m.second(),
    iso: m.toISOString(),
    moment: m,
  };
}

/**
 * تبدیل آبجکت شمسی به رشته قابل استفاده برای تقویم یا نمایش
 * @param obj آبجکت JalaliDateObject
 * @param withTime آیا ساعت هم نمایش داده شود؟
 */
export function formatJalali(obj: JalaliDateObject, withTime = false): string {
  const m = obj.moment;
  return m.format(withTime ? "jYYYY/jMM/jDD HH:mm" : "jYYYY/jMM/jDD");
}

// ----------------------------------
// Relative Time (… پیش)
// ----------------------------------
/**
 * دریافت رشته زمان نسبی فارسی مانند: "۵ دقیقه پیش" / "۳ ساعت پیش" / "۲ روز پیش".
 * اگر تاریخ در آینده باشد: عبارت مناسب بازگردانده می‌شود (مثلاً "در آینده" یا "۵ دقیقه بعد").
 * @param input تاریخ (ISO string یا Date)
 * @param opts گزینه‌ها
 *  - now: تاریخ مرجع (پیش‌فرض: الان)
 *  - futureMode: نحوه نمایش آینده ("relative" => "۵ دقیقه بعد" | "static" => "در آینده")
 */
export function formatJalaliRelative(
  input: string | Date,
  opts?: { now?: Date; futureMode?: "relative" | "static" }
): string {
  ensureJalaliLocale();
  const now = opts?.now ? moment(opts.now) : moment();
  const target = moment(input);

  if (!target.isValid()) return "نامعتبر";

  const diffMs = now.diff(target); // مثبت یعنی گذشته
  const future = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const sec = Math.floor(absMs / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  const week = Math.floor(day / 7);
  const month = Math.floor(day / 30); // تقریبی
  const year = Math.floor(day / 365); // تقریبی

  function unit(n: number, singular: string, plural: string) {
    // در فارسی معمولاً همان شکل مفرد با عدد می‌آید (مثلاً ۵ روز) ولی برای خوانایی اجازه تفکیک داریم.
    return `${n} ${plural}`;
  }

  let phrase: string;
  if (sec < 45) {
    phrase = future ? "چند ثانیه" : "چند ثانیه";
  } else if (sec < 90) {
    phrase = future ? "۱ دقیقه" : "۱ دقیقه";
  } else if (min < 45) {
    phrase = unit(min, "دقیقه", "دقیقه");
  } else if (min < 90) {
    phrase = future ? "۱ ساعت" : "۱ ساعت";
  } else if (hour < 24) {
    phrase = unit(hour, "ساعت", "ساعت");
  } else if (hour < 42) {
    phrase = future ? "۱ روز" : "۱ روز";
  } else if (day < 7) {
    phrase = unit(day, "روز", "روز");
  } else if (day < 30) {
    phrase = unit(week, "هفته", "هفته");
  } else if (day < 45) {
    phrase = future ? "۱ ماه" : "۱ ماه";
  } else if (day < 365) {
    phrase = unit(month, "ماه", "ماه");
  } else if (day < 545) {
    // ~1.5 years
    phrase = future ? "۱ سال" : "۱ سال";
  } else {
    phrase = unit(year, "سال", "سال");
  }

  if (future) {
    return opts?.futureMode === "relative" ? `${phrase} بعد` : "در آینده";
  }
  return `${phrase} پیش`;
}

// ------------------------------
// مثال‌های استفاده
// ------------------------------

/*
// تبدیل رشته ISO به آبجکت شمسی:
const jalali = parseJalali("2025-09-01T21:38:30.650Z");
// تبدیل به رشته شمسی برای نمایش ساده
const dateStr = formatJalali(jalali); // "1404/06/10"
const dateTimeStr = formatJalali(jalali, true); // "1404/06/10 01:08"

// زمان نسبی از الان:
const rel = formatJalaliRelative("2025-09-01T21:38:30.650Z"); // مثل: "۲ روز پیش"

// زمان نسبی آینده (اگر تاریخ جلوتر باشد):
const relFuture = formatJalaliRelative(new Date(Date.now() + 5 * 60 * 1000), { futureMode: 'relative' }); // "5 دقیقه بعد"

// استفاده در تقویم سفارشی:
// <Calendar value={{ year: jalali.year, month: jalali.month, day: jalali.day }} />

// تبدیل به میلادی (رشته):
// jalali.moment.format("YYYY/MM/DD HH:mm")
*/
