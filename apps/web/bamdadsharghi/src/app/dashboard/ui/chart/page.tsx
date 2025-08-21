"use client";

import * as React from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "@/components/ui/panel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ArrowDownRight,
  ArrowUpRight,
  UsersRound,
  BriefcaseBusiness,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  employeesMonthly,
  engagementMonthly,
  rolesDistribution,
  testsCompetency,
  type EmployeePoint,
  type EngagementPoint,
} from "@/data/org-analytics";
import { chartConfig } from "@/config/chart-config";
import { avgBy, calcDelta, formatFa, sumBy } from "@/lib/metrics";

// داده‌های نمونه مرتبط با تحلیل سازمانی (RTL)
// Note: mock data and chart config are imported from '@/data' and '@/config'

export default function ChartsShowcasePage() {
  const [range, setRange] = React.useState<3 | 6 | 12>(6);
  const [showTotal, setShowTotal] = React.useState(true);
  const [showActive, setShowActive] = React.useState(true);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  // Handlers for ToggleGroups
  const handleRangeChange = React.useCallback((value: string) => {
    if (!value) return;
    const n = Number(value) as 3 | 6 | 12;
    if (n === 3 || n === 6 || n === 12) setRange(n);
  }, []);

  const activeSeries = React.useMemo(() => {
    const arr: string[] = [];
    if (showTotal) arr.push("total");
    if (showActive) arr.push("active");
    return arr;
  }, [showTotal, showActive]);

  const handleSeriesChange = React.useCallback((values: string[]) => {
    setShowTotal(values.includes("total"));
    setShowActive(values.includes("active"));
  }, []);

  // Current and previous windows
  const dataSlice = React.useMemo(
    () => employeesMonthly.slice(-range),
    [range]
  );
  const engagementSlice = React.useMemo(
    () => engagementMonthly.slice(-range),
    [range]
  );
  const activeRateSlice = React.useMemo(
    () =>
      employeesMonthly.slice(-range).map((d) => ({
        name: d.name,
        rate: Math.round((d.active / Math.max(d.total, 1)) * 100),
      })),
    [range]
  );
  const prevDataSlice = React.useMemo(
    () => employeesMonthly.slice(-(range * 2), -range),
    [range]
  );
  const prevEngagementSlice = React.useMemo(
    () => engagementMonthly.slice(-(range * 2), -range),
    [range]
  );

  // helpers moved to '@/lib/metrics'

  // Aggregated KPIs for selected period
  const avgTotalCurrent = avgBy<EmployeePoint>(dataSlice, (d) => d.total);
  const avgActiveCurrent = avgBy<EmployeePoint>(dataSlice, (d) => d.active);
  const sumHiredCurrent = sumBy<EmployeePoint>(dataSlice, (d) => d.hired);
  const sumLeftCurrent = sumBy<EmployeePoint>(dataSlice, (d) => d.left);
  const avgEngagementCurrent = avgBy<EngagementPoint>(
    engagementSlice,
    (d) => d.value
  );

  // Aggregated KPIs for previous period (same length)
  const avgTotalPrev = avgBy<EmployeePoint>(prevDataSlice, (d) => d.total);
  const avgActivePrev = avgBy<EmployeePoint>(prevDataSlice, (d) => d.active);
  const sumHiredPrev = sumBy<EmployeePoint>(prevDataSlice, (d) => d.hired);
  const sumLeftPrev = sumBy<EmployeePoint>(prevDataSlice, (d) => d.left);
  const avgEngagementPrev = avgBy<EngagementPoint>(
    prevEngagementSlice,
    (d) => d.value
  );

  // Deltas
  const totalDelta = calcDelta(avgTotalCurrent, avgTotalPrev);
  const activeDelta = calcDelta(avgActiveCurrent, avgActivePrev);
  const hiredDelta = calcDelta(sumHiredCurrent, sumHiredPrev);
  const leftDelta = calcDelta(sumLeftCurrent, sumLeftPrev);
  const engagementDelta = calcDelta(avgEngagementCurrent, avgEngagementPrev);

  // Derived datasets for additional charts
  const radarData = React.useMemo(
    () => testsCompetency.map((t) => ({ ...t, target: 80 })),
    []
  );
  const activeVsInactive = React.useMemo(
    () => [
      {
        name: "فعال",
        value: Math.round(avgActiveCurrent),
        color: "var(--chart-2)",
      },
      {
        name: "غیرفعال",
        value: Math.max(Math.round(avgTotalCurrent - avgActiveCurrent), 0),
        color: "var(--chart-4)",
      },
    ],
    [avgActiveCurrent, avgTotalCurrent]
  );

  return (
    <div className="min-h-[100svh] space-y-8 p-6 relative">
      {/* دکمه تنظیمات شناور */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Button
          aria-label="تنظیمات صفحه"
          className="fixed z-50 bottom-4 left-6 size-9 rounded-full shadow-lg"
          onClick={() => setSettingsOpen(true)}>
          <Settings2 className="size-4.5" />
        </Button>
        <DialogContent
          className="max-w-xs w-full sm:max-w-sm p-6"
          showCloseButton>
          <DialogHeader>
            <DialogTitle>تنظیمات صفحه</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <div className="mb-2 font-medium text-sm">بازه زمانی</div>
              <ToggleGroup
                type="single"
                value={String(range)}
                onValueChange={handleRangeChange}
                size="sm"
                variant="outline"
                aria-label="انتخاب بازه زمانی"
                className="w-full justify-between">
                <ToggleGroupItem value="3" className="flex-1">
                  ۳ ماهه
                </ToggleGroupItem>
                <ToggleGroupItem value="6" className="flex-1">
                  ۶ ماهه
                </ToggleGroupItem>
                <ToggleGroupItem value="12" className="flex-1">
                  ۱۲ ماهه
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div>
              <div className="mb-2 font-medium text-sm">سری‌های نمودار</div>
              <ToggleGroup
                type="multiple"
                value={activeSeries}
                onValueChange={handleSeriesChange}
                size="sm"
                variant="outline"
                aria-label="نمایش سری‌های نمودار"
                className="w-full justify-between">
                <ToggleGroupItem value="total" className="flex-1 text-[12px]">
                  نمایش کل
                </ToggleGroupItem>
                <ToggleGroupItem value="active" className="flex-1 text-[12px]">
                  نمایش فعال
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full">
                بستن
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KPIها */}
      <div className="grid grid-cols-1 gap-6  sm:grid-cols-2 xl:grid-cols-4">
        {/* کل پرسنل */}
        <Panel>
          <PanelHeader>
            <PanelTitle className="flex items-center gap-2">
              <UsersRound className="h-4 w-4" /> کل پرسنل
            </PanelTitle>
            <PanelDescription>میانگین کل در دوره</PanelDescription>
          </PanelHeader>
          <PanelContent>
            <div className="text-3xl font-bold">
              {formatFa(avgTotalCurrent)}
            </div>
            <div className="text-muted-foreground text-xs flex items-center gap-1 mr-1">
              {totalDelta.diff >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" />{" "}
                  {Math.abs(totalDelta.pct)}%
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 inline-flex items-center gap-0.5">
                  <ArrowDownRight className="h-3 w-3" />{" "}
                  {Math.abs(totalDelta.pct)}%
                </span>
              )}
            </div>
          </PanelContent>
        </Panel>

        {/* پرسنل فعال */}
        <Panel>
          <PanelHeader>
            <PanelTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> پرسنل فعال
            </PanelTitle>
            <PanelDescription>میانگین فعال‌ها در دوره</PanelDescription>
          </PanelHeader>
          <PanelContent>
            <div className="text-3xl font-bold">
              {formatFa(avgActiveCurrent)}
            </div>
            <div className="text-muted-foreground text-xs flex items-center gap-1 mr-1">
              {activeDelta.diff >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" />{" "}
                  {Math.abs(activeDelta.pct)}%
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 inline-flex items-center gap-0.5">
                  <ArrowDownRight className="h-3 w-3" />{" "}
                  {Math.abs(activeDelta.pct)}%
                </span>
              )}
            </div>
          </PanelContent>
        </Panel>

        {/* استخدام / ترک خدمت */}
        <Panel>
          <PanelHeader>
            <PanelTitle className="flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4" /> استخدام | ترک خدمت
            </PanelTitle>
            <PanelDescription>میانگین کل در دوره</PanelDescription>
          </PanelHeader>
          <PanelContent>
            <div className="text-3xl font-bold">
              {formatFa(sumHiredCurrent)} | {formatFa(sumLeftCurrent)}
            </div>
            <div className="text-muted-foreground text-xs flex items-center gap-4 mr-1">
              <span
                className={`inline-flex items-center gap-1 ${
                  hiredDelta.diff >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}>
                {hiredDelta.diff >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(hiredDelta.pct)}%
              </span>
              <span
                className={`inline-flex items-center gap-1 ${
                  leftDelta.diff >= 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}>
                {leftDelta.diff >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(leftDelta.pct)}%
              </span>
            </div>
          </PanelContent>
        </Panel>

        {/* درگیری شغلی */}
        <Panel>
          <PanelHeader>
            <PanelTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> درگیری شغلی
            </PanelTitle>
            <PanelDescription>میانگین درگیری در دوره</PanelDescription>
          </PanelHeader>
          <PanelContent>
            <div className="text-3xl font-bold">
              {formatFa(avgEngagementCurrent, { percent: true })}
            </div>
            <div className="text-muted-foreground text-xs flex items-center gap-1 mr-1">
              {engagementDelta.diff >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" />{" "}
                  {Math.abs(engagementDelta.pct)}%
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 inline-flex items-center gap-0.5">
                  <ArrowDownRight className="h-3 w-3" />{" "}
                  {Math.abs(engagementDelta.pct)}%
                </span>
              )}
            </div>
          </PanelContent>
        </Panel>
      </div>

      {/* شبکه چارت‌ها */}
      <div className="grid grid-cols-1 gap-8">
        {/* روند تعداد و فعال‌ها */}
        <Panel>
          <PanelHeader>
            <PanelTitle>روند تعداد پرسنل و فعال‌ها</PanelTitle>
            <PanelDescription>نمایش {range} ماه اخیر</PanelDescription>
          </PanelHeader>
          <PanelContent className="w-full h-[320px] flex justify-center items-center">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <BarChart data={dataSlice}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartLegend content={<ChartLegendContent />} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {showTotal && (
                  <Bar
                    dataKey="total"
                    fill="var(--color-total)"
                    radius={[6, 6, 0, 0]}
                  />
                )}
                {showActive && (
                  <Bar
                    dataKey="active"
                    fill="var(--color-active)"
                    radius={[6, 6, 0, 0]}
                  />
                )}
              </BarChart>
            </ChartContainer>
          </PanelContent>
        </Panel>

        {/* سه نمودار انتهایی در گرید ۳تایی روی نمایشگر بزرگ */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* درگیری شغلی (Sparkline) */}
          <Panel>
            <PanelHeader>
              <PanelTitle>شاخص درگیری شغلی</PanelTitle>
              <PanelDescription>روند {range} ماه اخیر</PanelDescription>
            </PanelHeader>
            <PanelContent className="h-[320px] w-full flex justify-center items-center">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart data={engagementSlice}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    fill="var(--color-value)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ChartContainer>
            </PanelContent>
          </Panel>

          {/* توزیع نقش‌ها */}
          <Panel>
            <PanelHeader>
              <PanelTitle>ترکیب نقش‌ها در سازمان</PanelTitle>
              <PanelDescription>سهم هر گروه</PanelDescription>
            </PanelHeader>
            <PanelContent className="h-[320px] w-full flex justify-center items-center">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={rolesDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}>
                    {rolesDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </PanelContent>
          </Panel>

          {/* گردش نیروی انسانی */}
          <Panel>
            <PanelHeader>
              <PanelTitle>گردش نیروی انسانی</PanelTitle>
              <PanelDescription>استخدام و ترک خدمت</PanelDescription>
            </PanelHeader>
            <PanelContent className="h-[320px] w-full flex justify-center items-center">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={dataSlice}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="hired"
                    stackId="turnover"
                    fill="var(--color-hired)"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="left"
                    stackId="turnover"
                    fill="var(--color-left)"
                    radius={[6, 6, 0, 0]}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </PanelContent>
          </Panel>
        </div>

        {/* چارت‌های تکمیلی */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* پروفایل شایستگی‌ها (Radar) */}
          <Panel>
            <PanelHeader>
              <PanelTitle>پروفایل شایستگی‌ها</PanelTitle>
              <PanelDescription>نتایج آزمون‌های شایستگی</PanelDescription>
            </PanelHeader>
            <PanelContent className="h-[360px] w-full flex justify-center items-center">
              <ChartContainer
                config={{
                  ...chartConfig,
                  score: { label: "امتیاز", color: "var(--chart-2)" },
                  target: { label: "هدف", color: "var(--chart-4)" },
                }}
                className="h-[360px] w-full">
                <RadarChart data={radarData} outerRadius={110}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="competency" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Radar
                    name="score"
                    dataKey="score"
                    stroke="var(--color-score)"
                    fill="var(--color-score)"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="target"
                    dataKey="target"
                    stroke="var(--color-target)"
                    fill="var(--color-target)"
                    fillOpacity={0.05}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </RadarChart>
              </ChartContainer>
            </PanelContent>
          </Panel>

          {/* نرخ فعال‌ها (Sparkline) */}
          <Panel>
            <PanelHeader>
              <PanelTitle>نرخ فعال‌ها</PanelTitle>
              <PanelDescription>
                درصد فعال از کل در {range} ماه اخیر
              </PanelDescription>
            </PanelHeader>
            <PanelContent className="h-[360px] w-full flex justify-center items-center">
              <ChartContainer
                config={{
                  ...chartConfig,
                  rate: { label: "نرخ فعال", color: "var(--chart-2)" },
                }}
                className="h-[360px] w-full">
                <AreaChart data={activeRateSlice}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="var(--color-rate)"
                    fill="var(--color-rate)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ChartContainer>
            </PanelContent>
          </Panel>

          {/* ترکیب فعال/غیرفعال */}
          <Panel>
            <PanelHeader>
              <PanelTitle>ترکیب فعال/غیرفعال</PanelTitle>
              <PanelDescription>میانگین دوره انتخاب‌شده</PanelDescription>
            </PanelHeader>
            <PanelContent className="h-[360px] w-full flex justify-center items-center">
              <ChartContainer
                config={{
                  ...chartConfig,
                  فعال: { label: "فعال", color: "var(--chart-2)" },
                  غیرفعال: { label: "غیرفعال", color: "var(--chart-4)" },
                }}
                className="h-[360px] w-full">
                <PieChart>
                  <Pie
                    data={activeVsInactive}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}>
                    {activeVsInactive.map((entry, idx) => (
                      <Cell key={`cell-active-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="name" />}
                  />
                  <ChartLegend
                    content={<ChartLegendContent nameKey="value" />}
                  />
                </PieChart>
              </ChartContainer>
            </PanelContent>
          </Panel>
        </div>
      </div>
    </div>
  );
}
