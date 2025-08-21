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

export const revenueMonthly = [
  { name: "فرو", value: 120 },
  { name: "ارد", value: 138 },
  { name: "خر", value: 155 },
  { name: "تی", value: 142 },
  { name: "مر", value: 163 },
  { name: "شه", value: 170 },
  { name: "مه", value: 178 },
  { name: "آب", value: 186 },
  { name: "آذ", value: 174 },
  { name: "دی", value: 160 },
  { name: "به", value: 171 },
  { name: "اس", value: 184 },
];

export const platformMix = [
  { name: "وب", value: 58, color: "var(--chart-1)" },
  { name: "موبایل", value: 34, color: "var(--chart-2)" },
  { name: "سایر", value: 8, color: "var(--chart-4)" },
];

export const goalsProgress = [
  { name: "رضایت کارکنان", value: 72 },
  { name: "فرآیند دیجیتال", value: 64 },
  { name: "آموزش و توسعه", value: 81 },
  { name: "بهره‌وری تیم‌ها", value: 69 },
];
