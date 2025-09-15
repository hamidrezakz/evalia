"use client";
import React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
} from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "../../api/hooks";
import { useOptionSets } from "../../api/hooks";

interface QuestionListPanelProps {
  bankId?: number | null;
  optionSetId?: number | null;
  onSelect?: (q: any) => void;
  selectedQuestionId?: number | null;
}

const typeLabels: Record<string, string> = {
  SCALE: "سنجشی",
  TEXT: "متنی",
  MULTI_CHOICE: "چند انتخابی",
  SINGLE_CHOICE: "تک انتخابی",
  BOOLEAN: "بله/خیر",
};

export const QuestionListPanel: React.FC<QuestionListPanelProps> = ({
  bankId,
  onSelect,
  selectedQuestionId,
}) => {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("");
  const { data, isLoading, refetch } = useQuestions({
    bankId,
    search,
    type: typeFilter || undefined,
  });
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();
  const [creating, setCreating] = React.useState(false);
  const [newText, setNewText] = React.useState("");
  const [newType, setNewType] = React.useState("TEXT");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editText, setEditText] = React.useState("");

  const questions = data?.data || [];

  function handleCreate() {
    if (!bankId) return;
    if (!newText.trim()) return;
    createMutation.mutate(
      { bankId, text: newText.trim(), type: newType as any },
      {
        onSuccess: () => {
          setNewText("");
          setCreating(false);
        },
      }
    );
  }
  function handleSaveEdit() {
    if (!editingId) return;
    updateMutation.mutate(
      { id: editingId, body: { text: editText } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditText("");
        },
      }
    );
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>سوالات</PanelTitle>
      </PanelHeader>
      <PanelContent className="flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="جستجو"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-md h-9 px-2 text-sm bg-background">
            <option value="">همه انواع</option>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            فیلتر
          </Button>
          {!creating && (
            <Button
              size="sm"
              disabled={!bankId}
              onClick={() => setCreating(true)}>
              ایجاد سوال
            </Button>
          )}
        </div>
        {creating && (
          <div className="flex flex-col gap-2 border p-3 rounded-md">
            <Input
              placeholder="متن سوال"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="border rounded-md h-9 px-2 text-sm bg-background">
              {Object.entries(typeLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                isLoading={createMutation.isPending}>
                ثبت
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCreating(false);
                  setNewText("");
                }}>
                انصراف
              </Button>
            </div>
          </div>
        )}
        <div className="flex flex-col divide-y border rounded-md overflow-hidden">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          {!isLoading &&
            questions.map((q) => (
              <div
                key={q.id}
                className={`flex items-center gap-2 px-3 py-2 text-sm ${
                  selectedQuestionId === q.id ? "bg-primary/10" : ""
                }`}>
                <button
                  className="flex-1 text-start"
                  onClick={() => onSelect?.(q)}>
                  {editingId === q.id ? (
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="h-8"
                    />
                  ) : (
                    <span className="flex flex-col">
                      <span className="line-clamp-1">{q.text}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {typeLabels[q.type]}
                      </span>
                    </span>
                  )}
                </button>
                {editingId === q.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleSaveEdit}
                      isLoading={updateMutation.isPending}>
                      ذخیره
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setEditText("");
                      }}>
                      لغو
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(q.id);
                        setEditText(q.text);
                      }}>
                      ✎
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(q.id)}>
                      🗑
                    </Button>
                  </div>
                )}
              </div>
            ))}
          {!isLoading && questions.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              موردی یافت نشد
            </div>
          )}
        </div>
      </PanelContent>
    </Panel>
  );
};
