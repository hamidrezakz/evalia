"use client";
import React from "react";
import { QuestionBankListPanel } from "../questionbanks/question-bank-list-panel";
import { OptionSetPanel } from "../optionsets/option-set-panel";
import { QuestionListPanel } from "./question-list-panel";
import { QuestionDetailPanel } from "./question-detail-panel";

// High-level orchestrator that lays out 3-column responsive builder
// mobile: stacked accordions (simplified) - for brevity we keep stacked panels

export const QuestionBuilderContainer: React.FC = () => {
  const [selectedBank, setSelectedBank] = React.useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedOptionSet, setSelectedOptionSet] = React.useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedQuestion, setSelectedQuestion] = React.useState<any | null>(
    null
  );
  // detail editing moved to QuestionDetailPanel

  return (
    <div className="grid gap-4 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 grid-cols-1">
      <QuestionBankListPanel
        onSelect={(b) => {
          setSelectedBank(b);
        }}
        selectedBankId={selectedBank?.id}
        className="min-h-[420px]"
      />
      <OptionSetPanel
        onSelect={(os) => setSelectedOptionSet(os)}
        selectedOptionSetId={selectedOptionSet?.id}
        className="min-h-[420px]"
      />
      <QuestionListPanel
        bankId={selectedBank?.id}
        selectedQuestionId={selectedQuestion?.id}
        onSelect={(q) => setSelectedQuestion(q)}
      />
      <QuestionDetailPanel questionId={selectedQuestion?.id || null} />
    </div>
  );
};
