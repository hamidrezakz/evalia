"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Question } from "@/assessment/types/question-banks.types";
import { useQuestions, useUpdateQuestion } from "@/assessment/api/hooks";
import { Edit2 } from "lucide-react";

export type BankQuestionsPreviewProps = {
  bankId?: number | null;
  onPick?: (questionId: number) => void;
  pageSize?: number;
  editable?: boolean; // enable inline edit per row
  className?: string;
};

export function BankQuestionsPreview({
  bankId,
  onPick,
  pageSize = 100,
  editable = true,
  className,
}: BankQuestionsPreviewProps) {
  const updateQuestion = useUpdateQuestion();
  const bankQuestionsQ = useQuestions({
    bankId: bankId ?? undefined,
    pageSize,
  });

  if (!bankId) return null;

  return (
    <div className={className} dir="rtl">
      <div className="mb-2 flex items-center justify-between">
        <Label className="flex items-center gap-2">
          سوالات بانک انتخاب‌شده
        </Label>
        <span className="text-xs text-muted-foreground">
          روی هر ردیف برای انتخاب کلیک کنید.{" "}
          {editable ? "برای ویرایش متن، ذخیره را بزنید." : ""}
        </span>
      </div>
      <div className="rounded-md border divide-y max-h-80 overflow-auto">
        {bankQuestionsQ.isLoading ? (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            در حال بارگذاری...
          </div>
        ) : Array.isArray((bankQuestionsQ.data as any)?.data) &&
          (bankQuestionsQ.data as any).data.length ? (
          ((bankQuestionsQ.data as any).data as Question[]).map((q) => (
            <BankQuestionRow
              key={q.id}
              q={q}
              editable={editable}
              onPick={() => onPick?.(q.id)}
              onSave={async (text) => {
                await updateQuestion.mutateAsync({
                  id: q.id,
                  body: { text } as any,
                });
              }}
            />
          ))
        ) : (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            سوالی یافت نشد
          </div>
        )}
      </div>
    </div>
  );
}

function BankQuestionRow({
  q,
  onPick,
  onSave,
  editable,
}: {
  q: Question;
  onPick: () => void;
  onSave: (text: string) => Promise<void>;
  editable?: boolean;
}) {
  const [text, setText] = React.useState(q.text || "");
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  React.useEffect(() => setText(q.text || ""), [q.id]);

  return (
    <div className="flex items-start gap-3 px-3 py-2 hover:bg-muted/50">
      <button
        className="text-right flex-1 text-sm"
        title="انتخاب سوال"
        onClick={onPick}>
        {!editing ? (
          <div className="whitespace-pre-wrap break-words">{q.text}</div>
        ) : (
          <Textarea
            className="w-full"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}
      </button>
      {editable ? (
        !editing ? (
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setEditing(true)}
            title="ویرایش">
            <Edit2 className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={saving || text.trim() === (q.text || "")}
              onClick={async () => {
                setSaving(true);
                try {
                  await onSave(text.trim());
                  setEditing(false);
                } finally {
                  setSaving(false);
                }
              }}>
              {saving ? "در حال ذخیره..." : "ذخیره"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setText(q.text || "");
              }}>
              انصراف
            </Button>
          </div>
        )
      ) : null}
    </div>
  );
}

export default BankQuestionsPreview;
