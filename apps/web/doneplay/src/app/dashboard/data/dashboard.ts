// --- داده‌های کامل برای داشبورد سازمان ایولیا ---
export type Team =
  | "توسعه"
  | "طراحی"
  | "منابع انسانی"
  | "مالی"
  | "فروش"
  | "مدیریت"
  | "پشتیبانی";
export type Employee = {
  id: string;
  name: string;
  role: string;
  team: Team;
  avatar?: string;
  hiredAt: string; // ISO date
  status: "active" | "onboarding" | "inactive";
};

export type ActivityEvent = {
  id: string;
  type: "enroll" | "withdraw" | "exam" | "achievement" | "absence";
  actor: string;
  message: string;
  time: string;
};

export type DashboardTask = {
  id: string;
  title: string;
  assignee?: string;
  due?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
};

export type Summary = {
  headcount: number;
  activeRate: number;
  hiresThisPeriod: number;
  leavesThisPeriod: number;
};

export const recentEmployees: Employee[] = [
  {
    id: "e101",
    name: "آرش رضایی",
    role: "توسعه‌دهنده بک‌اند",
    team: "توسعه",
    hiredAt: "2025-08-01",
    status: "onboarding",
  },
  {
    id: "e102",
    name: "سارا محمدی",
    role: "طراح محصول",
    team: "طراحی",
    hiredAt: "2025-07-28",
    status: "active",
  },
  {
    id: "e103",
    name: "امیرحسین جلالی",
    role: "کارشناس منابع انسانی",
    team: "منابع انسانی",
    hiredAt: "2025-07-20",
    status: "active",
  },
  {
    id: "e104",
    name: "نگار کیانی",
    role: "مدیر مالی",
    team: "مالی",
    hiredAt: "2025-07-10",
    status: "active",
  },
  {
    id: "e105",
    name: "پریسا حبیبی",
    role: "کارشناس فروش",
    team: "فروش",
    hiredAt: "2025-07-02",
    status: "inactive",
  },
  {
    id: "e106",
    name: "حسین شریفی",
    role: "مدیر پروژه",
    team: "مدیریت",
    hiredAt: "2025-06-28",
    status: "active",
  },
  {
    id: "e107",
    name: "مهدی احمدی",
    role: "پشتیبان مشتریان",
    team: "پشتیبانی",
    hiredAt: "2025-06-20",
    status: "active",
  },
];

export const activities: ActivityEvent[] = [
  {
    id: "a201",
    type: "enroll",
    actor: "آرش رضایی",
    message: "پیوستن به تیم توسعه",
    time: "2h",
  },
  {
    id: "a202",
    type: "achievement",
    actor: "سارا محمدی",
    message: "اتمام موفق پروژه طراحی محصول جدید",
    time: "6h",
  },
  {
    id: "a203",
    type: "exam",
    actor: "امیرحسین جلالی",
    message: "ارزیابی عملکرد منابع انسانی",
    time: "1d",
  },
  {
    id: "a204",
    type: "absence",
    actor: "نگار کیانی",
    message: "مرخصی یک‌روزه مالی",
    time: "2d",
  },
  {
    id: "a205",
    type: "withdraw",
    actor: "پریسا حبیبی",
    message: "ترک همکاری با واحد فروش",
    time: "3d",
  },
  {
    id: "a206",
    type: "achievement",
    actor: "حسین شریفی",
    message: "دریافت تقدیرنامه پشتیبانی",
    time: "4d",
  },
];

export const dashboardTasks: DashboardTask[] = [
  {
    id: "t301",
    title: "تکمیل مستندات پروژه جدید",
    assignee: "آرش رضایی",
    status: "in-progress",
    priority: "high",
  },
  {
    id: "t302",
    title: "برگزاری جلسه تیم طراحی",
    assignee: "سارا محمدی",
    status: "todo",
    priority: "medium",
  },
  {
    id: "t303",
    title: "ارزیابی عملکرد ماهانه",
    assignee: "امیرحسین جلالی",
    status: "in-progress",
    priority: "high",
  },
  {
    id: "t304",
    title: "تهیه گزارش مالی سه‌ماهه",
    assignee: "نگار کیانی",
    status: "todo",
    priority: "medium",
  },
  {
    id: "t305",
    title: "پیگیری درخواست مشتریان",
    assignee: "مهدی احمدی",
    status: "done",
    priority: "low",
  },
  {
    id: "t306",
    title: "به‌روزرسانی ساختار تیم‌ها",
    assignee: "حسین شریفی",
    status: "todo",
    priority: "medium",
  },
];

export const summary: Summary = {
  headcount: 212,
  activeRate: 87,
  hiresThisPeriod: 18,
  leavesThisPeriod: 7,
};

