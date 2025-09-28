"use client";
import { PageSection } from "@/components/sections";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PHASES = [
  {
    title: "ماه ۱ – مشاهده و سنجش",
    items: [
      "بازی‌های پایه شناختی",
      "نقشه‌برداری اولیه تعامل",
      "ثبت داده رفتاری",
    ],
  },
  {
    title: "ماه ۲ – تعمیق و تحلیل",
    items: ["بازی‌های تیمی پیچیده‌تر", "تحلیل نقش و تعارض", "ساخت الگوی تیمی"],
  },
  {
    title: "ماه ۳ – مداخله و توسعه",
    items: ["سناریوهای چالشی", "بازطراحی تعامل", "ارائه گزارش مدیریتی"],
  },
];

export function PackageStructureSection() {
  return (
    <PageSection id="structure" className="space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="text-xs font-normal px-3 py-1">
          ساختار اجرایی ۳ ماهه
        </Badge>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
          از مشاهده تا مداخله ساخت‌یافته
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-7">
          ۹ جلسه تعاملی (۶–۸ ساعت) در سه فاز متوالی برای استخراج، تحلیل و بهبود
          پایدار.
        </p>
      </div>
      <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
        {PHASES.map((ph) => (
          <Card
            key={ph.title}
            className="relative overflow-hidden border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg font-bold text-primary">
                {ph.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs md:text-sm leading-6 space-y-2 text-muted-foreground">
              {ph.items.map((it) => (
                <div key={it} className="flex items-start gap-2">
                  <span className="mt-1 size-2 rounded-full bg-primary" />
                  <span>{it}</span>
                </div>
              ))}
            </CardContent>
            <div className="absolute inset-0 -z-10 opacity-0 hover:opacity-100 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 transition-opacity" />
          </Card>
        ))}
      </div>
      <Card className="border-dashed border-primary/40">
        <CardContent className="py-6 text-xs md:text-sm text-muted-foreground leading-6 space-y-2">
          <p>
            <strong className="text-foreground">ظرفیت پیشنهادی:</strong> ۱۵ نفر
            / گروه – قابل سفارشی‌سازی
          </p>
          <p>
            <strong className="text-foreground">محل اجرا:</strong> سازمان شما یا
            فضای منتخب Playfulife
          </p>
          <p>
            <strong className="text-foreground">هسته محتوا:</strong> بازی‌های
            شناختی، تعامل تیمی، تحلیل نقش و عملکرد
          </p>
        </CardContent>
      </Card>
    </PageSection>
  );
}
