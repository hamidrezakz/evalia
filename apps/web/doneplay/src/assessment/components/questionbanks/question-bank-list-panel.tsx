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
import {
  Library,
  ListOrdered,
  Search,
  PlusCircle,
  Edit,
  Save,
  X,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fadeSlideUp, listItem, growY } from "@/lib/motion/presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  useQuestionBanks,
  useCreateQuestionBank,
  useUpdateQuestionBank,
  useDeleteQuestionBank,
} from "../../api/hooks";
import { useOrgState } from "@/organizations/organization/context/org-context";
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
  const { activeOrganizationId } = useOrgState();
  const { data, isLoading, refetch } = useQuestionBanks(activeOrganizationId, {
    search,
  });
  const createMutation = useCreateQuestionBank(activeOrganizationId);
  const updateMutation = useUpdateQuestionBank(activeOrganizationId);
  const deleteMutation = useDeleteQuestionBank(activeOrganizationId);
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
            <Button
              size="sm"
              onClick={() => setCreating(true)}
              icon={<PlusCircle className="w-4 h-4" />}>
              بانک جدید{" "}
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
                    autoFocus
                    onChange={(e) => setNewName(e.target.value)}
                    className="pl-8"
                  />
                  <Library className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  isLoading={createMutation.isPending}
                  disabled={!newName.trim()}
                  icon={<PlusCircle className="w-4 h-4" />}>
                  ثبت
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCreating(false);
                    setNewName("");
                  }}
                  icon={<X className="w-4 h-4" />}></Button>
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
                            autoFocus
                            className="h-8 pl-8"
                          />
                          <Edit className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                      ) : (
                        <>
                          <span className="truncate flex items-center gap-2">
                            <Library className="w-4 h-4 text-muted-foreground" />
                            {b.name}
                          </span>
                          <span className="flex items-center gap-2">
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
                          isLoading={updateMutation.isPending}
                          icon={<Save className="w-4 h-4" />}>
                          ذخیره
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setEditName("");
                          }}
                          icon={<X className="w-4 h-4" />}></Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(b.id, b.name)}
                          icon={<Edit className="w-4 h-4" />}
                          aria-label="ویرایش"
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => e.stopPropagation()}
                              icon={<Trash2 className="w-4 h-4" />}
                              aria-label="حذف"
                            />
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف بانک سوال</AlertDialogTitle>
                              <AlertDialogDescription>
                                آیا از حذف این بانک مطمئن هستید؟ این عملیات
                                غیرقابل بازگشت است.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteMutation.mutate(b.id)}
                                disabled={
                                  deleteMutation.isPending &&
                                  (deleteMutation as any).variables === b.id
                                }>
                                {deleteMutation.isPending &&
                                (deleteMutation as any).variables === b.id
                                  ? "در حال حذف..."
                                  : "حذف"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
