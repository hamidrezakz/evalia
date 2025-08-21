import { ModeToggle } from "@/components/modetoggle";
import { HeroSection } from "@/components/sections";

export default function Home() {
  return (
    <HeroSection
      fullHeight
      highlight="نسخه نمایشی"
      title={
        <span>
          سامانه مدرسه استعداد‌یابی{" "}
          <span className="text-primary">بامداد شرقی</span>
        </span>
      }
      description="پایش دانش‌آموزان، ارزیابی چندهوشی و گزارش‌گیری آموزشی در یک نگاه"
      primaryAction={{ label: "ورود به داشبورد", href: "/dashboard" }}
      secondaryAction={{ label: "راهنمای UI", href: "/dashboard/ui" }}
      headerRight={
        <div>
          <div
            className="size-10 md:size-12 rounded-lg bg-primary/20 border border-primary/30"
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
  );
}
