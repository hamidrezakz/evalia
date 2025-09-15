import React from "react";
import { OptionSetPanel, QuestionBankListPanel } from "@/assessment/components";

export const metadata = { title: "ست گزینه‌ها" };

export default function OptionSetsManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-base font-semibold">
          مدیریت ست گزینه‌ها و بانک‌ها
        </h1>
        <p className="text-[11px] md:text-xs text-muted-foreground max-w-3xl leading-relaxed">
          ست گزینه‌ها مجموعه‌ای از مقادیر از پیش تعریف شده هستند که در سوالات
          چندگزینه‌ای یا مشابه آن استفاده می‌شوند. از اینجا می‌توانید ست‌ها را
          ایجاد، ویرایش و گزینه‌های داخلی آن‌ها را مدیریت کنید. بانک سوال نیز
          گروه‌بندی منطقی سوالات را ممکن می‌سازد.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <OptionSetPanel />
          <QuestionBankListPanel />
      </div>
    </div>
  );
}
