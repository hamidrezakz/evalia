import React from "react";
import {
  OptionSetPanel,
  QuestionBankListPanel,
} from "@/app/assessment/components";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
} from "@/components/ui/panel";

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
        <div className="grid gap-6 md:grid-cols-2">
          <OptionSetPanel />
          <QuestionBankListPanel />
        </div>
        <Panel className="hidden xl:flex flex-col text-[11px] md:text-xs">
          <PanelHeader>
            <PanelTitle>نکات</PanelTitle>
          </PanelHeader>
          <PanelContent className="flex-col gap-3">
            <ul className="list-disc ps-5 space-y-1">
              <li>
                برای جابجایی ترتیب گزینه‌ها از فلش‌ها در حالت ویرایش استفاده
                کنید.
              </li>
              <li>با ذخیره، همه گزینه‌های ست به صورت یکجا جایگزین می‌شوند.</li>
              <li>لیبل و مقدار هر گزینه باید خالی نباشد.</li>
              <li>
                امکان مشاهده استفاده ست‌ها در سوالات به زودی افزوده می‌شود.
              </li>
            </ul>
          </PanelContent>
        </Panel>
      </div>
    </div>
  );
}
