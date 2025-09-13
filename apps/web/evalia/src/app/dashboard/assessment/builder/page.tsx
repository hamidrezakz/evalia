import React from "react";
import { QuestionBuilderContainer } from "@/app/assessment/components";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
} from "@/components/ui/panel";

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
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <QuestionBuilderContainer />
        <Panel className="hidden xl:flex flex-col text-[11px] md:text-xs">
          <PanelHeader>
            <PanelTitle>راهنما</PanelTitle>
          </PanelHeader>
          <PanelContent className="flex-col gap-3">
            <p>
              1. ابتدا یک بانک سوال ایجاد یا انتخاب کنید.
              <br />
              2. سوالات را بسازید یا انتخاب کنید.
              <br />
              3. در پنل جزئیات، اطلاعات کامل و Option Set مرتبط نمایش داده
              می‌شود.
            </p>
            <p className="text-muted-foreground">
              برای مدیریت ست‌های گزینه به بخش "ست گزینه‌ها" بروید.
            </p>
          </PanelContent>
        </Panel>
      </div>
    </div>
  );
}
