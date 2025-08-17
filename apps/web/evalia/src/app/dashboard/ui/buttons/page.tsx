"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-muted/50 rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function ButtonsShowcase() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="text-lg font-bold">دکمه‌ها</h1>

      <Section title="Variants (حالات)">
        <div className="flex flex-wrap gap-2">
          <Button>پیش‌فرض</Button>
          <Button variant="secondary">ثانویه</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">حذف</Button>
        </div>
      </Section>

      <Section title="Sizes (اندازه‌ها)">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">کوچک</Button>
          <Button size="default">استاندارد</Button>
          <Button size="lg">بزرگ</Button>
          <Button size="icon" aria-label="آیکن">
            <Plus />
          </Button>
        </div>
      </Section>

      <Section title="With Icons (به همراه آیکن)">
        <div className="flex flex-wrap items-center gap-2">
          <Button>
            ادامه
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline">
            افزودن
            <Plus className="size-4" />
          </Button>
          <Button variant="destructive">
            حذف
            <Trash2 className="size-4" />
          </Button>
        </div>
      </Section>

      <Section title="States (وضعیت‌ها)">
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled>غیرفعال</Button>
          <Button aria-invalid>خطادار</Button>
          <Button>
            در حال بارگذاری
            <Loader2 className="size-4 animate-spin" />
          </Button>
        </div>
      </Section>
    </div>
  );
}
