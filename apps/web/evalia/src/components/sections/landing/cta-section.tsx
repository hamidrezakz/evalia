"use client";
import { PageSection } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CTASection() {
  return (
    <PageSection id="cta" className="py-16 md:py-24">
      <Card className="relative overflow-hidden border-border/70 max-w-4xl mx-auto text-center">
        <CardContent className="py-12 space-y-6 relative">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            آماده‌ای یک نسخه واقعی از سازمانت را ببینی؟
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-7 max-w-2xl mx-auto">
            با یک دمو شروع کن یا مستقیم درخواست اجرای پکیج بده. ما کنارت هستیم برای ساخت تیمی با عملکرد عمیق و پایدار.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg">درخواست دمو</Button>
            <Button size="lg" variant="outline">مشاوره سریع</Button>
          </div>
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        </CardContent>
      </Card>
    </PageSection>
  );
}
