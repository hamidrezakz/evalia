"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import Combobox from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { QuestionTypeBadge } from "@/components/status-badges";
import { Trash2, Search, Library, ListChecks } from "lucide-react";
import ConfirmDeleteQuestionDialog from "./ConfirmDeleteQuestionDialog";
import { useDeleteQuestion } from "@/assessment/api/question-hooks";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { notifyError, notifySuccess } from "@/lib/notifications";

export interface QuestionListPanelProps {
  banks: any[];
  banksLoading?: boolean;
  questions: any[];
  questionsLoading?: boolean;
  questionsError?: any;
  bankId: number | null;
  onBankChange: (id: number | null) => void;
  search: string;
  onSearchChange: (v: string) => void;
  selectedQuestionId: number | null;
  onSelectQuestion: (id: number) => void;
}

export function QuestionListPanel(props: QuestionListPanelProps) {
  const {
    banks,
    banksLoading,
    questions,
    questionsLoading,
    questionsError,
    bankId,
    onBankChange,
    search,
    onSearchChange,
    selectedQuestionId,
    onSelectQuestion,
  } = props;

  const { activeOrganizationId } = useOrgState();
  const delMut = useDeleteQuestion(activeOrganizationId);
  const [confirmOpenForId, setConfirmOpenForId] = React.useState<number | null>(
    null
  );

  return (
    <div className="flex-col gap-3 flex">
      <div className="flex flex-col gap-1.5">
        <Combobox
          items={(banks as any[]) || []}
          value={bankId}
          onChange={(v) => onBankChange((v as number) || null)}
          getKey={(b: any) => b.id}
          getLabel={(b: any) => b.name}
          placeholder="بانک را انتخاب کنید"
          loading={banksLoading}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] font-medium flex items-center gap-2">
          <Library className="w-4 h-4 text-muted-foreground" /> لیست سؤالات
        </Label>
        <div className="relative">
          <Input
            placeholder="جستجو..."
            className="h-8 text-xs pl-8"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="جستجو"
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        <div className="max-h-128 overflow-auto rounded-md border divide-y bg-card/50">
          {bankId && questionsError && (
            <div className="text-[11px] text-destructive px-3 py-2">
              خطا در دریافت سوالات
            </div>
          )}
          {!bankId && (
            <div className="text-[11px] text-muted-foreground px-3 py-2">
              ابتدا یک بانک را انتخاب کنید
            </div>
          )}
          {bankId && Array.isArray(questions) && questions.length ? (
            (questions as any[]).map((q, idx) => {
              const active = selectedQuestionId === q.id;
              return (
                <div
                  key={q.id}
                  className={
                    "group w-full text-right px-3 py-2 transition-colors text-xs flex items-center gap-2 " +
                    (active
                      ? "bg-primary/5 border-s-2 border-primary/60"
                      : "hover:bg-muted/40")
                  }>
                  <button
                    className="flex-1 text-start"
                    onClick={() => onSelectQuestion(q.id)}>
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-muted text-[10px] text-muted-foreground inline-flex items-center justify-center ltr:font-mono">
                        {idx + 1}
                      </span>
                      <span className="font-medium line-clamp-1 flex-1 text-start">
                        {q.text || "(بدون متن)"}
                      </span>
                      <QuestionTypeBadge
                        type={q.type as any}
                        tone={active ? "solid" : "soft"}
                        size="xs"
                      />
                    </div>
                  </button>
                  <button
                    className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="حذف سؤال"
                    onClick={() => setConfirmOpenForId(q.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ConfirmDeleteQuestionDialog
                    open={confirmOpenForId === q.id}
                    onOpenChange={(o) => !o && setConfirmOpenForId(null)}
                    questionText={q.text}
                    loading={
                      delMut.isPending && (delMut as any).variables === q.id
                    }
                    onConfirm={async () => {
                      try {
                        await delMut.mutateAsync(q.id);
                        notifySuccess("سؤال حذف شد");
                        setConfirmOpenForId(null);
                      } catch (e: any) {
                        notifyError(e?.message || "خطا در حذف سؤال");
                      }
                    }}
                  />
                </div>
              );
            })
          ) : bankId ? (
            <div className="text-[11px] text-muted-foreground px-3 py-2">
              {questionsLoading ? "در حال بارگذاری..." : "سوالی یافت نشد"}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default QuestionListPanel;
