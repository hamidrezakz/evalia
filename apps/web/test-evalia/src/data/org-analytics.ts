export type EmployeePoint = {
  name: string;
  total: number;
  active: number;
  hired: number;
  left: number;
};
export type EngagementPoint = { name: string; value: number };

export const months = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const employeesMonthly: EmployeePoint[] = months.map((name, i) => ({
  name,
  total: 28 + Math.round(Math.sin(i / 2) * 8 + i * 1.5),
  active: 24 + Math.round(Math.cos(i / 3) * 6 + i * 1.2),
  hired: 3 + (i % 5),
  left: 1 + (i % 3),
}));

export const rolesDistribution = [
  { name: "مدیران", value: 12, color: "var(--chart-5)" },
  { name: "کارشناسان", value: 48, color: "var(--chart-3)" },
  { name: "کارمندان", value: 90, color: "var(--chart-1)" },
];

export const testsCompetency = [
  { competency: "رهبری", score: 78 },
  { competency: "همکاری", score: 85 },
  { competency: "حل مسئله", score: 72 },
  { competency: "نوآوری", score: 66 },
  { competency: "انضباط", score: 88 },
];

export const engagementMonthly: EngagementPoint[] = months.map((m, i) => ({
  name: m,
  value: 60 + Math.round(Math.sin(i / 2) * 15),
}));
