"use client";
import React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
  PanelAction,
  PanelDescription,
} from "@/components/ui/panel";
import { Library, ListOrdered, Search, PlusCircle, Edit } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fadeSlideUp, listItem, growY } from "@/lib/motion/presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useQuestionBanks,
  useCreateQuestionBank,
  useUpdateQuestionBank,
  useDeleteQuestionBank,
} from "../../api/hooks";
import { BankCountBadge } from "./bank-count-badge";

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

  // ...existing code...

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
        <div className="flex items-center gap-2">
          <Library className="w-5 h-5 text-primary" />
          <PanelTitle>بانک سوالات</PanelTitle>
        </div>
        <PanelDescription>مدیریت بانک‌های سوالات</PanelDescription>
        <PanelAction>
          {!creating && (
            <Button size="sm" onClick={() => setCreating(true)}>
              ایجاد
            </Button>
          )}
        </PanelAction>
      </PanelHeader>
      <PanelContent className="flex-col gap-4">
        {/* Main content entrance animation */}
        <motion.div {...fadeSlideUp} className="flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Input
                placeholder="جستجو..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <Search className="w-4 h-4 mr-1" />
              جستجو
            </Button>
          </div>
          {/* Create form expand/collapse animation */}
          <AnimatePresence initial={false}>
            {creating && (
              <motion.div
                key="create-form"
                {...growY}
                className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Input
                    placeholder="نام بانک"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="pl-8"
                  />
                  <PlusCircle className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  isLoading={createMutation.isPending}>
                  <PlusCircle className="w-2 h-2" />
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
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex flex-col divide-y border rounded-md overflow-hidden">
            {/* Banks list (items & skeletons) animated mount/unmount */}
            <AnimatePresence initial={false} mode="popLayout">
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <motion.div key={i} {...fadeSlideUp} className="px-3 py-2">
                    <Skeleton className="h-10" />
                  </motion.div>
                ))}
              {!isLoading &&
                banks.map((b) => (
                  <motion.div
                    key={b.id}
                    onClick={() => onSelect?.(b)}
                    layout
                    {...listItem}
                    className={`flex items-center gap-2 px-3 py-2 text-sm ${
                      selectedBankId === b.id ? "bg-primary/5" : ""
                    }`}>
                    <button className="flex-1 text-start inline-flex items-center gap-2">
                      {editingId === b.id ? (
                        <div className="relative flex-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 pl-8"
                          />
                          <Edit className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                      ) : (
                        <>
                          <span className="truncate flex items-center gap-1">
                            <Library className="w-4 h-4 text-muted-foreground" />
                            {b.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <BankCountBadge bankId={b.id} />
                          </span>
                        </>
                      )}
                    </button>
                    {editingId === b.id ? (
                      <div className="flex items-center gap-1 mr-0.5">
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
                      </div>
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
                  </motion.div>
                ))}
              {!isLoading && banks.length === 0 && (
                <motion.div
                  key="empty"
                  {...fadeSlideUp}
                  className="p-4 text-center text-xs text-muted-foreground">
                  موردی یافت نشد
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </PanelContent>
    </Panel>
  );
};
