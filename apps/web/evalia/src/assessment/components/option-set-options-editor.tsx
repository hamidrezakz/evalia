"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOptionSetOptions,
  useBulkReplaceOptionSetOptions,
} from "../api/hooks";

interface OptionSetOptionsEditorProps {
  optionSetId: number;
  onSaved?: () => void;
  className?: string;
}
type DraftItem = { id?: number; value: string; label: string; order?: number };

export const OptionSetOptionsEditor: React.FC<OptionSetOptionsEditorProps> = ({
  optionSetId,
  onSaved,
  className,
}) => {
  const { data, isLoading } = useOptionSetOptions(optionSetId);
  const bulkMutation = useBulkReplaceOptionSetOptions();
  const [draft, setDraft] = React.useState<DraftItem[]>([]);
  const [dirty, setDirty] = React.useState(false);
  const [filter, setFilter] = React.useState("");
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    if (data && !dirty) {
      setDraft(
        data.map((o) => ({
          id: o.id,
          value: o.value,
          label: o.label,
          order: o.order,
        }))
      );
    }
  }, [data, dirty]);
  function mark(fn: (prev: DraftItem[]) => DraftItem[]) {
    setDraft((d) => {
      const next = fn(d);
      return next;
    });
    setDirty(true);
  }
  function add() {
    mark((d) => [...d, { value: "", label: "", order: d.length }]);
  }
  function remove(i: number) {
    mark((d) =>
      d.filter((_, idx) => idx !== i).map((it, idx) => ({ ...it, order: idx }))
    );
  }
  function move(i: number, dir: -1 | 1) {
    mark((d) => {
      const arr = [...d];
      const ni = i + dir;
      if (ni < 0 || ni >= arr.length) return arr;
      const tmp = arr[i];
      arr[i] = arr[ni];
      arr[ni] = tmp;
      return arr.map((it, idx) => ({ ...it, order: idx }));
    });
  }
  function update(i: number, patch: Partial<DraftItem>) {
    mark((d) => d.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function reset() {
    setDirty(false);
    if (data)
      setDraft(
        data.map((o) => ({
          id: o.id,
          value: o.value,
          label: o.label,
          order: o.order,
        }))
      );
  }
  function save() {
    bulkMutation.mutate(
      {
        optionSetId,
        body: {
          options: draft.map(({ value, label, order }) => ({
            value,
            label,
            order,
          })),
        },
      },
      {
        onSuccess: () => {
          setDirty(false);
          onSaved?.();
        },
      }
    );
  }

  const filtered = draft.filter(
    (d) => !filter || d.label.includes(filter) || d.value.includes(filter)
  );
  const invalid = draft.some((d) => !d.value.trim() || !d.label.trim());

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <Input
          placeholder="فیلتر"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 w-40"
        />
        <Button size="sm" variant="secondary" onClick={add}>
          افزودن
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCompact((c) => !c)}>
          {compact ? "نمای کامل" : "نمای فشرده"}
        </Button>
        <div className="ms-auto flex gap-2">
          <Button
            size="sm"
            onClick={save}
            disabled={!dirty || invalid}
            isLoading={bulkMutation.isPending}>
            ذخیره
          </Button>
          <Button size="sm" variant="ghost" onClick={reset} disabled={!dirty}>
            ریست
          </Button>
        </div>
      </div>
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
      )}
      {!isLoading && (
        <div className="flex flex-col gap-2 max-h-80 overflow-auto pe-1">
          {filtered.map((op, i) => (
            <div
              key={i}
              className={`grid ${
                compact
                  ? "grid-cols-[32px_1fr_1fr_110px]"
                  : "grid-cols-[32px_1fr_1fr_90px_90px]"
              } items-center gap-2 border rounded-md p-2 bg-background/40`}>
              <span className="text-[10px] text-muted-foreground w-6 text-center">
                {op.order}
              </span>
              <Input
                value={op.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="label"
                className="h-8 text-xs"
              />
              <Input
                value={op.value}
                onChange={(e) => update(i, { value: e.target.value })}
                placeholder="value"
                className="h-8 text-xs"
              />
              {!compact && (
                <Input
                  value={op.order?.toString() || ""}
                  onChange={(e) =>
                    update(i, {
                      order: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="order"
                  className="h-8 text-xs"
                />
              )}
              <div className="flex items-center gap-1 justify-end">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}>
                  ↑
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => move(i, 1)}
                  disabled={i === draft.length - 1}>
                  ↓
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(i)}>
                  🗑
                </Button>
              </div>
            </div>
          ))}
          {!filtered.length && (
            <div className="text-center text-[11px] text-muted-foreground py-4">
              موردی یافت نشد
            </div>
          )}
        </div>
      )}
      {invalid && (
        <p className="text-[10px] text-destructive mt-2">
          همه گزینه ها باید label و value داشته باشند.
        </p>
      )}
    </div>
  );
};
