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
  useOptionSets,
  useCreateOptionSet,
  useUpdateOptionSet,
  useDeleteOptionSet,
} from "../api/hooks";
import { OptionSetOptionsEditor } from "./option-set-options-editor";
import { useOptionSetOptions } from "../api/hooks";

interface OptionSetPanelProps {
  selectedOptionSetId?: number | null;
  onSelect?: (os: { id: number; name: string }) => void;
  className?: string;
}

export const OptionSetPanel: React.FC<OptionSetPanelProps> = ({
  selectedOptionSetId,
  onSelect,
  className,
}) => {
  const [search, setSearch] = React.useState("");
  const { data, isLoading, refetch } = useOptionSets({ search });
  const createMutation = useCreateOptionSet();
  const updateMutation = useUpdateOptionSet();
  const deleteMutation = useDeleteOptionSet();
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editingOptions, setEditingOptions] = React.useState(false);
  const selected =
    data?.data?.find((o) => o.id === selectedOptionSetId) || null;
  const optionsQuery = useOptionSetOptions(selected?.id ?? null);

  // Auto open editor if a set is selected but has zero options loaded
  React.useEffect(() => {
    if (selected && optionsQuery.data && optionsQuery.data.length === 0) {
      setEditingOptions(true);
    }
  }, [selected, optionsQuery.data]);
  // moved option editing logic to child editor

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
  // removed inline save function

  return (
    <Panel className={className}>
      <PanelHeader>
        <PanelTitle>ست های گزینه</PanelTitle>
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
          {!creating && (
            <Button size="sm" onClick={() => setCreating(true)}>
              ایجاد
            </Button>
          )}
        </div>
        {creating && (
          <div className="flex gap-2 items-center">
            <Input
              placeholder="نام ست"
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
            (data?.data || []).map((o) => (
              <div
                key={o.id}
                className={`flex items-center gap-2 px-3 py-2 text-sm ${
                  selectedOptionSetId === o.id ? "bg-primary/10" : ""
                }`}>
                <button
                  className="flex-1 text-start"
                  onClick={() => onSelect?.(o)}>
                  {editingId === o.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                    />
                  ) : (
                    o.name
                  )}
                </button>
                {editingId === o.id ? (
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
                      onClick={() => {
                        setEditingId(o.id);
                        setEditName(o.name);
                      }}>
                      ✎
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(o.id)}>
                      🗑
                    </Button>
                  </div>
                )}
              </div>
            ))}
          {!isLoading && (data?.data || []).length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              موردی یافت نشد
            </div>
          )}
        </div>
        {selected && (
          <div className="border rounded-md p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">گزینه ها</h4>
              <Button
                size="sm"
                variant={editingOptions ? "secondary" : "outline"}
                onClick={() => setEditingOptions((e) => !e)}>
                {editingOptions ? "بستن" : "ویرایش"}
              </Button>
            </div>
            {!editingOptions && (
              <div className="space-y-2">
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
                          <li key={op.id} className="flex items-center gap-2">
                            <span className="text-muted-foreground w-5 text-[10px]">
                              {op.order ?? "-"}
                            </span>
                            <span className="flex-1 truncate">{op.label}</span>
                            <code className="px-1 bg-muted rounded text-[10px]">
                              {op.value}
                            </code>
                          </li>
                        ))}
                      </ul>
                    )}
                    {optionsQuery.data && optionsQuery.data.length === 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        هنوز گزینه‌ای ثبت نشده است. روی «ویرایش» کلیک کنید تا
                        اولین گزینه را اضافه کنید.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
            {editingOptions && (
              <OptionSetOptionsEditor
                optionSetId={selected.id}
                onSaved={() => setEditingOptions(false)}
              />
            )}
          </div>
        )}
      </PanelContent>
    </Panel>
  );
};
