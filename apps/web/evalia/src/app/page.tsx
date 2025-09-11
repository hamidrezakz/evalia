"use client";

import { ModeToggle } from "@/components/modetoggle";
import { HeroSection } from "@/components/sections";
import { useState } from "react";
import { openPrismaStudio } from "@/lib/api.auth";

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
        highlight="نسخه نمایشی"
        className="flex overflow-auto"
        title={
          <span>
            راهکار سازمانی <span className="text-primary">Evalia</span>
          </span>
        }
        description="داشبورد منابع انسانی مدرن با تمرکز بر سادگی، سرعت و یکپارچگی"
        primaryAction={{ label: "شروع کنید", href: "/dashboard" }}
        secondaryAction={{ label: "مشاهده UI", href: "/dashboard/ui" }}
        headerRight={
          <div>
            <div
              className="size-10 md:size-12 rounded-lg bg-primary/20 border border-primary/30 mb-4"
              aria-label="لوگو"
            />
          </div>
        }
        headerLeft={
          <div>
            <ModeToggle />
          </div>
        }
      />
      <div className="flex flex-col items-center gap-2">
        <button
          className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/80 transition"
          onClick={handlePrismaStudio}
          disabled={loading}>
          {loading ? "در حال دریافت لینک..." : "باز کردن Prisma Studio"}
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
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
}
