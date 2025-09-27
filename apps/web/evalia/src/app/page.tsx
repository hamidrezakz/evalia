"use client";

import { ModeToggle } from "@/components/modetoggle";
import { HeroSection } from "@/components/sections";
import { useState } from "react";
import { siteConfig } from "./site-config";

export default function Home() {
  // حذف قابلیت باز کردن Prisma Studio طبق درخواست

  return (
    <div className="flex flex-col gap-6">
      <HeroSection
        fullHeight
        highlight="معرفی"
        className="flex overflow-auto"
        title={
          <span className="leading-tight">
            <span>سامانه ارزیابی و بهبود عملکرد </span>
            <span className="text-primary font-semibold">
              {siteConfig.name}
            </span>
          </span>
        }
        description="پلتفرم یکپارچه برای ارزیابی ۳۶۰ درجه، تحلیل عملکرد و تصمیم‌گیری داده‌محور منابع انسانی"
        primaryAction={{ label: "ورود به داشبورد", href: "/dashboard" }}
        secondaryAction={{ label: "مرور رابط کاربری", href: "/dashboard/ui" }}
        headerRight={
          <div className="flex flex-col items-center">
            <div
              className="size-12 md:size-14 rounded-2xl bg-[hsl(210,100%,30%)] flex items-center justify-center text-white text-lg font-bold tracking-tight shadow-inner shadow-black/20 mb-4"
              aria-label="لوگو دان‌پلی">
              ⌘
            </div>
          </div>
        }
        headerLeft={<ModeToggle />}
      />
      {/* ناحیه مربوط به Prisma Studio حذف شد */}
    </div>
  );
}
