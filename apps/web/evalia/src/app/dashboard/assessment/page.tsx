import React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
  PanelDescription,
} from "@/components/ui/panel";
import Link from "next/link";
import {
  AssessmentStatsPanel,
  RecentQuestionsPanel,
  QuestionBankListPanel,
  OptionSetPanel,
} from "@/assessment/components";

export const metadata = { title: "ارزیابی - نمای کلی" };

export default function AssessmentOverviewPage() {
  const features = [
    {
      title: "ساخت سوالات",
      desc: "مدیریت بانک سوال، ست گزینه و خود سوالات",
      href: "/dashboard/assessment/builder",
    },
    {
      title: "ست گزینه‌ها",
      desc: "ویرایش و مدیریت Option Set ها",
      href: "/dashboard/assessment/option-sets",
    },
  ];
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-4">
        <AssessmentStatsPanel />
      </div>
      <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <Panel key={f.title} className="h-full">
            <PanelHeader>
              <PanelTitle>{f.title}</PanelTitle>
              <PanelDescription>{f.desc}</PanelDescription>
            </PanelHeader>
            <PanelContent className="text-sm">
              <Link
                href={f.href}
                className="text-primary text-[11px] underline underline-offset-4">
                رفتن به {f.title}
              </Link>
            </PanelContent>
          </Panel>
        ))}
      </div>
      <RecentQuestionsPanel />
    </div>
  );
}
