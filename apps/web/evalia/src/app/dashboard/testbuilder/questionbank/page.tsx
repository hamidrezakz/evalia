"use client";
import * as React from "react";
import { QuestionBankListPanel } from "@/assessment/components";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/ui/panel";
import { Label } from "@/components/ui/label";
import { QuestionBankCombobox } from "@/assessment/components/questions/create/question-bank-combobox";
import BankQuestionsPreview from "@/assessment/components/questions/bank-questions-preview";

export default function QuestionBankListPanelpage() {
  const [bankId, setBankId] = React.useState<number | null>(null);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <QuestionBankListPanel />
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle className="text-base">پیش‌نمایش سوالات بانک</PanelTitle>
        </PanelHeader>
        <PanelContent className="flex-col gap-4">
          <div className="space-y-2">
            <Label>بانک سوال</Label>
            <QuestionBankCombobox
              value={bankId}
              onChange={(id) => setBankId(id)}
              placeholder="انتخاب بانک سوال"
            />
          </div>

          {bankId ? (
            <BankQuestionsPreview bankId={bankId} editable={false} />
          ) : null}
        </PanelContent>
      </Panel>
    </div>
  );
}
