import { ModeToggle } from "@/components/modetoggle";
import { HeroSection } from "@/components/sections";

export default function Home() {
  return (
    <HeroSection
      fullHeight
      highlight="نسخه نمایشی"
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
