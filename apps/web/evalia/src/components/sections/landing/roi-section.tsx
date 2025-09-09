"use client";
import { PageSection } from "@/components/sections";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import {
  Handshake,
  BarChart3,
  Wallet,
  HeartPulse,
  Presentation,
  Sprout,
} from "lucide-react";

const ROI_ITEMS: { text: string; icon: React.ComponentType<any> }[] = [
  { text: "افزایش مشارکت و تعامل تیمی", icon: Handshake },
  { text: "تصمیم‌گیری علمی در استخدام و ارتقاء", icon: BarChart3 },
  { text: "کاهش هزینه آموزش‌های تکراری", icon: Wallet },
  { text: "بهبود فضای روانی و انگیزشی", icon: HeartPulse },
  { text: "گزارش و گراف‌های ارائه‌پذیر", icon: Presentation },
  { text: "اثر ماندگار در فرهنگ سازمانی", icon: Sprout },
];

export function ROISection() {
  return (
    <PageSection id="roi" className="space-y-10">
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <Badge variant="outline" className="text-xs font-normal px-3 py-1">
          بازگشت سرمایه
        </Badge>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
          نتایج ملموس برای سازمان شما
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-7">
          خروجی‌های قابل ارائه + داده‌های قابل اقدام = تصمیم‌های سریع‌تر و تیم
          پایدارتر.
        </p>
      </div>
      <div className="grid gap-4 md:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {ROI_ITEMS.map((it) => (
          <Panel
            key={it.text}
            className="relative px-4 py-4 gap-2 border border-border/60 hover:border-primary/40 transition-colors overflow-hidden">
            <div className="flex items-start gap-2">
              <it.icon className="size-5 text-primary" aria-hidden />
              <p className="text-[11px] md:text-xs font-medium leading-5">
                {it.text}
              </p>
            </div>
            <div className="absolute inset-0 -z-10 opacity-0 hover:opacity-100 rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-primary/20 transition-opacity" />
          </Panel>
        ))}
      </div>
    </PageSection>
  );
}
