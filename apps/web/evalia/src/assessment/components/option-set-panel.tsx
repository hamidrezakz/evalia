"use client";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { fade, fadeSlideUp, growY, listItem } from "@/lib/motion/presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/ui/panel";
import {
  useOptionSets,
  useCreateOptionSet,
  useUpdateOptionSet,
  useDeleteOptionSet,
  useOptionSetOptions,
} from "../api/hooks";
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

  const { data, isLoading, refetch, error } = useOptionSets({ search });
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

  React.useEffect(() => {
    if (selected && optionsQuery.data && optionsQuery.data.length === 0)
      setEditingOptions(true);
  }, [selected, optionsQuery.data]);

  function selectSet(s: { id: number; name: string }) {
    if (selectedOptionSetId == null) setInternalSelectedId(s.id);
    onSelect?.(s);
    setEditingOptions(true); // Open options editor automatically
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
        <PanelTitle>ست های گزینه</PanelTitle>
      </PanelHeader>
      <PanelContent className="flex-col gap-4">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="جستجو..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}>
            جستجو
          </Button>
          {!creating && (
            <Button size="sm" onClick={() => setCreating(true)}>
              ایجاد ست
            </Button>
          )}
        </div>
        <AnimatePresence>
          {creating && (
            <motion.div {...growY} className="flex gap-2 items-center">
              <Input
                placeholder="نام ست"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleCreate}
                isLoading={createMutation.isPending}
                disabled={!newName.trim()}>
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
                    {...listItem}
                    className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      isSelected ? "bg-primary/10" : "hover:bg-muted/40"
                    }`}>
                    {isEditing ? (
                      <Input
                        value={editName}
                        autoFocus
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 flex-1"
                      />
                    ) : (
                      <button
                        className="flex-1 text-start"
                        onClick={() => selectSet(s)}
                        disabled={isEditing}>
                        {s.name}
                      </button>
                    )}
                    {isEditing ? (
                      <motion.div className="flex gap-1" {...fadeSlideUp}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleSaveEdit}
                          isLoading={updateMutation.isPending}
                          disabled={!editName.trim()}>
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
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(s.id);
                            setEditName(s.name);
                          }}>
                          ✎
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(s.id)}
                          isLoading={
                            deleteMutation.isPending &&
                            (deleteMutation as any).variables === s.id
                          }>
                          🗑
                        </Button>
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
                <p>هنوز ست گزینه‌ای ایجاد نشده است.</p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCreating(true)}>
                  ایجاد اولین ست
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
        <AnimatePresence>
          {!selected && sets.length > 0 && (
            <motion.div
              key="hint"
              {...fadeSlideUp}
              className="border rounded-md p-4 text-[11px] text-muted-foreground text-center">
              یک ست را از لیست بالا انتخاب کنید یا ست جدید بسازید.
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {selected && (
            <motion.div
              key="selected"
              {...fadeSlideUp}
              className="border rounded-md p-3 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">گزینه ها</h4>
                <Button
                  size="sm"
                  variant={editingOptions ? "secondary" : "outline"}
                  onClick={() => setEditingOptions((e) => !e)}>
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
