"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import {
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  PolarRadiusAxis,
} from "recharts";
import { GlasserAnalysisResult } from "./glasser-types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
  PanelFooter,
} from "@/components/ui/panel";

export interface GlasserNeedsRadarChartProps {
  analysis?: GlasserAnalysisResult | null;
  className?: string;
  maxValue?: number; // manual scale override (fallback dynamic)
  height?: number; // container height
  color?: string; // base color token
  title?: string;
  description?: string;
  footerHint?: string;
  showFooterTrend?: boolean;
}

interface RadarRow {
  code: string;
  label: string;
  average: number;
}

function toRows(analysis: GlasserAnalysisResult): RadarRow[] {
  return (analysis.needs || []).map((n) => ({
    code: n.code,
    label: n.label,
    average: n.average,
  }));
}

const DEFAULT_COLOR = "var(--chart-2)";

export const GlasserNeedsRadarChart: React.FC<GlasserNeedsRadarChartProps> = ({
  analysis,
  className,
  maxValue,
  height = 300,
  color = DEFAULT_COLOR,
  title = "نمودار رادار نیازها",
  description = "نمایش میانگین هر نیاز (تحلیل گلاسر)",
  footerHint = "میانگین نیازها",
  showFooterTrend = false,
}) => {
  if (!analysis) return null;
  const data = toRows(analysis);
  if (!data.length) return null;
  // Dynamic max with floor baseline 5
  const rawMax = Math.max(...data.map((d) => d.average));
  const computedMax = maxValue ?? Math.max(5, rawMax);
  // For percentages inside, precompute factor if needed later

  const chartConfig: ChartConfig = {
    average: { label: "میانگین نیاز", color },
  };

  return (
    <Panel className={cn("gap-4", className)}>
      <PanelHeader className="items-center text-center">
        <PanelTitle className="text-sm font-medium">{title}</PanelTitle>
        {description && (
          <PanelDescription className="text-[11px] leading-relaxed">
            {description}
          </PanelDescription>
        )}
      </PanelHeader>
      <PanelContent className="flex-col pb-0">
        <ChartContainer
          id="glasser-radar"
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
          style={{ height }}>
          <RadarChart data={data} outerRadius="85%">
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis domain={[0, computedMax]} tick={true} />
            <PolarGrid />
            <Radar
              dataKey="average"
              name="average"
              fill={color}
              stroke={color}
              fillOpacity={0.6}
              dot={({ cx, cy, value }) => (
                <g>
                  <circle r={4} cx={cx} cy={cy} fill={color} />
                  <text
                    x={cx}
                    y={cy - 8}
                    textAnchor="start"
                    fontSize={9}
                    className="fill-foreground">
                    {typeof value === "number" ? value.toFixed(2) : value}
                  </text>
                </g>
              )}
            />
          </RadarChart>
        </ChartContainer>
      </PanelContent>
      <PanelFooter className="flex-col gap-2 text-xs">
        {showFooterTrend && (
          <div className="flex items-center gap-2 font-medium leading-none">
            روند صعودی نسبی <TrendingUp className="h-4 w-4" />
          </div>
        )}
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          {footerHint}
        </div>
      </PanelFooter>
    </Panel>
  );
};

GlasserNeedsRadarChart.displayName = "GlasserNeedsRadarChart";

export default GlasserNeedsRadarChart;
