"use client";
import { PageSection } from "@/components/sections";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { Sunrise, UtensilsCrossed, Puzzle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const PLANS = [
  {
    icon: Sunrise,
    name: "پکیج با صبحانه",
    price: "۲۱۶٬۰۰۰٬۰۰۰",
    extra: "۱۴٬۴۰۰٬۰۰۰ برای هر نفر اضافه",
    includes: [
      "۹ جلسه حضوری/ترکیبی",
      "دفترچه تحلیلی فردی",
      "گزارش مدیریتی سازمانی",
      "تیم اجرایی کامل",
      "تجهیزات و پذیرایی (صبحانه)",
    ],
    accent: false,
  },
  {
    icon: UtensilsCrossed,
    name: "پکیج با ناهار",
    price: "۲۴۳٬۰۰۰٬۰۰۰",
    extra: "۱۶٬۲۰۰٬۰۰۰ برای هر نفر اضافه",
    includes: [
      "۹ جلسه حضوری/ترکیبی",
      "دفترچه تحلیلی فردی",
      "گزارش مدیریتی سازمانی",
      "تیم اجرایی کامل",
      "تجهیزات و پذیرایی (ناهار)",
    ],
    accent: true,
  },
];

export function PricingSection() {
  return (
    <PageSection id="pricing" className="space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="text-xs font-normal px-3 py-1">
          سرمایه‌گذاری (۱۵ نفر – ۹ جلسه)
        </Badge>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
          پلن‌های قیمت‌گذاری شفاف
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-7">
          شامل تیم اجرایی، تحلیل کامل، مستندات و پشتیبانی. تمرکز ما روی ارزش
          قابل اندازه‌گیری است.
        </p>
      </div>
      <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-center">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col border-border/70 ${
              plan.accent ? "ring-1 ring-primary/40" : ""
            }`}>
            {plan.accent && (
              <div className="absolute top-0 left-0 ml-4 -mt-3 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded">
                محبوب‌ترین
              </div>
            )}
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2">
                <plan.icon className="size-5 text-primary" aria-hidden />
                {plan.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm md:text-base leading-6 space-y-4">
              <div className="text-3xl font-extrabold tabular-nums">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground mr-1">
                  تومان
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                {plan.extra}
              </p>
              <Separator className="my-1" />
              <ul className="space-y-2 text-xs md:text-sm">
                {plan.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 size-2 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                className="w-full"
                variant={plan.accent ? "default" : "outline"}>
                درخواست مشاوره
              </Button>
            </CardFooter>
          </Card>
        ))}
        <Panel className="flex flex-col justify-center items-center gap-4 text-center py-8 border border-dashed border-primary/40">
          <p className="font-medium text-sm md:text-base flex items-center gap-2">
            <Puzzle className="size-5 text-primary" aria-hidden />
            نیاز به پلن سفارشی یا ظرفیت متفاوت دارید؟
          </p>
          <Button variant="ghost" className="text-primary hover:text-primary">
            ساخت پلن اختصاصی →
          </Button>
        </Panel>
      </div>
    </PageSection>
  );
}
