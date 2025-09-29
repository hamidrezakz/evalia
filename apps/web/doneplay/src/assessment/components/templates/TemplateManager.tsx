"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  MoreVertical,
  Copy,
  Lock,
  Archive,
  Pencil,
  PlayCircle,
} from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import TemplateCombobox from "./TemplateCombobox";
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
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Template | null>(null);
  const [dialogOpen, setDialogOpen] = useState<
    null | { mode: "create" } | { mode: "edit"; tpl: Template }
  >(null);

  const { data, isLoading } = useTemplates({ search });
  const createMut = useCreateTemplate();
  const updateMut = useUpdateTemplate();
  const deleteMut = useDeleteTemplate();

  const list: Template[] = (data as any)?.data || [];

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
      const created = await createMut.mutateAsync({
        name: vals.name,
        description: vals.description || undefined,
      });
      // Optimistically merge into current list cache (best-effort)
      try {
        qc.setQueriesData({ queryKey: ["templates", "list"] }, (old: any) => {
          if (!old || !Array.isArray(old?.data)) return old;
          // avoid duplicates
          if (old.data.some((t: Template) => t.id === created.id)) return old;
          return { ...old, data: [created, ...old.data] };
        });
      } catch {}
      // Auto-select the newly created template so sections panel updates immediately
      setSelected(created);
      onSelect?.(created);
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
          <PanelTitle className="text-sm flex items-center gap-2 font-semibold">
            قالب‌های آزمون
          </PanelTitle>
          <PanelAction>
            <Button
              size="sm"
              onClick={openCreate}
              isLoading={createMut.isPending}
              icon={<Plus className="h-4 w-4" />}
              iconPosition="left">
              جدید
            </Button>
          </PanelAction>
        </PanelHeader>
        <PanelContent className="flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Input
              placeholder="جستجو..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs"
            />
            <TemplateCombobox
              items={list}
              value={selected?.id ?? null}
              onChange={(tpl) => {
                setSelected(tpl);
                onSelect?.(tpl);
              }}
              disabled={isLoading}
              loading={isLoading}
              placeholder={isLoading ? "در حال بارگذاری..." : "انتخاب قالب"}
            />
            {selected && (
              <div className="flex items-center justify-end">
                <DropdownMenu dir="rtl">
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<MoreVertical className="h-4 w-4" />}
                      iconPosition="left">
                      اقدامات
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-52">
                    <DropdownMenuLabel>اقدامات</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => openEdit(selected)}>
                      <Edit2 className="h-4 w-4" /> ویرایش
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>تغییر وضعیت</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() =>
                        updateMut.mutate({
                          id: selected.id,
                          body: { state: "ACTIVE" },
                        })
                      }>
                      <PlayCircle className="h-4 w-4" /> فعال
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        updateMut.mutate({
                          id: selected.id,
                          body: { state: "DRAFT" },
                        })
                      }>
                      <Pencil className="h-4 w-4" /> پیش‌نویس
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        updateMut.mutate({
                          id: selected.id,
                          body: { state: "CLOSED" },
                        })
                      }>
                      <Lock className="h-4 w-4" /> بسته‌شده
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        updateMut.mutate({
                          id: selected.id,
                          body: { state: "ARCHIVED" },
                        })
                      }>
                      <Archive className="h-4 w-4" /> آرشیو
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        createMut.mutate(
                          {
                            name: `${selected.name} - کپی`,
                            description: selected.description ?? undefined,
                          },
                          {
                            onSuccess: (created) => {
                              try {
                                qc.setQueriesData(
                                  { queryKey: ["templates", "list"] },
                                  (old: any) => {
                                    if (!old || !Array.isArray(old?.data))
                                      return old;
                                    if (
                                      old.data.some(
                                        (t: Template) => t.id === created.id
                                      )
                                    )
                                      return old;
                                    return {
                                      ...old,
                                      data: [created, ...old.data],
                                    };
                                  }
                                );
                              } catch {}
                              setSelected(created);
                              onSelect?.(created);
                            },
                          }
                        )
                      }>
                      <Copy className="h-4 w-4" /> کپی از قالب
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => selected && onDelete(selected)}
                      disabled={deleteMut.isPending}>
                      <Trash2 className="h-4 w-4" /> حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
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