export const rolesDistribution = [
  { name: "مدیران", value: 18, color: "var(--chart-5)" },
  { name: "کارشناسان", value: 62, color: "var(--chart-3)" },
  { name: "کارمندان", value: 132, color: "var(--chart-1)" },
];

export const testsCompetency = [
  { competency: "رهبری", score: 78 },
  { competency: "همکاری تیمی", score: 85 },
  { competency: "حل مسئله", score: 72 },
  { competency: "نوآوری", score: 66 },
  { competency: "انضباط کاری", score: 88 },
];
export type Kpi = {
  label: string;
  value: number;
  delta?: number;
  icon?: string;
  suffix?: string;
};
export type Project = {
  id: string;
  name: string;
  owner: string;
  progress: number;
  status: "در حال انجام" | "تکمیل" | "تاخیر";
};
export type Task = {
  id: string;
  title: string;
  assignee: string;
  due: string;
  done: boolean;
};
export type Activity = {
  id: string;
  title: string;
  time: string;
  type: "create" | "update" | "warning";
};

export const kpis: Kpi[] = [
  { label: "کل پرسنل", value: 142, delta: 4, icon: "UsersRound" },
  { label: "پرسنل فعال", value: 118, delta: 3, icon: "Activity" },
  { label: "استخدام این ماه", value: 12, delta: 8, icon: "BriefcaseBusiness" },
  { label: "ترک خدمت", value: 5, delta: -2, icon: "ArrowDownRight" },
];

export const projects: Project[] = [
  {
    id: "p1",
    name: "اتوماسیون منابع انسانی",
    owner: "تیم فناوری",
    progress: 76,
    status: "در حال انجام",
  },
  {
    id: "p2",
    name: "باشگاه کارکنان",
    owner: "واحد فرهنگی",
    progress: 48,
    status: "تاخیر",
  },
  {
    id: "p3",
    name: "تحلیل عملکرد ۱۴۰۳",
    owner: "دیتا ساینس",
    progress: 92,
    status: "تکمیل",
  },
  {
    id: "p4",
    name: "سامانه ارزیابی ۳۶۰ درجه",
    owner: "منابع انسانی",
    progress: 33,
    status: "در حال انجام",
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "جمع‌آوری کارنامه فصلی",
    assignee: "مریم ر.",
    due: "۱۴۰۳/۰۵/۳۰",
    done: false,
  },
  {
    id: "t2",
    title: "به‌روزرسانی سیاست مرخصی",
    assignee: "کامیار د.",
    due: "۱۴۰۳/۰۶/۱۰",
    done: true,
  },
  {
    id: "t3",
    title: "مصاحبه استخدامی مربی بدنی",
    assignee: "الهام ک.",
    due: "۱۴۰۳/۰۶/۰۳",
    done: false,
  },
  {
    id: "t4",
    title: "تهیه گزارش مشارکت کارکنان",
    assignee: "سجاد م.",
    due: "۱۴۰۳/۰۶/۱۵",
    done: false,
  },
];

export const activity: Activity[] = [
  {
    id: "a1",
    title: "استخدام ۲ کارمند جدید در دپارتمان آموزش",
    time: "۲ ساعت پیش",
    type: "create",
  },
  {
    id: "a2",
    title: "به‌روزرسانی ساختار تیم فناوری",
    time: "دیروز",
    type: "update",
  },
  {
    id: "a3",
    title: "هشدار: کاهش درگیری شغلی در مرداد",
    time: "۳ روز پیش",
    type: "warning",
  },
  {
    id: "a4",
    title: "تکمیل پروژه تحلیل عملکرد ۱۴۰۳",
    time: "هفته گذشته",
    type: "update",
  },
];

export const persianMonths = [
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

export const revenueMonthly = [
  { name: "فروردین", value: 120 },
  { name: "اردیبهشت", value: 138 },
  { name: "خرداد", value: 155 },
  { name: "تیر", value: 142 },
  { name: "مرداد", value: 163 },
  { name: "شهریور", value: 170 },
  { name: "مهر", value: 178 },
  { name: "آبان", value: 186 },
  { name: "آذر", value: 174 },
  { name: "دی", value: 160 },
  { name: "بهمن", value: 171 },
  { name: "اسفند", value: 184 },
];

export const platformMix = [
  { name: "وب اپلیکیشن", value: 58, color: "var(--chart-1)" },
  { name: "موبایل اپلیکیشن", value: 34, color: "var(--chart-2)" },
  { name: "سایر پلتفرم‌ها", value: 8, color: "var(--chart-4)" },
];

export const goalsProgress = [
  { name: "رضایت کارکنان سازمان", value: 72 },
  { name: "دیجیتالی‌سازی فرآیندها", value: 64 },
  { name: "آموزش و توسعه منابع انسانی", value: 81 },
  { name: "افزایش بهره‌وری تیم‌ها", value: 69 },
];