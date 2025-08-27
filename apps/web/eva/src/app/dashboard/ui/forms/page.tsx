"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-muted/50 rounded-xl p-4 space-y-4">
      <h2 className="text-sm font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function FormsShowcase() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="text-lg font-bold">فرم‌ها و ورودی‌ها</h1>

      <Section title="Input States (وضعیت‌ها)">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="استاندارد">
            <Input placeholder="نام و نام خانوادگی" />
          </Field>
          <Field label="Placeholder سفارشی">
            <Input placeholder="کد ملی" />
          </Field>
          <Field label="Disabled (غیرفعال)">
            <Input disabled placeholder="غیرفعال" />
          </Field>
          <Field label="Invalid (نامعتبر)">
            <Input aria-invalid placeholder="ورودی نامعتبر" />
          </Field>
        </div>
      </Section>

      <Section title="Inline Form (فرم خطی)">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="نام">
            <Input placeholder="مثلاً: علی" />
          </Field>
          <Field label="نام خانوادگی">
            <Input placeholder="مثلاً: رضایی" />
          </Field>
          <Button className="mt-6">ذخیره</Button>
        </div>
      </Section>
    </div>
  );
}
