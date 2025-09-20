"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const links: { href: string; label: string }[] = [
  { href: "/dashboard/templates", label: "نمای کلی" },
  { href: "/dashboard/sessions", label: "جلسات" },
];

export function TemplateNav() {
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
