"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { PageSection } from "@/components/sections";
import { HeroBackground } from "@/components/sections/hero-backgrounds";
import { CheckCircle2, Sparkles, Crown, BatteryCharging } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PanelTitle, PanelDescription } from "@/components/ui/panel";
import {
  PricingPlanCard,
  PricingPlanData,
} from "@/components/pricing/pricing-plan-card";

const plans: PricingPlanData[] = [
  {
    id: "breakfast",
    title: "پکیج فشرده (صبحانه)",
    subtitle: "ریتم متمرکز + هسته تحلیل سازمانی",
    price: "۲۱۶,۰۰۰,۰۰۰ تومان",
    perExtra: "نفر اضافه: ۱۴,۴۰۰,۰۰۰",
    description:
      "برای تیم‌هایی که می‌خواهند سریع چرخه را تجربه و خروجی تحلیلی معتبر دریافت کنند.",
    features: [
      { label: "۹ نشست حضوری ۶–۸ ساعته فشرده" },
      { label: "دفترچه رشد و تحلیل فردی" },
      { label: "گزارش سازمانی ساخت‌یافته" },
      { label: "بازی‌های شناختی + پروفایل رفتاری" },
      { label: "Baseline همسویی و تعامل" },
      { label: "تسهیلگری حرفه‌ای چند دیدگاهی" },
      { label: "پذیرایی صبح (انرژی آغاز روز)" },
      { label: "دسترسی پنل وب + داشبورد پایه" },
    ],
  },
  {
    id: "lunch",
    title: "پکیج کامل (ناهار)",
    subtitle: "تجربه عمیق روز کامل + انرژی پایدار",
    price: "۲۴۳,۰۰۰,۰۰۰ تومان",
    perExtra: "نفر اضافه: ۱۶,۲۰۰,۰۰۰",
    description:
      "مناسب سازمان‌هایی که به حداکثر عمق مداخله، تثبیت رفتار و پیگیری پس از اجرا نیاز دارند.",
    features: [
      { label: "۹ نشست حضوری توسعه‌یافته" },
      { label: "دفترچه رشد و تحلیل فردی" },
      { label: "گزارش سازمانی ساخت‌یافته" },
      { label: "تحلیل تعارض و نقشه دینامیک تیم" },
      { label: "ماژول تمرکز و انرژی" },
      { label: "ماژول عادت رفتاری (pilot)" },
      { label: "تسهیلگری حرفه‌ای چند دیدگاهی" },
      { label: "پذیرایی ناهار + میان‌وعده" },
      { label: "وب‌اپ + ماژول‌های به‌روزشونده" },
      { label: "Roadmap بهبود سه‌ماهه" },
    ],
    highlight: true,
  },
];

export interface PricingSectionProps {
  className?: string;
  id?: string;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  className,
  id = "pricing",
}) => {
  const handleSelect = (plan: PricingPlanData) => {
    console.log("select plan", plan.id);
  };
  const [heights, setHeights] = React.useState<Record<string, number>>({});
  const maxHeight = React.useMemo(
    () => Object.values(heights).reduce((m, h) => (h > m ? h : m), 0),
    [heights]
  );
  const handleHeight = React.useCallback((id: string, h: number) => {
    setHeights((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }));
  }, []);

  return (
    <PageSection
      id={id}
      className={cn(
        "relative isolate overflow-visible p-4 py-24 md:py-32",
        "bg-gradient-to-b from-background/96 via-background to-background/96",
        className
      )}>
      <div aria-hidden className="absolute inset-0 z-0 pointer-events-none overflow-visible">
        <HeroBackground variant="mesh" />
        <HeroBackground variant="signal" />
        <HeroBackground variant="soft" />
        <HeroBackground variant="icons-edu" />
        <HeroBackground variant="icons-team" />
        <HeroBackground variant="icons-assessment" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <div className="order-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 lg:mt-0">
            {plans.map((plan) => (
              <PricingPlanCard
                key={plan.id}
                plan={{
                  ...plan,
                  icon:
                    plan.id === "lunch" ? (
                      <Crown className="size-5" />
                    ) : (
                      <BatteryCharging className="size-5" />
                    ),
                }}
                collapsedCount={9}
                defaultExpanded={plan.highlight}
                onSelect={handleSelect}
                onHeight={handleHeight}
                enforceHeight={maxHeight || undefined}
              />
            ))}
          </div>
          <div className="order-1 space-y-6 max-w-xl lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-[11px] font-medium text-primary/90 backdrop-blur-sm w-max">
              <Sparkles className="size-3.5" />
              <span>پکیج سازمانی Don Play</span>
            </div>
            <div className="space-y-4">
              <h2 className="text-[20px] md:text-3xl font-extrabold leading-tight tracking-tight">
                ساختار شفاف؛ اجرا حضوری + تحلیل هوشمند
              </h2>
              <p className="text-muted-foreground text-[12px] leading-relaxed">
                اعضای سازمان در محل ما یک مسیر حضوری فشرده را طی می‌کنند؛
                تسهیلگران چنددیدگاهی فضای امن بازخورد خلق می‌کنند و موتور تحلیلی
                پلتفرم، سیگنال‌های چندبعدی (همسویی، تعامل، انرژی، الگوی رفتاری)
                را استخراج می‌کند. خروجی: دفترچه فردی، گزارش سازمانی و نقشه
                اقدام.
              </p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground/90">
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-primary" /> دفترچه فردی
                  PDF
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-primary" /> گزارش سازمانی
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-primary" /> تحلیل تیمی
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-primary" /> مسیر رشد
                  پیشنهادی
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-primary" /> تسهیلگری
                  حرفه‌ای حضوری
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-primary" /> پروفایل
                  رفتاری + سیگنال‌های چندبعدی
                </li>
              </ul>
              <div className="rounded-md border border-border/60 bg-background/50 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground/90">
                <strong className="text-foreground">روش اجرا:</strong> ترکیب
                بازی شناختی، مشاهده ساختاریافته، مدل چندبعدی، تسهیل فعال و تحلیل
                الگویی. تمرکز: تبدیل داده به تصمیم مستند و اقدام مستقل.
              </div>
              <Separator className="bg-border/60" />
              <div className="text-[11px] leading-relaxed text-muted-foreground/80 space-y-2">
                <p>۶ تا ۹ ساعت در هر نشست (مبتنی بر نوع پکیج). پایه ۱۵ نفر.</p>
                <p>افزودن نفرات و کوهورت دوم با فرمول شفاف و برآورد جداگانه.</p>
                <p>
                  سفارشی‌سازی: ماژول اختصاصی، گزارش هیئت‌مدیره، پیگیری پساجرایی.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="https://wa.me/989173001130"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground shadow hover:bg-primary/90 transition">
                  <Crown className="size-4" /> مشاوره سریع واتساپ
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background/60 px-4 py-2 text-[12px] font-medium text-foreground shadow-sm hover:bg-background/80 transition">
                  <Sparkles className="size-4 text-primary" /> دریافت اطلاعات
                  تکمیلی
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageSection>
  );
};
