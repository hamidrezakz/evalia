"use client";
import React from "react";
import { QuestionBankListPanel } from "./question-bank-list-panel";
import { OptionSetPanel } from "./option-set-panel";
import { QuestionListPanel } from "./question-list-panel";
import {
  Panel,
  PanelHeader,
  PanelContent,
  PanelTitle,
} from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { useQuestion, useUpdateQuestion } from "../api/hooks";
import { Input } from "@/components/ui/input";

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
  const questionQuery = useQuestion(selectedQuestion?.id || null);
  const updateQuestionMutation = useUpdateQuestion();
  const [editingMeta, setEditingMeta] = React.useState(false);
  const [questionTextDraft, setQuestionTextDraft] = React.useState("");

  React.useEffect(() => {
    if (questionQuery.data) {
      setQuestionTextDraft(questionQuery.data.text);
    }
  }, [questionQuery.data]);

  function saveQuestion() {
    if (!selectedQuestion) return;
    updateQuestionMutation.mutate(
      { id: selectedQuestion.id, body: { text: questionTextDraft } },
      {
        onSuccess: (q) => {
          setEditingMeta(false);
          setSelectedQuestion(q);
        },
      }
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
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
      <Panel className="min-h-[420px] flex flex-col">
        <PanelHeader>
          <PanelTitle>جزییات سوال</PanelTitle>
        </PanelHeader>
        <PanelContent className="flex-col gap-4 text-sm overflow-auto">
          {!selectedQuestion && (
            <div className="text-muted-foreground text-xs">
              یک سوال را انتخاب کنید
            </div>
          )}
          {selectedQuestion && questionQuery.isLoading && (
            <div className="text-xs">در حال بارگذاری...</div>
          )}
          {selectedQuestion && questionQuery.data && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] mb-1 text-muted-foreground">
                  متن سوال
                </label>
                {editingMeta ? (
                  <Input
                    value={questionTextDraft}
                    onChange={(e) => setQuestionTextDraft(e.target.value)}
                  />
                ) : (
                  <p className="text-sm leading-relaxed">
                    {questionQuery.data.text}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {!editingMeta && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingMeta(true)}>
                    ویرایش
                  </Button>
                )}
                {editingMeta && (
                  <>
                    <Button
                      size="sm"
                      onClick={saveQuestion}
                      isLoading={updateQuestionMutation.isPending}>
                      ذخیره
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingMeta(false);
                        setQuestionTextDraft(questionQuery.data?.text || "");
                      }}>
                      لغو
                    </Button>
                  </>
                )}
              </div>
              <div className="pt-2 border-t">
                <h4 className="font-medium text-xs mb-2">اطلاعات پایه</h4>
                <ul className="space-y-1 text-[11px]">
                  <li>شناسه: {questionQuery.data.id}</li>
                  <li>نوع: {questionQuery.data.type}</li>
                  {questionQuery.data.optionSetId && (
                    <li>ست گزینه: {questionQuery.data.optionSetId}</li>
                  )}
                  {questionQuery.data.minScale != null && (
                    <li>حداقل: {questionQuery.data.minScale}</li>
                  )}
                  {questionQuery.data.maxScale != null && (
                    <li>حداکثر: {questionQuery.data.maxScale}</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </PanelContent>
      </Panel>
    </div>
  );
};
