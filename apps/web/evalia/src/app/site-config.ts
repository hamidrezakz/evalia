// Central configuration for DonePlay site metadata & URLs
export const siteConfig = {
  name: "دان‌پلی", // برند فارسی شده
  tagline: "سامانه جامع ارزیابی و بهبود عملکرد",
  description:
    "دان‌پلی - سامانه جامع ارزیابی ۳۶۰ درجه، تحلیل عملکرد سازمانی و بهبود مستمر منابع انسانی در یک داشبورد یکپارچه.",
  url: "https://doneplay.site",
  ogImage: "/og.png", // تصویر اشتراک‌گذاری (OG)
  defaultLocale: "fa-IR",
  twitter: "", // نام کاربری توییتر (در صورت نیاز)
  keywords: [
    "دان‌پلی",
    "ارزیابی عملکرد",
    "ارزیابی ۳۶۰ درجه",
    "تحلیل عملکرد",
    "بهبود منابع انسانی",
    "منابع انسانی داده محور",
    "ارزیابی کارکنان",
    "مدیریت عملکرد",
  ],
  // مسیرهای خصوصی که نباید ایندکس شوند
  disallow: ["/dashboard"],
} as const;

export type SiteConfig = typeof siteConfig;
