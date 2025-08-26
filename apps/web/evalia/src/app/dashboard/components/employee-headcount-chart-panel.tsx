"use client";
import * as React from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { Settings2 } from "lucide-react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
  PanelAction,
} from "@/components/ui/panel";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { HexColorPicker } from "react-colorful";
import { Label } from "@/components/ui/label";
// (cn not used; removed)
import { chartConfig } from "@/config/chart-config";
import { employeesMonthly, type EmployeePoint } from "@/data/org-analytics";

// Types for customization state
interface AxisConfig {
  hide: boolean;
  tickSize: number;
  fontSize: number;
  angle: number;
  interval: number | "preserveStartEnd" | "preserveStart" | "preserveEnd" | 0;
  tickMargin: number;
}
interface GridConfig {
  vertical: boolean;
  horizontal: boolean;
  strokeDasharray: string;
}
interface BarSeriesConfig {
  key: string;
  color: string;
  radius: number;
  enabled: boolean;
}
interface HeadcountChartSettingsState {
  showTotal: boolean;
  showActive: boolean;
  months: number; // range window
  monthLang: "fa" | "en";
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  grid: GridConfig;
  barGap: number;
  categoryGap: number;
  animation: boolean;
  legend: boolean;
  tooltip: boolean;
  bars: BarSeriesConfig[];
}

const DEFAULT_SETTINGS: HeadcountChartSettingsState = {
  showTotal: true,
  showActive: true,
  months: 12,
  monthLang: "fa",
  xAxis: {
    hide: false,
    tickSize: 6,
    fontSize: 12,
    angle: 0,
    interval: 0,
    tickMargin: 6,
  },
  yAxis: {
    hide: false,
    tickSize: 6,
    fontSize: 12,
    angle: 0,
    interval: 0,
    tickMargin: 4,
  },
  grid: { vertical: false, horizontal: true, strokeDasharray: "3 3" },
  barGap: 4,
  categoryGap: 10,
  animation: true,
  legend: true,
  tooltip: true,
  bars: [
    { key: "total", color: "var(--color-total)", radius: 6, enabled: true },
    { key: "active", color: "var(--color-active)", radius: 6, enabled: true },
  ],
};

export interface EmployeeHeadcountChartPanelProps {
  range?: number; // external selected months (overrides internal months)
  onRangeChange?: (months: number) => void;
  data?: EmployeePoint[];
}

