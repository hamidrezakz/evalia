// در این کانتکست، Team به معنای «کلاس» و role به معنای «پایه» استفاده می‌شود.
export type Team = "1/الف" | "1/ب" | "2/الف" | "2/ب" | "3/الف" | "3/ب";
export type Employee = {
  id: string; // شناسه دانش‌آموز
  name: string; // نام و نام‌خانوادگی
  role: string; // پایه تحصیلی
  team: Team; // کلاس
  avatar?: string;
  hiredAt: string; // تاریخ ثبت‌نام (ISO)
  status: "active" | "onboarding" | "inactive"; // وضعیت حضور/ثبت‌نام
};

export type Activity = {
  id: string;
  type: "enroll" | "withdraw" | "exam" | "achievement" | "absence";
  actor: string; // student or staff name
  message: string;
  time: string; // relative like '2h' or ISO
};

export type Task = {
  id: string;
  title: string; // فعالیت آموزشی/اجرایی
  assignee?: string; // مسئول
  due?: string; // موعد (ISO)
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
};

export type Summary = {
  headcount: number; // کل دانش‌آموزان
  activeRate: number; // نرخ حضور 0..100
  hiresThisPeriod: number; // ثبت‌نام این دوره
  leavesThisPeriod: number; // انصراف این دوره
};

export const recentEmployees: Employee[] = [
  {
    id: "s1",
    name: "آرش محمدی",
    role: "پایه اول",
    team: "1/الف",
    hiredAt: "2025-08-01",
    status: "onboarding",
  },
  {
    id: "s2",
    name: "نرگس بهرامی",
    role: "پایه دوم",
    team: "2/ب",
    hiredAt: "2025-07-28",
    status: "active",
  },
  {
    id: "s3",
    name: "پارسا کریمی",
    role: "پایه سوم",
    team: "3/الف",
    hiredAt: "2025-07-25",
    status: "active",
  },
  {
    id: "s4",
    name: "مریم رستمی",
    role: "پایه اول",
    team: "1/ب",
    hiredAt: "2025-07-20",
    status: "active",
  },
  {
    id: "s5",
    name: "امیررضا قربانی",
    role: "پایه دوم",
    team: "2/الف",
    hiredAt: "2025-07-15",
    status: "inactive",
  },
];

export const activities: Activity[] = [
  {
    id: "a1",
    type: "enroll",
    actor: "آرش محمدی",
    message: "ثبت‌نام جدید در پایه اول (1/الف)",
    time: "2h",
  },
  {
    id: "a2",
    type: "exam",
    actor: "گروه آموزشی",
    message: "برگزاری آزمون هوش فضایی برای پایه دوم",
    time: "6h",
  },
  {
    id: "a3",
    type: "achievement",
    actor: "پارسا کریمی",
    message: "کسب رتبه اول مسابقات ریاضی منطقه",
    time: "1d",
  },
  {
    id: "a4",
    type: "absence",
    actor: "مریم رستمی",
    message: "غیبت ثبت‌شده در کلاس 1/ب",
    time: "2d",
  },
  {
    id: "a5",
    type: "withdraw",
    actor: "امیررضا قربانی",
    message: "انصراف از ثبت‌نام (2/الف)",
    time: "3d",
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "برگزاری جلسه اولیا و مربیان",
    assignee: "مدیریت",
    status: "in-progress",
    priority: "high",
  },
  {
    id: "t2",
    title: "تنظیم برنامه آزمون میان‌ترم",
    assignee: "گروه آموزشی",
    status: "todo",
    priority: "medium",
  },
  {
    id: "t3",
    title: "جمع‌آوری کارنامه نوبت اول",
    assignee: "دفتر آموزش",
    status: "todo",
    priority: "high",
  },
  {
    id: "t4",
    title: "ثبت نمرات ارزیابی چندهوشی",
    assignee: "معلمان",
    status: "in-progress",
    priority: "high",
  },
  {
    id: "t5",
    title: "به‌روزرسانی پرونده سلامت دانش‌آموزان",
    assignee: "بهداشت",
    status: "done",
    priority: "low",
  },
];

export const summary: Summary = {
  headcount: 360,
  activeRate: 87,
  hiresThisPeriod: 28,
  leavesThisPeriod: 7,
};

// Small helpers for UI badges/colors if needed later
export const priorityColor: Record<Task["priority"], string> = {
  low: "var(--chart-1)",
  medium: "var(--chart-2)",
  high: "var(--chart-4)",
};
