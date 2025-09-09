"use client";
import { PageSection } from "@/components/sections";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import {
  Brain,
  Gamepad2,
  FileSpreadsheet,
  Rocket,
  Workflow,
  BarChart3,
} from "lucide-react";

const FEATURES: {
  title: string;
  desc: string;
  icon: React.ComponentType<any>;
}[] = [
  {
    title: "تحلیل رفتاری عمیق",
    desc: "دریافت لایه‌های پنهان الگوهای تعامل، تمرکز و نقش‌های طبیعی در تیم",
    icon: Brain,
  },
  {
    title: "مدل بازی‌محور ارزیابی",
    desc: "رفتار واقعی افراد در سناریوهای بدون فیلتر به جای پاسخ‌های تئوری",
    icon: Gamepad2,
  },
  {
    title: "دفترچه فردی + گزارش سازمانی",
    desc: "دو سطح تحلیل: برای رشد فرد و تصمیم‌گیری مدیریتی",
    icon: FileSpreadsheet,
  },
  {
    title: "بهبود انگیزش پایدار",
    desc: "مکانیزم‌های گیمیفیکیشن هدف‌دار، نه صرفاً امتیاز و نشان",
    icon: Rocket,
  },
  {
    title: "توصیه‌های HR اجرایی",
    desc: "پیشنهاد چیدمان، ارتقاء، مسیر رشد و کاهش ریسک‌های رفتاری",
    icon: Workflow,
  },
  {
    title: "داده قابل اتکا",
    desc: "ساخته‌شده بر تعامل‌های واقعی و مشاهده رفتاری نه فرم‌های کلی",
    icon: BarChart3,
  },
];

export function ValuePropsSection({ className }: { className?: string }) {
  return (
    <PageSection id="value" className={cn("space-y-10", className)}>
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="text-xs font-normal px-3 py-1">
          چرا Playfulife Org؟
        </Badge>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
          پلتفرم تحول <span className="text-primary">داده‌محور</span> و{" "}
          <span className="text-primary">بازی‌محور</span>
        </h2>
        <p className="text-muted-foreground leading-7 text-sm md:text-base">
          ما فقط یک دوره آموزشی یا کارگاه سرگرمی نیستیم؛ یک سیستم ساخت‌یافته
          برای مشاهده، سنجش، تحلیل و تقویت پویایی انسانی سازمان هستیم.
        </p>
      </div>
      <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {FEATURES.map((f) => (
          <Panel
            key={f.title}
            className="group relative px-5 pb-5 pt-4 gap-3 hover:bg-muted/80 transition-colors border border-transparent hover:border-primary/30">
            <div className="flex items-start gap-3">
              <div className="text-primary shrink-0 mt-1">
                <f.icon className="size-5 md:size-6" aria-hidden />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm md:text-base leading-tight tracking-tight">
                  {f.title}
                </h3>
                <p className="text-[11px] md:text-xs text-muted-foreground leading-6">
                  {f.desc}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 transition-opacity rounded-xl" />
          </Panel>
        ))}
      </div>
    </PageSection>
  );
}
