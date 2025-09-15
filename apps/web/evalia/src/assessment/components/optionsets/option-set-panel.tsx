"use client";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { fade, fadeSlideUp, growY, listItem } from "@/lib/motion/presets";
import { Button } from "@/components/ui/button";
import {
  Search,
  PlusCircle,
  Save,
  X,
  Edit,
  ListChecks,
  Trash2,
} from "lucide-react";
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
  Panel,
  PanelAction,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "@/components/ui/panel";
import {
  useOptionSets,
  useCreateOptionSet,
  useUpdateOptionSet,
  useDeleteOptionSet,
  useOptionSetOptions,
} from "../../api/hooks";
import { OptionSetOptionsEditor } from "./option-set-options-editor";

interface OptionSetPanelProps {
  selectedOptionSetId?: number | null;
  onSelect?: (set: { id: number; name: string }) => void;
  className?: string;
}

export const OptionSetPanel: React.FC<OptionSetPanelProps> = ({
  selectedOptionSetId,
  onSelect,
  className,
}) => {
  const [searchText, setSearchText] = React.useState("");
  const [search, setSearch] = React.useState("");
  React.useEffect(() => {
    const id = setTimeout(() => setSearch(searchText.trim()), 350);
    return () => clearTimeout(id);
  }, [searchText]);

  const { data, isLoading, error } = useOptionSets({ search });
  const createMutation = useCreateOptionSet();
  const updateMutation = useUpdateOptionSet();
  const deleteMutation = useDeleteOptionSet();

  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editName, setEditName] = React.useState("");
  const [internalSelectedId, setInternalSelectedId] = React.useState<
    number | null
  >(null);
  const [editingOptions, setEditingOptions] = React.useState(false);

  const sets = data?.data || [];
  const effectiveSelectedId = selectedOptionSetId ?? internalSelectedId;
  const selected = sets.find((s) => s.id === effectiveSelectedId) || null;
  const optionsQuery = useOptionSetOptions(selected?.id ?? null);

  function selectSet(s: { id: number; name: string }) {
    if (selectedOptionSetId == null) setInternalSelectedId(s.id);
    onSelect?.(s);
    setEditingOptions(false); // Open options editor automatically
  }
  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    createMutation.mutate(
      { name },
      {
        onSuccess: (created: any) => {
          setNewName("");
          setCreating(false);
          if (created?.id) {
            if (selectedOptionSetId == null) setInternalSelectedId(created.id);
            onSelect?.({ id: created.id, name: created.name || name });
            setEditingOptions(true);
          }
        },
      }
    );
  }
  function handleSaveEdit() {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return;
    updateMutation.mutate(
      { id: editingId, body: { name } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditName("");
        },
      }
    );
  }
  function handleDelete(id: number) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        if (effectiveSelectedId === id) {
          setInternalSelectedId(null);
          setEditingOptions(false);
        }
      },
    });
  }

  // Using centralized motion presets (see src/lib/motion/presets.ts)

  return (
    <Panel className={className}>
      <PanelHeader>
        <div className="flex items-center gap-2">
          {" "}
          <ListChecks className="w-5 h-5 text-primary" />
          <PanelTitle>دسته گزینه‌ها</PanelTitle>
        </div>
        <PanelDescription>مدیریت دسته‌های گزینه</PanelDescription>

        {!creating && (
          <PanelAction>
            <Button
              size="sm"
              onClick={() => setCreating(true)}
              icon={<PlusCircle className="w-4 h-4" />}>
              ایجاد دسته
            </Button>
          </PanelAction>
        )}
      </PanelHeader>
      <PanelContent className="flex-col gap-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Input
              placeholder="جستجو..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <AnimatePresence>
          {creating && (
            <motion.div {...growY} className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Input
                  placeholder="نام دسته"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="pl-8"
                />
                <ListChecks className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <Button
                size="sm"
                onClick={handleCreate}
                isLoading={createMutation.isPending}
                disabled={!newName.trim()}
                icon={<Save className="w-4 h-4" />}>
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
        <div className="flex flex-col divide-y border rounded-md overflow-hidden min-h-40">
          <AnimatePresence>
            {isLoading && (
              <motion.div key="skeletons" {...fade} className="flex flex-col">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!isLoading &&
              sets.map((s) => {
                const isSelected = s.id === effectiveSelectedId;
                const isEditing = editingId === s.id;
                return (
                  <motion.div
                    key={s.id}
                    layout
                    onClick={() => selectSet(s)}
                    {...listItem}
                    className={`cursor-pointer flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      isSelected ? "bg-primary/10" : "hover:bg-muted/40"
                    }`}>
                    {isEditing ? (
                      <div className="flex-1 w-full">
                        <Input
                          value={editName}
                          autoFocus
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 w-full"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-row items-center gap-2 w-full">
                        <ListChecks className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 text-start">{s.name}</span>
                      </div>
                    )}

                    {isEditing ? (
                      <motion.div
                        className="flex gap-0.5 items-center"
                        {...fadeSlideUp}>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="mr-2"
                          onClick={handleSaveEdit}
                          isLoading={updateMutation.isPending}
                          disabled={!editName.trim()}
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
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(s.id);
                            setEditName(s.name);
                          }}
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
                              <AlertDialogTitle>
                                حذف دسته گزینه‌ها
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                آیا از حذف این دسته مطمئن هستید؟ این عملیات
                                غیرقابل بازگشت است.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(s.id)}
                                disabled={
                                  deleteMutation.isPending &&
                                  (deleteMutation as any).variables === s.id
                                }>
                                {deleteMutation.isPending &&
                                (deleteMutation as any).variables === s.id
                                  ? "در حال حذف..."
                                  : "حذف"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </AnimatePresence>
          <AnimatePresence>
            {!isLoading && !error && sets.length === 0 && (
              <motion.div
                key="empty"
                {...fade}
                className="p-4 text-center text-xs text-muted-foreground space-y-2">
                <p>هنوز هیچ دسته گزینه‌ای ایجاد نشده است.</p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCreating(true)}>
                  ایجاد اولین دسته
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!isLoading && error && (
              <motion.div
                key="error"
                {...fadeSlideUp}
                className="p-3 text-center text-xs text-destructive">
                خطا در بارگیری ست‌ها
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!selected && sets.length > 0 && (
          <div
            key="hint"
            className="border rounded-md p-4 text-[11px] text-muted-foreground text-center">
            یک دسته را از لیست بالا انتخاب کنید یا دسته جدید بسازید.
          </div>
        )}

        <AnimatePresence>
          {selected && (
            <motion.div
              key="selected"
              className="border rounded-md p-3 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">گزینه ها</h4>
                <Button
                  size="sm"
                  variant={editingOptions ? "secondary" : "outline"}
                  onClick={() => setEditingOptions((e) => !e)}
                  icon={
                    editingOptions ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Edit className="w-4 h-4" />
                    )
                  }>
                  {editingOptions ? "بستن" : "ویرایش"}
                </Button>
              </div>
              <AnimatePresence mode="popLayout">
                {!editingOptions && (
                  <motion.div
                    key="preview"
                    {...fadeSlideUp}
                    className="space-y-2 w-full">
                    {optionsQuery.isLoading && (
                      <p className="text-[11px] text-muted-foreground">
                        در حال بارگذاری...
                      </p>
                    )}
                    {!optionsQuery.isLoading && (
                      <>
                        {optionsQuery.data && optionsQuery.data.length > 0 && (
                          <ul className="text-xs space-y-1 max-h-44 overflow-auto">
                            {optionsQuery.data.map((op) => (
                              <li
                                key={op.id}
                                className="flex items-center gap-2">
                                <span className="text-muted-foreground w-5 text-[10px]">
                                  {op.order ?? "-"}
                                </span>
                                <span className="flex-1 truncate">
                                  {op.label}
                                </span>
                                <code className="px-1 bg-muted rounded text-[10px]">
                                  {op.value}
                                </code>
                              </li>
                            ))}
                          </ul>
                        )}
                        {optionsQuery.data &&
                          optionsQuery.data.length === 0 && (
                            <div className="text-[11px] text-muted-foreground space-y-2">
                              <p>
                                هنوز گزینه‌ای ثبت نشده است. برای افزودن روی
                                «ویرایش» کلیک کنید.
                              </p>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setEditingOptions(true)}>
                                افزودن اولین گزینه
                              </Button>
                            </div>
                          )}
                      </>
                    )}
                  </motion.div>
                )}
                {editingOptions && (
                  <motion.div key="editor" {...fadeSlideUp} className="w-full">
                    <OptionSetOptionsEditor
                      optionSetId={selected.id}
                      onSaved={() => setEditingOptions(false)}
                      className="bg-transparent dark:bg-transparent px-0 w-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </PanelContent>
    </Panel>
  );
};
