"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function FeedbackShowcase() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="text-lg font-bold">بازخورد و منوها</h1>

      <Section title="Dropdown Menu (منوی کشویی)">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">باز کردن منو</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>عملیات</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>ویرایش</DropdownMenuItem>
            <DropdownMenuItem>حذف</DropdownMenuItem>
            <DropdownMenuItem>اشتراک‌گذاری</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      <Section title="Tooltip (راهنما)">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">هاور کن</Button>
          </TooltipTrigger>
          <TooltipContent>این یک راهنماست</TooltipContent>
        </Tooltip>
      </Section>

      <Section title="Skeleton (اسکلت)">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-xl p-3 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="bg-muted/50 rounded-xl p-3 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="bg-muted/50 rounded-xl p-3 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </Section>
    </div>
  );
}
