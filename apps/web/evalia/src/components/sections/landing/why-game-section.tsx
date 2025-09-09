"use client";
import { PageSection } from "@/components/sections";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { Separator } from "@/components/ui/separator";

const POINTS = [
  "بدون فیلتر: رفتار طبیعی و واقعی",
  "بدون ترس: کاهش سوگیری دفاعی",
  "در لحظه: مشاهده واکنش‌های تصمیم‌گیری",
  "غنی از داده: الگوهای تعامل و نقش‌پذیری",
];

export function WhyGameSection() {
  return (
    <PageSection id="why-game" className="space-y-10">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <Badge variant="outline" className="text-xs font-normal px-3 py-1">
            چرا بازی؟
          </Badge>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            بازی <span className="text-primary">یک ابزار شناختی</span> است، نه
            صرفاً سرگرمی
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-7">
            در محیط بازی افراد ماسک‌های سازمانی را کنار می‌گذارند. این یعنی داده
            واقعی و فرصت واقعی برای توسعه هدفمند.
          </p>
          <ul className="space-y-2 text-sm md:text-base">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-1 size-2 rounded-full bg-primary" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <Panel className="relative px-6 pb-6 pt-5 gap-4 border border-border/70 hover:border-primary/40 transition-colors overflow-hidden">
          <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
            <span className="text-primary text-xl" aria-hidden>
              🎯
            </span>
            چه چیزی استخراج می‌کنیم؟
          </h3>
          <div className="text-xs md:text-sm leading-6 space-y-3 text-muted-foreground mt-2">
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                نقش‌های طبیعی (هماهنگ‌کننده، تحلیل‌گر، محرک، خلاق و ...)
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>پروفایل تعامل: الگوهای ارتباط، تسلط، هم‌افزایی، تعارض</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>بردار انگیزشی: محرک‌های مشارکت پایدار</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>شاخص‌های پایداری عملکرد و توجه</span>
            </p>
          </div>
          <div className="absolute inset-0 -z-10 opacity-40 bg-gradient-to-br from-primary/10 via-transparent to-primary/20" />
        </Panel>
      </div>
    </PageSection>
  );
}
