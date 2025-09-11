"use client";
import { PageSection } from "@/components/sections";
import { Panel } from "@/components/ui/panel";
import {
  Zap,
  Handshake,
  LineChart,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PROBLEMS: { icon: LucideIcon; p: string; s: string }[] = [
  {
    icon: Zap,
    p: "انگیزه کارکنان ناپایدار است",
    s: "مکانیزم‌های پیشرفت مرحله‌ای + بازخورد رفتاری به جای امتیاز سطحی",
  },
  {
    icon: Handshake,
    p: "تعامل تیم سطحی یا پراکنده است",
    s: "تحلیل شبکه تعامل + بازی‌های ساختارمند برای بازطراحی ارتباط",
  },
  {
    icon: LineChart,
    p: "HR داده واقعی ندارد",
    s: "داده زنده سناریوهای عملی + مدل تحلیلی تصمیم‌پذیر",
  },
  {
    icon: FlaskConical,
    p: "آموزش‌ها ماندگار نیستند",
    s: "چرخه تجربه / تحلیل / مداخله در جریان جلسات",
  },
];

export function ProblemSolutionSection() {
  return (
    <PageSection id="problems" className="space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="text-xs font-normal px-3 py-1">
          ما دقیقا چه دردهایی را حل می‌کنیم؟
        </Badge>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
          از چالش تا راه‌حل عملی
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-7">
          تطبیق مستقیم نیازهای واقعی سازمان با راهکارهای ما؛ تمرکز روی اثر قابل
          اندازه‌گیری، نه شعار.
        </p>
      </div>
      <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {PROBLEMS.map((row, i) => (
          <Panel
            key={row.p}
            className={`relative px-5 pb-5 pt-4 gap-4 border border-border/60 hover:border-primary/40 transition-colors ${
              i === 0 || i === 1 ? "bg-primary/5 dark:bg-primary/10" : ""
            }`}>
            <div className="flex items-start gap-3">
              <div className="text-primary leading-none select-none mt-1">
                <row.icon className="size-5" aria-hidden />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-sm md:text-base text-primary/90">
                  {row.p}
                </h3>
                <p className="text-[11px] md:text-xs text-muted-foreground leading-6">
                  {row.s}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 -z-10 opacity-0 hover:opacity-100 rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-primary/20 transition-opacity" />
          </Panel>
        ))}
      </div>
    </PageSection>
  );
}