export function EmployeeHeadcountChartPanel({
  range,
  onRangeChange,
  data,
}: EmployeeHeadcountChartPanelProps) {
  const [open, setOpen] = React.useState(false);
  const [settings, setSettings] =
    React.useState<HeadcountChartSettingsState>(DEFAULT_SETTINGS);
  const effectiveMonths = range ?? settings.months;

  // English month names for chart
  const enMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Map data to use English or Persian month names
  const chartData = React.useMemo(() => {
    const base = (data ?? employeesMonthly).slice(-effectiveMonths);
    if (settings.monthLang === "en") {
      // Use index for mapping English month names
      return base.map((d, i) => {
        return { ...d, name: enMonths[i % 12] };
      });
    }
    return base;
  }, [data, effectiveMonths, settings.monthLang]);

  // Derived toggles convenience
  const update = <K extends keyof HeadcountChartSettingsState>(
    key: K,
    value: HeadcountChartSettingsState[K]
  ) => setSettings((s) => ({ ...s, [key]: value }));

  const updateAxis = (axis: "xAxis" | "yAxis", patch: Partial<AxisConfig>) =>
    setSettings((s) => ({ ...s, [axis]: { ...s[axis], ...patch } }));
  const updateGrid = (patch: Partial<GridConfig>) =>
    setSettings((s) => ({ ...s, grid: { ...s.grid, ...patch } }));
  const updateBar = (key: string, patch: Partial<BarSeriesConfig>) =>
    setSettings((s) => ({
      ...s,
      bars: s.bars.map((b) => (b.key === key ? { ...b, ...patch } : b)),
    }));

  const reset = () => setSettings(DEFAULT_SETTINGS);

  const monthsOptions = [3, 6, 9, 12];

  return (
    <Panel className="overflow-hidden">
      <PanelHeader>
        <PanelTitle>روند تعداد پرسنل و فعال‌ها</PanelTitle>
        <PanelDescription>نمایش {effectiveMonths} ماه اخیر</PanelDescription>
        <PanelAction>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="secondary" size="sm" className="text-[10px]">
                <Settings2 className="size-3" />
                تنظیمات نمودار
              </Button>
            </SheetTrigger>
            <SheetContent className="w-5/6 sm:max-w-[22rem] flex flex-col p-0 ">
              <SheetHeader className="px-5 pt-5 pb-3 mt-4 text-right">
                <SheetTitle>تنظیمات نمودار پرسنل</SheetTitle>
                <SheetDescription>
                  شخصی‌سازی کامل داده و ظاهر نمودار
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-7">
                {/* Range */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-xs"> بازه‌های زمانی</h4>
                  <div className="flex flex-wrap gap-2 items-center">
                    <ToggleGroup
                      type="single"
                      value={String(effectiveMonths)}
                      onValueChange={(v) => {
                        if (!v) return;
                        const m = Number(v);
                        onRangeChange ? onRangeChange(m) : update("months", m);
                      }}
                      className="flex flex-wrap gap-1">
                      {monthsOptions.map((m) => (
                        <ToggleGroupItem
                          key={m}
                          value={String(m)}
                          className="text-[10px] h-7 px-2">
                          {m}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    {/* Month label language toggle, inline */}
                    <ToggleGroup
                      type="single"
                      value={settings.monthLang}
                      onValueChange={(v) => {
                        if (!v) return;
                        update("monthLang", v as "fa" | "en");
                      }}
                      className="flex flex-wrap gap-1 ml-4">
                      <ToggleGroupItem
                        value="fa"
                        className="text-[10px] h-7 px-2">
                        شمسی{" "}
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="en"
                        className="text-[10px] h-7 px-2">
                        میلادی{" "}
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </section>
                {/* Month label language */}
                <section className="space-y-2"></section>
                {/* Series */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-xs">سری‌ها</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {settings.bars.map((bar) => (
                      <div
                        key={bar.key}
                        className="rounded-md border p-2.5 space-y-2 bg-muted/30">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: bar.color }}>
                            {bar.key === "total" ? "کل پرسنل" : "فعال"}
                          </span>
                          <Switch
                            checked={bar.enabled}
                            onCheckedChange={(c) =>
                              updateBar(bar.key, { enabled: c })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] px-2">
                                Radius {bar.radius}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="w-56">
                              <Label className="text-[10px] mb-1">
                                گردی گوشه‌ها
                              </Label>
                              <Slider
                                value={[bar.radius]}
                                min={0}
                                max={20}
                                onValueChange={(v) =>
                                  updateBar(bar.key, { radius: v[0] })
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          <BarColorPopover
                            bar={bar}
                            updateBar={(patch) => updateBar(bar.key, patch)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                {/* Axes */}
                <section className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs">محور X</h4>
                    <div className="flex flex-wrap gap-2 items-center text-[11px]">
                      <label className="flex items-center gap-1.5">
                        <Switch
                          checked={!settings.xAxis.hide}
                          onCheckedChange={(c) =>
                            updateAxis("xAxis", { hide: !c })
                          }
                        />
                        <span>نمایش</span>
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] px-2">
                            فونت {settings.xAxis.fontSize}px
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="w-56">
                          <Label className="text-[10px] mb-1">
                            اندازه فونت محور X
                          </Label>
                          <Slider
                            value={[settings.xAxis.fontSize]}
                            min={8}
                            max={18}
                            onValueChange={(v) =>
                              updateAxis("xAxis", { fontSize: v[0] })
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] px-2">
                            چرخش {settings.xAxis.angle}°
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="w-56">
                          <Label className="text-[10px] mb-1">زاویه لیبل</Label>
                          <Slider
                            value={[settings.xAxis.angle]}
                            min={-90}
                            max={90}
                            onValueChange={(v) =>
                              updateAxis("xAxis", { angle: v[0] })
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs">محور Y</h4>
                    <div className="flex flex-wrap gap-2 items-center text-[11px]">
                      <label className="flex items-center gap-1.5">
                        <Switch
                          checked={!settings.yAxis.hide}
                          onCheckedChange={(c) =>
                            updateAxis("yAxis", { hide: !c })
                          }
                        />
                        <span>نمایش</span>
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] px-2">
                            فونت {settings.yAxis.fontSize}px
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="w-56">
                          <Label className="text-[10px] mb-1">
                            اندازه فونت محور Y
                          </Label>
                          <Slider
                            value={[settings.yAxis.fontSize]}
                            min={8}
                            max={18}
                            onValueChange={(v) =>
                              updateAxis("yAxis", { fontSize: v[0] })
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </section>
                {/* Grid & Layout */}
                <section className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs">شبکه (Grid)</h4>
                    <div className="flex flex-wrap gap-3 text-[11px] items-center">
                      <label className="flex items-center gap-1.5">
                        <Switch
                          checked={settings.grid.horizontal}
                          onCheckedChange={(c) => updateGrid({ horizontal: c })}
                        />
                        <span>افقی</span>
                      </label>
                      <label className="flex items-center gap-1.5">
                        <Switch
                          checked={settings.grid.vertical}
                          onCheckedChange={(c) => updateGrid({ vertical: c })}
                        />
                        <span>عمودی</span>
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] px-2">
                            Dash {settings.grid.strokeDasharray}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="w-56">
                          <Label className="text-[10px] mb-1">
                            Dash Pattern
                          </Label>
                          <Input
                            value={settings.grid.strokeDasharray}
                            onChange={(e) =>
                              updateGrid({ strokeDasharray: e.target.value })
                            }
                            className="h-8"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">
                            مثال: 3 3 یا 6 2
                          </p>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs">چیدمان & انیمیشن</h4>
                    <div className="flex flex-wrap gap-3 text-[11px] items-center">
                      <label className="flex items-center gap-1.5">
                        <Switch
                          checked={settings.animation}
                          onCheckedChange={(c) => update("animation", c)}
                        />
                        <span>انیمیشن</span>
                      </label>
                      <label className="flex items-center gap-1.5">
                        <Switch
                          checked={settings.legend}
                          onCheckedChange={(c) => update("legend", c)}
                        />
                        <span>لجند</span>
                      </label>
                      <label className="flex items-center gap-1.5">
                        <Switch
                          checked={settings.tooltip}
                          onCheckedChange={(c) => update("tooltip", c)}
                        />
                        <span>تولتیپ</span>
                      </label>
                    </div>
                  </div>
                </section>
                {/* Reset */}
                <section className="flex gap-2 pt-1">
                  <SheetClose asChild>
                    <Button size="sm" className="h-7 text-[11px]">
                      بستن
                    </Button>
                  </SheetClose>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={reset}>
                    ریست
                  </Button>
                </section>
              </div>
            </SheetContent>
          </Sheet>
        </PanelAction>
      </PanelHeader>

      <PanelContent className="pl-0 ml-0 justify-center items-center align-middle w-full">
        <ChartContainer
          config={chartConfig}
          className="pl-0 ml-0 h-full min-h-[300px] md:min-h-[320px] max-h-[600px] lg:max-h-[440px] w-full">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 0, bottom: 10, left: -6 }}
            barGap={settings.barGap}
            barCategoryGap={settings.categoryGap}>
            <CartesianGrid
              vertical={settings.grid.vertical}
              horizontal={settings.grid.horizontal}
              strokeDasharray={settings.grid.strokeDasharray}
            />
            {!settings.xAxis.hide && (
              <XAxis
                dataKey="name"
                tickMargin={settings.xAxis.tickMargin}
                interval={settings.xAxis.interval as any}
                angle={settings.xAxis.angle}
                tick={{ fontSize: settings.xAxis.fontSize }}
              />
            )}
            {!settings.yAxis.hide && (
              <YAxis
                tickMargin={settings.yAxis.tickMargin}
                interval={settings.yAxis.interval as any}
                tick={{ fontSize: settings.yAxis.fontSize }}
              />
            )}
            {settings.legend && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
            {settings.tooltip && (
              <ChartTooltip content={<ChartTooltipContent />} />
            )}
            {settings.bars
              .filter((b) => b.enabled)
              .map((b) => (
                <Bar
                  key={b.key}
                  dataKey={b.key}
                  fill={b.color}
                  radius={[b.radius, b.radius, 0, 0]}
                  isAnimationActive={settings.animation}
                />
              ))}
          </BarChart>
        </ChartContainer>
      </PanelContent>
    </Panel>
  );
}

// --- BarColorPopover: handles popover open and auto-hex logic per bar ---
function BarColorPopover({
  bar,
  updateBar,
}: {
  bar: BarSeriesConfig;
  updateBar: (patch: Partial<BarSeriesConfig>) => void;
}) {
  const [colorPopoverOpen, setColorPopoverOpen] = React.useState(false);
  React.useEffect(() => {
    if (colorPopoverOpen && !/^#([0-9a-fA-F]{3}){1,2}$/.test(bar.color)) {
      updateBar({ color: "#0099ff" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorPopoverOpen]);
  return (
    <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] px-2 flex items-center gap-2">
          <span
            className="inline-block w-4 h-4 rounded border border-muted shadow"
            style={{ background: bar.color }}
          />
          رنگ
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" side="top">
        <div className="flex flex-col gap-2 items-center">
          {/^(#([0-9a-fA-F]{3}){1,2})$/.test(bar.color) ? (
            <HexColorPicker
              color={bar.color}
              onChange={(c) => updateBar({ color: c })}
              className="w-full max-w-[180px] mx-auto"
            />
          ) : (
            <div className="w-full max-w-[180px] mx-auto opacity-50 pointer-events-none select-none">
              <HexColorPicker color="#000000" onChange={() => {}} />
              <div className="text-[10px] text-center text-rose-500 mt-1">
                برای استفاده از کالرپیکر، مقدار باید hex باشد
              </div>
            </div>
          )}
          <Input
            type="text"
            value={bar.color}
            onChange={(e) => updateBar({ color: e.target.value })}
            className="h-8 text-center font-mono"
            style={{ direction: "ltr" }}
          />
          <p className="text-[10px] text-muted-foreground mt-1 text-center">
            می‌توانید مقدار CSS variable یا hex بدهید
            <br />
            <span className="text-[10px]">
              مثلاً <code>#ff0055</code> یا <code>var(--color-total)</code>
            </span>
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
