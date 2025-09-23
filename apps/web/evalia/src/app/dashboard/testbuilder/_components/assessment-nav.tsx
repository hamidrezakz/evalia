"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const links: { href: string; label: string }[] = [
  { href: "/dashboard/testbuilder", label: "داشبورد آزمون‌ها" },
  { href: "/dashboard/testbuilder/questionbank", label: "مدیریت بانک سوالات" },
  { href: "/dashboard/testbuilder/option-sets", label: "دسته‌بندی گزینه‌ها" },
  { href: "/dashboard/testbuilder/qubuilder", label: "ساخت و ویرایش سوال" },
  { href: "/dashboard/testbuilder/templates", label: "قالب‌های آزمون" },
  { href: "/dashboard/testbuilder/sessions", label: "جلسات آزمون" },
  {
    href: "/dashboard/testbuilder/sessions/assignments",
    label: "اختصاص کاربر به جلسه",
  },
];

export function AssessmentNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 mb-6">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`text-xs px-3 py-1.5 rounded-md border transition ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background/40 hover:bg-muted/60"
            }`}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
