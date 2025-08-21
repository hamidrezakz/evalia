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
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity as ActivityIcon,
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Download,
  Printer,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { Settings2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { chartConfig } from "@/config/chart-config";
import {
  employeesMonthly,
  engagementMonthly,
  rolesDistribution,
  testsCompetency,
  type EmployeePoint,
  type EngagementPoint,
} from "@/data/org-analytics";
import {
  activities,
  recentEmployees,
  summary,
  tasks,
  type Task,
  type Employee,
  type Activity as ActivityEvent,
} from "@/data/dashboard";
import { avgBy, calcDelta, formatFa, sumBy } from "@/lib/metrics";

// داشبورد Overview: نسخه دمو حرفه‌ای، آماده اتصال به API
export default function DashboardOverviewPage() {
  // فیلترها و کنترل‌ها
  const [range, setRange] = React.useState<3 | 6 | 12>(6);
  const [showTotal, setShowTotal] = React.useState(true);
  const [showActive, setShowActive] = React.useState(true);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [exportTarget, setExportTarget] = React.useState<
    "students" | "activities" | "tasks" | "enrollment" | "grades"
  >("students");

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

  // پنجره جاری/قبلی بر اساس بازه
  const dataSlice = React.useMemo(
    () => employeesMonthly.slice(-range),
    [range]
  );
  const engagementSlice = React.useMemo(
    () => engagementMonthly.slice(-range),
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
  const activeRateSlice = React.useMemo(
    () =>
      employeesMonthly.slice(-range).map((d) => ({
        name: d.name,
        rate: Math.round((d.active / Math.max(d.total, 1)) * 100),
      })),
    [range]
  );

  // KPI ها (مدرسه)
  const avgTotalCurrent = avgBy<EmployeePoint>(dataSlice, (d) => d.total);
  const avgActiveCurrent = avgBy<EmployeePoint>(dataSlice, (d) => d.active);
  const sumHiredCurrent = sumBy<EmployeePoint>(dataSlice, (d) => d.hired);
  const sumLeftCurrent = sumBy<EmployeePoint>(dataSlice, (d) => d.left);
  const avgEngagementCurrent = avgBy<EngagementPoint>(
    engagementSlice,
    (d) => d.value
  );
  const avgActiveRateCurrent = React.useMemo(
    () => Math.round((avgActiveCurrent / Math.max(avgTotalCurrent, 1)) * 100),
    [avgActiveCurrent, avgTotalCurrent]
  );

  // دوره قبلی برای دلتای KPI
  const avgTotalPrev = avgBy<EmployeePoint>(prevDataSlice, (d) => d.total);
  const avgActivePrev = avgBy<EmployeePoint>(prevDataSlice, (d) => d.active);
  const sumHiredPrev = sumBy<EmployeePoint>(prevDataSlice, (d) => d.hired);
  const sumLeftPrev = sumBy<EmployeePoint>(prevDataSlice, (d) => d.left);
  const avgEngagementPrev = avgBy<EngagementPoint>(
    prevEngagementSlice,
    (d) => d.value
  );

  const totalDelta = calcDelta(avgTotalCurrent, avgTotalPrev);
  const activeDelta = calcDelta(avgActiveCurrent, avgActivePrev);
  const hiredDelta = calcDelta(sumHiredCurrent, sumHiredPrev);
  const leftDelta = calcDelta(sumLeftCurrent, sumLeftPrev);
  const engagementDelta = calcDelta(avgEngagementCurrent, avgEngagementPrev);

  // داده‌های مشتق‌شده برای چارت‌های مکمل
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

  // بینش‌های سریع (مدرسه)
  const quickInsights = React.useMemo(() => {
    const insights: string[] = [];
    if (hiredDelta.diff >= 0)
      insights.push(
        `ثبت‌نام‌ها نسبت به دوره قبل ${Math.abs(
          hiredDelta.pct
        )}% افزایش یافته است.`
      );
    else
      insights.push(
        `ثبت‌نام‌ها نسبت به دوره قبل ${Math.abs(
          hiredDelta.pct
        )}% کاهش یافته است.`
      );
    if (leftDelta.diff >= 0)
      insights.push(
        `انصراف ${Math.abs(
          leftDelta.pct
        )}% بیشتر شده؛ بررسی علل پیشنهاد می‌شود.`
      );
    else insights.push(`انصراف کاهش یافته که نشانه پایداری مدرسه است.`);
    if (engagementDelta.diff >= 0)
      insights.push(`مشارکت کلاسی روند مثبتی دارد.`);
    else insights.push(`مشارکت کلاسی افت کرده؛ نیاز به پایش.`);
    return insights;
  }, [hiredDelta, leftDelta, engagementDelta]);

  // گزارش‌گیری: CSV و Print/PDF
  function csvEscape(val: unknown) {
    const s = String(val ?? "");
    const needsQuote = /[",\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuote ? `"${escaped}"` : escaped;
  }

  function exportToCsv(
    filename: string,
    headers: string[],
    rows: (string | number)[][]
  ) {
    const BOM = "\uFEFF"; // نمایش درست فارسی در Excel
    const headerLine = headers.map(csvEscape).join(",");
    const body = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    const csv = `${BOM}${headerLine}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getExportData(target: typeof exportTarget): {
    headers: string[];
    rows: (string | number)[][];
    name: string;
  } {
    if (target === "students") {
      return {
        name: "students",
        headers: ["شناسه", "نام", "پایه", "کلاس", "تاریخ ثبت‌نام", "وضعیت"],
        rows: recentEmployees.map((e) => [
          e.id,
          e.name,
          e.role,
          e.team,
          new Date(e.hiredAt).toISOString().slice(0, 10),
          e.status === "active"
            ? "فعال"
            : e.status === "onboarding"
            ? "جدید"
            : "غیرفعال",
        ]),
      };
    }
    if (target === "activities") {
      return {
        name: "activities",
        headers: ["شناسه", "نوع", "پیام", "زمان"],
        rows: activities.map((a) => [
          a.id,
          labelForActivity(a.type),
          a.message,
          a.time,
        ]),
      };
    }
    if (target === "tasks") {
      return {
        name: "tasks",
        headers: ["شناسه", "عنوان", "مسئول", "اولویت", "وضعیت"],
        rows: tasks.map((t) => [
          t.id,
          t.title,
          t.assignee || "-",
          priorityFa(t.priority),
          statusFa(t.status),
        ]),
      };
    }
    if (target === "enrollment") {
      return {
        name: "enrollment",
        headers: ["ماه", "ثبت‌نام", "انصراف", "خالص تغییر"],
        rows: dataSlice.map((m) => [m.name, m.hired, m.left, m.hired - m.left]),
      };
    }
    const total = rolesDistribution.reduce((acc, r) => acc + r.value, 0);
    return {
      name: "grades",
      headers: ["پایه", "تعداد", "سهم %"],
      rows: rolesDistribution.map((r) => [
        r.name,
        r.value,
        Math.round((r.value / Math.max(total, 1)) * 100),
      ]),
    };
  }

  const handleExportCsv = React.useCallback(() => {
    const { headers, rows, name } = getExportData(exportTarget);
    const ts = new Date().toISOString().slice(0, 10);
    exportToCsv(`${name}-${ts}.csv`, headers, rows);
  }, [
    exportTarget,
    recentEmployees,
    activities,
    tasks,
    dataSlice,
    rolesDistribution,
  ]);

  const handlePrint = React.useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-[100svh] space-y-8 p-6 relative">
      {/* دکمه تنظیمات شناور + دیالوگ تنظیمات صفحه */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Button
          aria-label="تنظیمات صفحه"
          className="fixed z-50 bottom-4 left-6 size-9 rounded-full shadow-lg"
          onClick={() => setSettingsOpen(true)}
          variant="outline">
          <Settings2 className="size-4.5" />
        </Button>
        <DialogContent className="max-w-md w-full p-6" showCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 mt-4">
              <UsersRound className="h-4 w-4" /> تنظیمات صفحه مدرسه
            </DialogTitle>
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
              <p className="text-[11px] text-muted-foreground mt-2">
                این تنظیم روی نمودارها و شاخص‌ها اعمال می‌شود.
              </p>
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
                  کل
                </ToggleGroupItem>
                <ToggleGroupItem value="active" className="flex-1 text-[12px]">
                  فعال
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-[11px] text-muted-foreground mt-2">
                نمایش/عدم نمایش سری‌ها در چارت‌های ستونی.
              </p>
            </div>
            <div>
              <div className="mb-2 font-medium text-sm">خلاصه وضعیت مدرسه</div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  دانش‌آموزان: {formatFa(summary.headcount)}
                </Badge>
                <Badge>
                  نرخ فعال: {formatFa(summary.activeRate, { percent: true })}
                </Badge>
                <Badge variant="outline">
                  ثبت‌نام: {formatFa(summary.hiresThisPeriod)}
                </Badge>
                <Badge variant="outline">
                  انصراف: {formatFa(summary.leavesThisPeriod)}
                </Badge>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="mb-2 font-medium text-sm">گزارش‌گیری</div>
              <div className="space-y-2">
                <label
                  className="text-xs text-muted-foreground"
                  htmlFor="exportTarget">
                  موضوع گزارش
                </label>
                <Select
                  value={exportTarget}
                  onValueChange={(v) =>
                    setExportTarget(v as typeof exportTarget)
                  }>
                  <SelectTrigger className="w-full text-right" dir="rtl">
                    <SelectValue placeholder="انتخاب موضوع گزارش" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="students">دانش‌آموزان جدید</SelectItem>
                    <SelectItem value="activities">رویدادهای اخیر</SelectItem>
                    <SelectItem value="tasks">فهرست وظایف</SelectItem>
                    <SelectItem value="enrollment">ثبت‌نام/انصراف</SelectItem>
                    <SelectItem value="grades">ترکیب پایه‌ها</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  می‌توانید خروجی CSV دانلود کنید یا نسخه چاپ/PDF بگیرید.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="sm:flex-1">
                  بستن
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleExportCsv}
                className="sm:flex-1">
                <Download className="h-4 w-4 ml-2" /> دانلود CSV
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrint}
                className="sm:flex-1">
                <Printer className="h-4 w-4 ml-2" /> چاپ / PDF
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KPI ها */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiPanel
          icon={<UsersRound className="h-4 w-4" />}
          title="کل دانش‌آموزان"
          description="میانگین دوره"
          value={formatFa(avgTotalCurrent)}
          delta={totalDelta}
        />
        <KpiPanel
          icon={<ActivityIcon className="h-4 w-4" />}
          title="دانش‌آموزان حاضر"
          description="میانگین دوره"
          value={formatFa(avgActiveCurrent)}
          delta={activeDelta}
        />
        <KpiPanel
          icon={<BriefcaseBusiness className="h-4 w-4" />}
          title="ثبت‌نام | انصراف"
          description="جمع دوره"
          value={`${formatFa(sumHiredCurrent)} | ${formatFa(sumLeftCurrent)}`}
          delta={hiredDelta}
          secondDelta={leftDelta}
        />
        <KpiPanel
          icon={<TrendingUp className="h-4 w-4" />}
          title="نرخ حضور"
          description="درصد از کل"
          value={formatFa(avgActiveRateCurrent, { percent: true })}
          delta={calcDelta(
            avgActiveRateCurrent,
            Math.round((avgActivePrev / Math.max(avgTotalPrev, 1)) * 100)
          )}
        />
      </div>

      {/* چارت‌های اصلی */}
      <Panel>
        <PanelHeader>
          <PanelTitle>روند تعداد دانش‌آموزان و حضور</PanelTitle>
          <PanelDescription>نمایش {range} ماه اخیر</PanelDescription>
        </PanelHeader>
        <PanelContent className="h-[320px] w-full justify-center items-center">
          <ChartContainer config={chartConfig} className="h-full w-full">
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

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <Panel>
          <PanelHeader>
            <PanelTitle>شاخص مشارکت کلاسی</PanelTitle>
            <PanelDescription>روند {range} ماه اخیر</PanelDescription>
          </PanelHeader>
          <PanelContent className="h-[320px] w-full justify-center items-center">
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

        <Panel>
          <PanelHeader>
            <PanelTitle>ترکیب پایه‌های تحصیلی</PanelTitle>
            <PanelDescription>سهم هر پایه</PanelDescription>
          </PanelHeader>
          <PanelContent className="h-[320px] w-full justify-center items-center">
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

        <Panel>
          <PanelHeader>
            <PanelTitle>ثبت‌نام و انصراف</PanelTitle>
            <PanelDescription>دینامیک ثبت‌نام</PanelDescription>
          </PanelHeader>
          <PanelContent className="h-[320px] w-full justify-center items-center">
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
        <Panel>
          <PanelHeader>
            <PanelTitle>پروفایل درسی/هوشی</PanelTitle>
            <PanelDescription>میانگین نمرات حوزه‌ها</PanelDescription>
          </PanelHeader>
          <PanelContent className="h-[360px] w-full justify-center items-center">
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

        <Panel>
          <PanelHeader>
            <PanelTitle>نرخ حضور</PanelTitle>
            <PanelDescription>
              درصد فعال از کل در {range} ماه اخیر
            </PanelDescription>
          </PanelHeader>
          <PanelContent className="h-[360px] w-full justify-center items-center">
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

        <Panel>
          <PanelHeader>
            <PanelTitle>ترکیب حاضر/غایب</PanelTitle>
            <PanelDescription>میانگین دوره انتخاب‌شده</PanelDescription>
          </PanelHeader>
          <PanelContent className="h-[360px] w-full justify-center items-center">
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
                <ChartLegend content={<ChartLegendContent nameKey="value" />} />
              </PieChart>
            </ChartContainer>
          </PanelContent>
        </Panel>
      </div>
      {/* جداول و پنل‌های داده‌ای */}

      {/* جداول داده عملیاتی */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* کارمندان جدید (جدول یکدست) */}
        <Panel className="overflow-hidden">
          <PanelHeader>
            <PanelTitle>دانش‌آموزان جدید</PanelTitle>
            <PanelDescription>آخرین ثبت‌نام‌ها</PanelDescription>
          </PanelHeader>
          <PanelContent className="w-full overflow-x-auto px-0">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>پایه</TableHead>
                  <TableHead>کلاس</TableHead>
                  <TableHead>تاریخ ثبت‌نام</TableHead>
                  <TableHead>وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEmployees.map((e: Employee) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.role}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.team}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {new Date(e.hiredAt).toLocaleDateString("fa-IR")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={e.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </PanelContent>
        </Panel>
        <Panel className="overflow-hidden">
          <PanelHeader>
            <PanelTitle>فهرست فعالیت‌های آموزشی</PanelTitle>
            <PanelDescription>وضعیت جاری کارها</PanelDescription>
          </PanelHeader>
          <PanelContent className="w-full overflow-x-auto px-0">
            <Table className="min-w-[420px]">
              <TableHeader>
                <TableRow>
                  <TableHead>عنوان</TableHead>
                  <TableHead>مسئول</TableHead>
                  <TableHead>اولویت</TableHead>
                  <TableHead>وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((t: Task) => (
                  <TableRow key={t.id}>
                    <TableCell className="max-w-[16rem] truncate font-medium">
                      {t.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.assignee || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityToVariant(t.priority)}>
                        {priorityFa(t.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusToVariant(t.status)}>
                        {statusFa(t.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </PanelContent>
        </Panel>
        {/* فعالیت‌های اخیر (به صورت جدول جمع‌وجور) */}
        <Panel className="overflow-hidden">
          <PanelHeader>
            <PanelTitle>رویدادهای اخیر مدرسه</PanelTitle>
            <PanelDescription>آخرین رویدادها</PanelDescription>
          </PanelHeader>
          <PanelContent className="w-full overflow-x-auto px-0">
            <Table className="min-w-[680px]">
              <TableHeader>
                <TableRow>
                  <TableHead>نوع</TableHead>
                  <TableHead>پیام</TableHead>
                  <TableHead>زمان</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((a: ActivityEvent) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Badge
                        variant={iconVariantForActivity(a.type)}
                        className="justify-start gap-1">
                        <ActivityIcon className="h-3.5 w-3.5" />{" "}
                        {labelForActivity(a.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.message}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {a.time}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </PanelContent>
        </Panel>
        <Panel className="overflow-hidden">
          <PanelHeader>
            <PanelTitle>تسک‌ها</PanelTitle>
          </PanelHeader>
          <PanelContent className="w-full overflow-x-auto px-0">
            <Table className="min-w-[320px]">
              <TableHeader>
                <TableRow>
                  <TableHead>عنوان</TableHead>
                  <TableHead>مسئول</TableHead>
                  <TableHead>اولویت</TableHead>
                  <TableHead>وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((t: Task) => (
                  <TableRow key={t.id}>
                    <TableCell className="max-w-[16rem] truncate font-medium">
                      {t.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.assignee || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityToVariant(t.priority)}>
                        {priorityFa(t.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusToVariant(t.status)}>
                        {statusFa(t.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </PanelContent>
        </Panel>
      </div>
    </div>
  );
}

// ==== کامپوننت‌های کمکی داخلی صفحه ====
function KpiPanel({
  icon,
  title,
  description,
  value,
  delta,
  secondDelta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string | number;
  delta: { diff: number; pct: number };
  secondDelta?: { diff: number; pct: number };
}) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="flex items-center gap-2">
          {icon} {title}
        </PanelTitle>
        <PanelDescription>{description}</PanelDescription>
      </PanelHeader>
      <PanelContent className="flex-col">
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-muted-foreground text-xs flex items-center gap-4 mr-1">
          <DeltaView delta={delta} />
          {secondDelta && <DeltaView delta={secondDelta} inverse />}
        </div>
      </PanelContent>
    </Panel>
  );
}

function DeltaView({
  delta,
  inverse = false,
}: {
  delta: { diff: number; pct: number };
  inverse?: boolean;
}) {
  const up = delta.diff >= 0;
  const positiveClass = inverse
    ? "text-rose-600 dark:text-rose-400"
    : "text-emerald-600 dark:text-emerald-400";
  const negativeClass = inverse
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";
  return (
    <span
      className={`${
        up ? positiveClass : negativeClass
      } inline-flex items-center gap-0.5`}>
      {up ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(delta.pct)}%
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: "active" | "onboarding" | "inactive";
}) {
  if (status === "active") return <Badge>فعال</Badge>;
  if (status === "onboarding") return <Badge variant="secondary">ورود</Badge>;
  return <Badge variant="outline">غیرفعال</Badge>;
}

function priorityFa(p: Task["priority"]) {
  return p === "low" ? "کم" : p === "medium" ? "متوسط" : "بالا";
}
function statusFa(s: Task["status"]) {
  if (s === "todo") return "در انتظار";
  if (s === "in-progress") return "در حال انجام";
  return "انجام‌شده";
}
function priorityToVariant(p: Task["priority"]) {
  if (p === "low") return "secondary" as const;
  if (p === "medium") return "default" as const;
  return "destructive" as const;
}
function statusToVariant(s: Task["status"]) {
  if (s === "todo") return "outline" as const;
  if (s === "in-progress") return "secondary" as const;
  return "default" as const;
}
function iconVariantForActivity(t: (typeof activities)[number]["type"]) {
  switch (t) {
    case "enroll":
      return "secondary" as const;
    case "withdraw":
      return "destructive" as const;
    case "exam":
      return "default" as const;
    case "achievement":
      return "secondary" as const;
    case "absence":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}
function labelForActivity(t: (typeof activities)[number]["type"]) {
  switch (t) {
    case "enroll":
      return "ثبت‌نام";
    case "withdraw":
      return "انصراف";
    case "exam":
      return "آزمون";
    case "achievement":
      return "موفقیت";
    case "absence":
      return "غیبت";
    default:
      return "رویداد";
  }
}
