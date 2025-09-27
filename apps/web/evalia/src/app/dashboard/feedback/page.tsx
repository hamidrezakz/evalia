"use client";
import React from "react";
import { Sparkles, Phone, MessageSquareQuote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SUPPORT_PHONE = "09305138169";

export default function FeedbackPage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-10 px-4">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-5 w-5" />
          <h1 className="text-2xl font-bold tracking-tight">بازخورد</h1>
          <Badge variant="secondary" className="text-[10px]">
            Beta
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-prose">
          ساده و مستقیم: بازخوردت رو بفرست. فعلاً فرم نداریم؛ فقط پیام سریع روی
          واتس‌اپ یا تماس.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2 font-medium text-sm">
          <Phone className="h-4 w-4 text-primary" />
          <span>شماره مستقیم</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="font-mono text-sm bg-muted/40 rounded px-2 py-1 select-all tracking-wide">
            {SUPPORT_PHONE}
          </span>
          <a
            href={`https://wa.me/98${SUPPORT_PHONE.replace(/^0/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline underline-offset-4">
            ارسال در واتس‌اپ
          </a>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4 sm:p-5 flex flex-col gap-3 shadow-sm text-xs leading-relaxed text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground font-medium text-sm">
          <MessageSquareQuote className="h-4 w-4 text-primary" />
          چی بنویسم؟
        </div>
        <ul className="list-disc pr-5 space-y-1 marker:text-primary">
          <li>یک عنوان کوتاه (مثلاً: گزارش کندی، پیشنهاد فیچر)</li>
          <li>دو خط توضیح: مشکل یا ایده دقیقاً چیه</li>
          <li>اگر خطاست: اسکرین‌شات یا متن خطا</li>
          <li>اختیاری: مرورگر / دستگاه در صورت خاص بودن</li>
        </ul>
      </section>

      <div className="flex gap-3 justify-end pt-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">بازگشت</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/dashboard/support">پشتیبانی</Link>
        </Button>
      </div>
    </div>
  );
}
