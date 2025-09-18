import React from "react";
import { TemplateNav } from "./_components/template-nav";

export default function TemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <TemplateNav />
      {children}
    </div>
  );
}
