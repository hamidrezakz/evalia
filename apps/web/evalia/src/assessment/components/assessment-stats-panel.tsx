"use client";
import React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
} from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuestionBanks, useOptionSets, useQuestions } from "../api/hooks";

// Simple aggregated counts panel. Could be extended with time filters later.
export const AssessmentStatsPanel: React.FC = () => {
  const banks = useQuestionBanks();
  const optionSets = useOptionSets();
  const questions = useQuestions({ limit: 1 }); // fetch first page only to trigger total count if available later

  const loading =
    banks.isLoading || optionSets.isLoading || questions.isLoading;

  const banksCount = banks.data?.data?.length ?? 0;
  const optionSetsCount = optionSets.data?.data?.length ?? 0;
  const questionsCount = (questions.data as any)?.data?.length ?? 0;

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>آمار کلی</PanelTitle>
      </PanelHeader>
      <PanelContent className="flex-col gap-4 text-xs">
        {loading && <Skeleton className="h-16" />}
        {!loading && (
          <ul className="grid grid-cols-3 gap-4 text-center">
            <li className="space-y-1">
              <div className="text-lg font-semibold">{banksCount}</div>
              <div className="text-[10px] text-muted-foreground">بانک سوال</div>
            </li>
            <li className="space-y-1">
              <div className="text-lg font-semibold">{optionSetsCount}</div>
              <div className="text-[10px] text-muted-foreground">ست گزینه</div>
            </li>
            <li className="space-y-1">
              <div className="text-lg font-semibold">{questionsCount}</div>
              <div className="text-[10px] text-muted-foreground">سوال</div>
            </li>
          </ul>
        )}
      </PanelContent>
    </Panel>
  );
};
