"use client";
import React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
  PanelAction,
} from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useQuestionBanks,
  useCreateQuestionBank,
  useUpdateQuestionBank,
  useDeleteQuestionBank,
} from "../../api/hooks";

interface QuestionBankListPanelProps {
  onSelect?: (bank: { id: number; name: string }) => void;
  selectedBankId?: number | null;
  className?: string;
}

export const QuestionBankListPanel: React.FC<QuestionBankListPanelProps> = ({
  onSelect,
  selectedBankId,
  className,
}) => {
  const [search, setSearch] = React.useState("");
  const { data, isLoading, refetch } = useQuestionBanks({ search });
  const createMutation = useCreateQuestionBank();
  const updateMutation = useUpdateQuestionBank();
  const deleteMutation = useDeleteQuestionBank();
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editName, setEditName] = React.useState("");

  const banks = data?.data || [];

  function handleCreate() {
    if (!newName.trim()) return;
    createMutation.mutate(
      { name: newName.trim() },
      {
        onSuccess: () => {
          setNewName("");
          setCreating(false);
        },
      }
    );
  }
  function handleEdit(id: number, current: string) {
    setEditingId(id);
    setEditName(current);
  }
  function handleSaveEdit() {
    if (!editingId) return;
    updateMutation.mutate(
      { id: editingId, body: { name: editName } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditName("");
        },
      }
    );
  }

  return (
    <Panel className={className}>
      <PanelHeader>
        <PanelTitle>بانک سوالات</PanelTitle>
        <PanelAction>
          {!creating && (
            <Button size="sm" onClick={() => setCreating(true)}>
              ایجاد
            </Button>
          )}
        </PanelAction>
      </PanelHeader>
      <PanelContent className="flex-col gap-4">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="جستجو..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            جستجو
          </Button>
        </div>
        {creating && (
          <div className="flex gap-2 items-center">
            <Input
              placeholder="نام بانک"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
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
                setNewName("");
              }}>
              انصراف
            </Button>
          </div>
        )}
        <div className="flex flex-col divide-y border rounded-md overflow-hidden">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          {!isLoading &&
            banks.map((b) => (
              <div
                key={b.id}
                className={`flex items-center gap-2 px-3 py-2 text-sm ${
                  selectedBankId === b.id ? "bg-primary/10" : ""
                }`}>
                <button
                  className="flex-1 text-start"
                  onClick={() => onSelect?.(b)}>
                  {editingId === b.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                    />
                  ) : (
                    b.name
                  )}
                </button>
                {editingId === b.id ? (
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
                        setEditName("");
                      }}>
                      لغو
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(b.id, b.name)}>
                      ✎
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(b.id)}>
                      🗑
                    </Button>
                  </div>
                )}
              </div>
            ))}
          {!isLoading && banks.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              موردی یافت نشد
            </div>
          )}
        </div>
      </PanelContent>
    </Panel>
  );
};
