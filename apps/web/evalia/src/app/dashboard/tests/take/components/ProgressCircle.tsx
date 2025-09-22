"use client";
import React from "react";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

export function ProgressCircle({
  value,
  total,
  className,
}: {
  value: number;
  total: number;
  className?: string;
}) {
  const completed = Math.min(Math.max(value, 0), total);
  const remaining = Math.max(total - completed, 0);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const data = [
    { name: "completed", value: completed },
    { name: "remaining", value: remaining },
  ];
  // Use Tailwind palette hex colors for clear contrast
  const COLORS = ["#3b82f6" /* blue-500 */, "#e5e7eb" /* gray-200 */];
  const config: ChartConfig = {
    completed: { label: "تکمیل", color: "#3b82f6" },
    remaining: {
      label: "باقی‌مانده",
      color: "#e5e7eb",
    },
  };

  return (
    <div className={className}>
      <ChartContainer config={config} className="aspect-square h-24 w-24">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={28}
            outerRadius={40}
            startAngle={90}
            endAngle={-270}
            strokeWidth={0}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none -mt-20 flex h-24 w-24 items-center justify-center">
        <div className="text-center mb-6">
          <div className="text-base font-bold leading-none">{percent}%</div>
          <div className="text-[10px] text-muted-foreground leading-none mt-1">
            پیشرفت
          </div>
        </div>
      </div>
    </div>
  );
}
