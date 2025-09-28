import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * فرمت استاندارد و خوانای شماره موبایل ایران
 * ورودی های قابل قبول: "+989305138169" ، "989305138169" ، "09305138169" ، "9305138169" ، "00989305138169"
 * خروجی پیش فرض: 0930-513-8169
 * - همیشه به فرم محلی 09xxxxxxxxx نرمالایز می‌شود
 * - اگر شماره معتبر نباشد مقدار اصلی برگردانده می‌شود
 */
export function formatIranPhone(raw: string, options?: { hyphen?: boolean }) {
  if (!raw) return "";
  const hyphen = options?.hyphen !== false; // پیش فرض true
  // فقط رقم ها
  let digits = String(raw).replace(/[^0-9]/g, "");
  if (!digits) return raw;

  // نرمال سازی پیش شماره ها
  // 0098xxxxxxxxx => 98xxxxxxxxx
  if (digits.startsWith("0098")) digits = digits.slice(4);
  // 098xxxxxxxxx => 98xxxxxxxxx (احتمال ورود صفر اضافی)
  if (digits.startsWith("098")) digits = digits.slice(1);
  // 98 + 9xxxxxxxx => 09xxxxxxxxx
  if (digits.startsWith("98") && digits.length === 12) {
    digits = "0" + digits.slice(2);
  }
  // 9xxxxxxxxx (10 رقم) => 09xxxxxxxxx
  if (digits.length === 10 && digits.startsWith("9")) {
    digits = "0" + digits;
  }

  // حالا باید 11 رقم و با 09 شروع شود
  if (!(digits.length === 11 && digits.startsWith("09"))) {
    return raw; // الگوی غیر معتبر – تغییر نمی‌دهیم
  }

  if (!hyphen) return digits; // فقط 09xxxxxxxxx

  // گروه بندی: 0930-513-8169 => 4-3-4
  const g1 = digits.slice(0, 4);
  const g2 = digits.slice(4, 7);
  const g3 = digits.slice(7);
  return `${g1}-${g2}-${g3}`;
}

/**
 * اگر نیاز به نسخه کوتاه (مخفی کردن بخشی) داشتیم می‌توانیم بعداً این را توسعه دهیم.
 * مثال آینده: maskIranPhone("+989305138169") => 0930-***-8169
 */
