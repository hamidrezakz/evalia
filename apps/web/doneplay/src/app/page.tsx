"use client";

import { ModeToggle } from "@/components/modetoggle";
import {
  HeroSection,
  ValuePropositionSection,
  FeatureShowcaseSection,
  PricingSection,
  BrandIntroSection,
} from "@/components/sections";
import { SiteFooter } from "@/components/layout/site-footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Command, Sparkles, LogIn, Info } from "lucide-react";
import {
  HeroBackground,
  BlurBlob,
} from "@/components/sections/hero-backgrounds";

export default function Home() {
  // حذف قابلیت باز کردن Prisma Studio طبق درخواست

  return (
    <div className="flex flex-col gap-6 overflow-x-hidden w-full max-w-[100vw] relative">
      <HeroSection
        headerCenter={false}
        fullHeight
        highlight={
          <>
            <Sparkles className="size-3.5 md:size-4 text-primary" />
            <span>پلتفرم هوشمند ارزیابی و یادگیری</span>
          </>
        }
        highlightClassName="px-4 py-1.5 bg-primary/10 text-primary/90"
        className="flex overflow-auto"
        background={
          <div>
            <HeroBackground variant="immersive" showMasks={false} />
            <div className="opacity-50 dark:opacity-94">
              <HeroBackground variant="signal" />
            </div>
          </div>
        }
        title={
          <span className="leading-tight font-bold">
            <span>توانمندسازی سازمان‌ها، مدارس و </span>
            <span className="text-primary">تیم‌های آموزشی</span>
          </span>
        }
        description={
          "زیرساخت منعطف برای طراحی ارزیابی، دریافت بازخورد و رشد مستمر—مناسب مدیران، معلمان و رهبران یادگیری."
        }
        primaryAction={{
          label: "ورود به داشبورد",
          href: "/auth",
          icon: <LogIn className="size-4" />,
        }}
        secondaryAction={{
          label: "معرفی دآن‌",
          href: "#intro",
          variant: "secondary",
          icon: <Info className="size-4" />,
        }}
        headerRight={
          <div className="flex items-center gap-2 md:gap-2">
            <Avatar className="size-10 md:size-10 rounded-2xl dark:border-2 border-border dark:shadow-sm">
              <AvatarFallback className="rounded-xl text-primary dark:bg-primary/12 flex items-center justify-center">
                <Command className="size-[19px]" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-start text-start min-w-0">
              <div className="text-sm font-extrabold md:text-md tracking-tight">
                دآن‌پلی
              </div>
              <p
                className="text-[9px] text-muted-foreground leading-relaxed"
                title="ارزیابی ۳۶۰، یادگیری، بهبود مستمر">
                ارزیابی • بازخورد • رشد
              </p>
            </div>
          </div>
        }
        headerLeft={<ModeToggle />}
      />
      <div id="intro">
        <BrandIntroSection />
      </div>
      <PricingSection />
      <ValuePropositionSection />

      {/* Blob تزئینی مرکزی مستقل (خارج از هیرو اما در بالای بخش‌های بعدی) */}

      <FeatureShowcaseSection dark />
      <SiteFooter />
      {/* ناحیه مربوط به Prisma Studio حذف شد */}
    </div>
  );
}
