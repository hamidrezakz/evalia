"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tag, List, Type } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Panel, PanelContent } from "@/components/ui/panel";
import {
  useOptionSetOptions,
  useBulkReplaceOptionSetOptions,
} from "../../api/hooks";

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

  // Initialize / update draft from server data when not dirty.
  React.useEffect(() => {
    if (!dirty) {
      const arr = Array.isArray(data) ? data : data ? (data as any).data : [];
      if (arr && Array.isArray(arr)) {
        const next = arr.map((o: any) => ({
          id: o.id,
          value: o.value,
          label: o.label,
          order: o.order,
        }));
        setDraft(next.length ? next : [{ value: "", label: "", order: 0 }]);
      } else {
        setDraft([{ value: "", label: "", order: 0 }]);
      }
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
    const arr = Array.isArray(data) ? data : data ? (data as any).data : [];
    if (arr && Array.isArray(arr) && arr.length) {
      setDraft(
        arr.map((o: any) => ({
          id: o.id,
          value: o.value,
          label: o.label,
          order: o.order,
        }))
      );
    } else {
      setDraft([{ value: "", label: "", order: 0 }]);
    }
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

  // Remove filter/search feature
  const invalid = draft.some((d) => !d.value.trim() || !d.label.trim());

  return (
    <Panel className={className}>
      <PanelContent className="flex-col gap-2 bg-transparent px-0">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="ms-auto flex gap-2"></div>
        </div>
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        )}
        {!isLoading && (
          <div className="@container flex flex-col gap-2 max-h-160 overflow-auto">
            {draft.map((op, i) => (
              <div
                key={i}
                className="grid grid-cols-1 @xl:grid-cols-[minmax(60px,80px)_2fr_minmax(80px,120px)] items-center gap-2 border rounded-md p-2 bg-background/40">
                <div className="relative flex items-center">
                  <Tag className="absolute left-2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  <Input
                    value={op.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                    placeholder="label"
                    className="h-8 text-xs pl-8 flex-1"
                  />
                </div>
                <div className="relative flex items-center">
                  <Type className="absolute left-2 top-2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  <Textarea
                    value={op.value}
                    onChange={(e) => update(i, { value: e.target.value })}
                    placeholder="value"
                    className="min-h-8 text-xs pl-8 flex-1 resize-y"
                  />
                </div>

                {/* Order is now only shown as a number, changed by arrows */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-shrink-0 text-xs text-muted-foreground mr-0.5">
                    شماره گزینه:{" "}
                    {(typeof op.order === "number" ? op.order : 0) + 1}
                  </div>
                  <div className="flex items-center gap-0 justify-end">
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
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(i)}>
                      🗑
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-1 flex-row space-between mt-1">
              {" "}
              <div></div>
              <Button
                size="sm"
                onClick={save}
                disabled={!dirty || invalid}
                isLoading={bulkMutation.isPending}>
                ذخیره
              </Button>
              <Button size="sm" variant="outline" onClick={add}>
                افزودن
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={reset}
                disabled={!dirty}>
                ریست
              </Button>
            </div>
            {!draft.length && (
              <div className="text-center text-[11px] text-muted-foreground py-4">
                موردی یافت نشد
              </div>
            )}
          </div>
        )}
      </PanelContent>
    </Panel>
  );
};
