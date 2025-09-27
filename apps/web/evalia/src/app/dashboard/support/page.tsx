"use client";
import React from "react";
import { Phone, MessageSquareQuote, LifeBuoy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SUPPORT_PHONE = "09305138169";
// Only phone channel requested

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto py-10 px-4">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LifeBuoy className="h-5 w-5" />
          <h1 className="text-2xl font-bold tracking-tight">پشتیبانی</h1>
          <Badge variant="secondary" className="text-[10px]">
            Beta
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-prose">
          فقط یک راه سریع برای پشتیبانی: شماره زیر. ابتدا یک بار رفرش کن و اگر
          مشکل باقی بود پیام یا تماس بده.
        </p>
      </header>
      <section className="grid gap-4 sm:gap-6">
        <div className="rounded-xl border bg-card p-5 flex flex-col gap-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <span>پشتیبانی سریع</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              تماس یا پیام واتس‌اپ. پاسخ در کوتاه‌ترین زمان.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm select-all tracking-wide bg-muted/40 rounded px-2 py-1">
              {SUPPORT_PHONE}
            </span>
            <a
              href={`https://wa.me/98${SUPPORT_PHONE.replace(/^0/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline underline-offset-4">
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4 sm:p-5 flex flex-col gap-3 shadow-sm text-xs leading-relaxed text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <MessageSquareQuote className="h-4 w-4 text-primary" />
          نکات قبل از تماس
        </div>
        <ol className="list-decimal pr-5 space-y-1 marker:text-primary">
          <li>یک بار رفرش کن</li>
          <li>اگر خطا داری اسکرین‌شات آماده کن</li>
          <li>بگو روی چه صفحه‌ای هستی</li>
          <li>اگر قابل تکرار است مراحل را کوتاه بگو</li>
        </ol>
      </section>

      <div className="flex flex-wrap gap-3 justify-end pt-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">بازگشت</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/dashboard/feedback">بازخورد</Link>
        </Button>
      </div>
    </div>
  );
}
