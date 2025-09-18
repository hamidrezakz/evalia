"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Search, Edit2, Trash2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelAction,
  PanelContent,
} from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "@/assessment/api/templates-hooks";
import type {
  Template,
  TemplateState,
} from "@/assessment/types/templates.types";

const stateLabels: Record<TemplateState, string> = {
  DRAFT: "پیش‌نویس",
  ACTIVE: "فعال",
  CLOSED: "بسته‌شده",
  ARCHIVED: "آرشیو",
};

export type TemplateManagerProps = {
  onSelect?: (t: Template | null) => void;
};

export default function TemplateManager({ onSelect }: TemplateManagerProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Template | null>(null);
  const [dialogOpen, setDialogOpen] = useState<
    null | { mode: "create" } | { mode: "edit"; tpl: Template }
  >(null);

  const { data, isLoading } = useTemplates({ search });
  const createMut = useCreateTemplate();
  const updateMut = useUpdateTemplate();
  const deleteMut = useDeleteTemplate();

  const list = data?.data || [];

  const { register, handleSubmit, reset } = useForm<{
    name: string;
    description?: string;
  }>();

  const openCreate = () => {
    reset({ name: "", description: "" });
    setDialogOpen({ mode: "create" });
  };
  const openEdit = (tpl: Template) => {
    reset({ name: tpl.name, description: tpl.description ?? "" });
    setDialogOpen({ mode: "edit", tpl });
  };

  const onSubmit = handleSubmit(async (vals) => {
    if (!dialogOpen) return;
    if (dialogOpen.mode === "create") {
      await createMut.mutateAsync({
        name: vals.name,
        description: vals.description || undefined,
      });
    } else {
      await updateMut.mutateAsync({
        id: dialogOpen.tpl.id,
        body: { name: vals.name, description: vals.description || null },
      });
    }
    setDialogOpen(null);
  });

  const onDelete = async (tpl: Template) => {
    await deleteMut.mutateAsync(tpl.id);
    if (selected?.id === tpl.id) {
      setSelected(null);
      onSelect?.(null);
    }
  };

  return (
    <>
      <Panel>
        <PanelHeader className="flex-row items-center justify-between gap-2">
          <PanelTitle className="text-base">تمپلیت‌ها</PanelTitle>
          <PanelAction>
            <Button
              size="sm"
              onClick={openCreate}
              disabled={createMut.isPending}>
              <Plus className="h-4 w-4 ms-1" /> جدید
            </Button>
          </PanelAction>
        </PanelHeader>
        <PanelContent className="flex-col gap-3">
          <div className="mb-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-8"
              />
            </div>
          </div>
          <div className="flex max-h-[480px] flex-col gap-2 overflow-y-auto pe-1">
            {isLoading && (
              <div className="text-sm text-muted-foreground">
                در حال بارگذاری...
              </div>
            )}
            {!isLoading && list.length === 0 && (
              <div className="text-sm text-muted-foreground">
                موردی یافت نشد
              </div>
            )}
            {list.map((tpl) => {
              const active = selected?.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  className={cn(
                    "group flex items-center justify-between gap-3 rounded-md border p-3 transition-colors",
                    active
                      ? "border-primary/50 bg-primary/5"
                      : "hover:bg-muted/40"
                  )}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(tpl);
                      onSelect?.(tpl);
                    }}
                    className="flex flex-1 flex-col items-start text-right">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{tpl.name}</div>
                      <Badge
                        variant={
                          tpl.state === "ACTIVE" ? "default" : "secondary"
                        }
                        className="text-[10px]">
                        {stateLabels[tpl.state]}
                      </Badge>
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {tpl.description}
                    </div>
                  </button>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(tpl)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(tpl)}
                      disabled={deleteMut.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </PanelContent>
      </Panel>

      {/* Create/Edit dialog */}
      <Dialog
        open={!!dialogOpen}
        onOpenChange={(o) => setDialogOpen(o ? dialogOpen : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogOpen?.mode === "create"
                ? "ایجاد تمپلیت جدید"
                : "ویرایش تمپلیت"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tpl-name">نام</Label>
              <Input id="tpl-name" {...register("name", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl-desc">توضیحات</Label>
              <Input id="tpl-desc" {...register("description")} />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(null)}>
                <X className="h-4 w-4 ms-1" /> انصراف
              </Button>
              <Button
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}>
                <CheckCircle2 className="h-4 w-4 ms-1" /> ثبت
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
