"use client";
import React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
} from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Eye } from "lucide-react";
import { useQuestionBuilder } from "./useQuestionBuilder";
import QuestionListPanel from "./QuestionListPanel";
import QuestionPreview from "./QuestionPreview";
import QuestionFormFields from "./QuestionFormFields";
import BuilderActions from "./BuilderActions";

export function QuestionBuilder() {
  const {
    state,
    setState,
    message,
    banksQ,
    questionsQ,
    optionSetsQ,
    optionSetOptionsQ,
    selectedQuestion,
    isEditing,
    isDirty,
    previewOptions,
    handleCreate,
    handleUpdate,
    resetDraft,
    createIsPending,
    updateIsPending,
  } = useQuestionBuilder();

  // All side-effects and selection syncing handled inside the hook

  // message is already managed in the hook via handlers

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" dir="rtl">
     
      {/* Right: Live preview and create new question */}
      <Panel>
        <PanelHeader className="flex-row items-center justify-between gap-2">
          <PanelTitle className="text-sm font-semibold flex items-center gap-2">
            <Eye className="size-4 text-primary" /> پیش‌نمایش و ساخت / ویرایش
            سؤال
          </PanelTitle>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {selectedQuestion && (
              <Badge variant="outline" className="text-[9px]">
                کدسوالی: #{selectedQuestion.id}
              </Badge>
            )}
            {isDirty && selectedQuestion && (
              <span className="text-amber-500">تغییرات ذخیره نشده</span>
            )}
            {message && (
              <span className="text-green-600 dark:text-green-400">
                {message}
              </span>
            )}
          </div>
        </PanelHeader>
        <PanelContent className="flex-col gap-4">
          <QuestionPreview
            title={
              selectedQuestion?.text || state.draftText || "پیش‌نمایش سؤال"
            }
            type={(selectedQuestion?.type || state.draftType) as any}
            options={previewOptions as any}
            minScale={selectedQuestion?.minScale ?? state.draftMinScale ?? 1}
            maxScale={selectedQuestion?.maxScale ?? state.draftMaxScale ?? 5}
          />

          <QuestionFormFields
            isEditing={isEditing}
            draftText={state.draftText}
            onTextChange={(v) => setState((s) => ({ ...s, draftText: v }))}
            draftType={state.draftType as any}
            onTypeChange={(t) => setState((s) => ({ ...s, draftType: t }))}
            draftOptionSetId={state.draftOptionSetId}
            onOptionSetChange={(id) =>
              setState((s) => ({
                ...s,
                draftOptionSetId: id,
                inlineOptions: id ? [] : s.inlineOptions,
              }))
            }
            optionSets={(optionSetsQ.data?.data as any[]) || []}
            optionSetsLoading={optionSetsQ.isLoading}
            optionSetOptions={(optionSetOptionsQ.data as any[]) || []}
            inlineOptions={state.inlineOptions}
            onInlineOptionsChange={(opts) =>
              setState((s) => ({ ...s, inlineOptions: opts }))
            }
            draftMinScale={state.draftMinScale}
            draftMaxScale={state.draftMaxScale}
            onMinScaleChange={(n) =>
              setState((s) => ({ ...s, draftMinScale: n }))
            }
            onMaxScaleChange={(n) =>
              setState((s) => ({ ...s, draftMaxScale: n }))
            }
            originalHadManualOptions={
              !!(isEditing && selectedQuestion && !selectedQuestion.optionSetId)
            }
          />

          <BuilderActions
            isEditing={!!selectedQuestion}
            canCreate={
              !!state.bankId &&
              !!state.draftText &&
              !(
                (state.draftType === "SINGLE_CHOICE" ||
                  state.draftType === "MULTI_CHOICE") &&
                !state.draftOptionSetId &&
                state.inlineOptions.filter(
                  (o) => o.value.trim() && o.label.trim()
                ).length < 2
              )
            }
            canUpdate={
              !!state.draftText &&
              isDirty &&
              !(
                (state.draftType === "SINGLE_CHOICE" ||
                  state.draftType === "MULTI_CHOICE") &&
                !state.draftOptionSetId &&
                state.inlineOptions.filter(
                  (o) => o.value.trim() && o.label.trim()
                ).length < 1
              )
            }
            creating={createIsPending}
            updating={updateIsPending}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onCancelEdit={() =>
              setState((s) => ({ ...s, selectedQuestionId: null }))
            }
            onNew={() => {
              resetDraft();
              setState((s) => ({ ...s, selectedQuestionId: null }));
            }}
            onReset={resetDraft}
          />
          <div className="flex justify-end w-full -mt-1">
            <span className="text-[10px] text-muted-foreground" dir="ltr">
              Ctrl+Enter → Save
            </span>
          </div>
        </PanelContent>
      </Panel>

       {/* Left: Pick bank and question from comboboxes */}
      <Panel>
        <PanelHeader className="flex-row items-center justify-between gap-2">
          <PanelTitle className="text-sm font-semibold flex items-center gap-2">
            <ListChecks className="size-4 text-primary" /> بانک سؤال و انتخاب
            سؤال
          </PanelTitle>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {banksQ.isLoading && <span>لود بانک‌ها...</span>}
            {state.bankId && questionsQ.isLoading && <span>لود سوالات...</span>}
          </div>
        </PanelHeader>
        <PanelContent className="flex-col gap-3">
          <QuestionListPanel
            banks={(banksQ.data?.data as any[]) || []}
            banksLoading={banksQ.isLoading}
            questions={(questionsQ.data?.data as any[]) || []}
            questionsLoading={questionsQ.isLoading}
            questionsError={questionsQ.error}
            bankId={state.bankId}
            onBankChange={(id) =>
              setState((s) => ({ ...s, bankId: id, selectedQuestionId: null }))
            }
            search={state.search}
            onSearchChange={(v) => setState((s) => ({ ...s, search: v }))}
            selectedQuestionId={state.selectedQuestionId}
            onSelectQuestion={(id) =>
              setState((s) => ({ ...s, selectedQuestionId: id }))
            }
          />
        </PanelContent>
      </Panel>

    </div>
  );
}

export default QuestionBuilder;
