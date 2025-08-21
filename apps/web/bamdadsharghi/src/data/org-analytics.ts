export type EmployeePoint = {
  name: string; // ماه
  total: number; // کل دانش‌آموزان
  active: number; // حاضرین/فعال
  hired: number; // ثبت‌نام
  left: number; // انصراف
};
export type EngagementPoint = { name: string; value: number }; // مشارکت کلاسی %

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
  total: 180 + Math.round(Math.sin(i / 2) * 15 + i * 2),
  active: 160 + Math.round(Math.cos(i / 3) * 12 + i * 1.5),
  hired: 8 + (i % 7),
  left: 3 + (i % 4),
}));

export const rolesDistribution = [
  { name: "پیش‌دبستان", value: 60, color: "var(--chart-5)" },
  { name: "ابتدایی", value: 180, color: "var(--chart-3)" },
  { name: "متوسطه", value: 120, color: "var(--chart-1)" },
];

export const testsCompetency = [
  { competency: "ریاضی", score: 82 },
  { competency: "هوش فضایی", score: 75 },
  { competency: "بدنی-جنبشی", score: 68 },
  { competency: "درون‌فردی", score: 80 },
  { competency: "زبانی", score: 77 },
];

export const engagementMonthly: EngagementPoint[] = months.map((m, i) => ({
  name: m,
  value: 65 + Math.round(Math.sin(i / 2) * 12),
}));
