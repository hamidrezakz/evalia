import React from "react";
import { QuestionBuilderContainer } from "@/assessment/components";

export const metadata = { title: "Builder سوالات" };

export default function QuestionBuilderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-base font-semibold">ساخت و مدیریت سوالات</h1>
        <p className="text-[11px] md:text-xs text-muted-foreground max-w-2xl leading-relaxed">
          در این بخش می‌توانید بانک سوال را انتخاب کنید، سوال جدید بسازید و
          جزئیات کامل هر سوال از جمله ست گزینه و مقادیر آن را مشاهده کنید.
        </p>
      </div>
        <QuestionBuilderContainer />
    </div>
  );
}
