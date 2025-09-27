"use client";

import { ModeToggle } from "@/components/modetoggle";
import { HeroSection } from "@/components/sections";
import { useState } from "react";
import { openPrismaStudio } from "@/lib/api.auth";
import { siteConfig } from "./site-config";

export default function Home() {
  const [studioUrl, setStudioUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePrismaStudio = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await openPrismaStudio();
      if (res.url) {
        setStudioUrl(res.url);
      } else {
        setError("لینک دریافت نشد");
      }
    } catch {
      setError("خطا در دریافت لینک");
    }
    setLoading(false);
  };

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
      <div className="flex flex-col items-center gap-2">
        <button
          className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/80 transition text-sm"
          onClick={handlePrismaStudio}
          disabled={loading}>
          {loading ? "دریافت لینک استودیو..." : "باز کردن Prisma Studio (محلی)"}
        </button>
        {studioUrl && (
          <a
            href={studioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline mt-2">
            ورود به Prisma Studio
          </a>
        )}
        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
      </div>
    </div>
  );
}
