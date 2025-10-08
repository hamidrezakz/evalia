"use client";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  X,
  LayoutList,
  PlayCircle,
  Pencil,
  Lock,
  Archive,
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
import { Separator } from "@/components/ui/separator";
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
// import { cn } from "@/lib/utils";
import {
  useTemplateSections,
  useCreateTemplateSection,
  useUpdateTemplateSection,
  useReorderTemplateSections,
  useDeleteTemplateSection,
  useUpdateTemplate,
} from "@/assessment/api/templates-hooks";
import { useOrgState } from "@/organizations/organization/context/org-context";
import type {
  Template,
  TemplateSection,
  TemplateState,
} from "@/assessment/types/templates.types";

const stateLabels: Record<TemplateState, string> = {
  DRAFT: "پیش‌نویس",
  ACTIVE: "فعال",
  CLOSED: "بسته‌شده",
  ARCHIVED: "آرشیو",
};

export type TemplateSectionsPanelProps = {
  template: Template | null;
};

export default function TemplateSectionsPanel({
  template,
}: TemplateSectionsPanelProps) {
  const templateId = template?.id ?? null;
  const { activeOrganizationId } = useOrgState();
  const { data: sections, isLoading } = useTemplateSections(
    activeOrganizationId,
    templateId
  );

  const createMut = useCreateTemplateSection(activeOrganizationId);
  const updateMut = useUpdateTemplateSection(activeOrganizationId);
  const reorderMut = useReorderTemplateSections(activeOrganizationId);
  const deleteMut = useDeleteTemplateSection(activeOrganizationId);
  const updateTemplateMut = useUpdateTemplate(activeOrganizationId);

  const [dialogOpen, setDialogOpen] = useState<
    null | { mode: "create" } | { mode: "edit"; id: number; title: string }
  >(null);
  const { register, handleSubmit, reset } = useForm<{ title: string }>();

  const ordered: TemplateSection[] = useMemo(() => {
    const raw: any = sections as any;
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : [];
    return (list as TemplateSection[])
      .slice()
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [sections]);

  const openCreate = () => {
    reset({ title: "" });
    setDialogOpen({ mode: "create" });
  };
  const openEdit = (sec: { id: number; title: string }) => {
    reset({ title: sec.title });
    setDialogOpen({ mode: "edit", id: sec.id, title: sec.title });
  };

  const onSubmit = handleSubmit(async (vals) => {
    if (!templateId) return;
    if (!dialogOpen) return;
    if (dialogOpen.mode === "create") {
      await createMut.mutateAsync({ templateId, title: vals.title });
    } else {
      await updateMut.mutateAsync({
        id: dialogOpen.id,
        body: { title: vals.title },
      });
    }
    setDialogOpen(null);
  });

  const move = async (fromIndex: number, direction: -1 | 1) => {
    if (!templateId) return;
    const newOrder = ordered.slice();
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= newOrder.length) return;
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    await reorderMut.mutateAsync({
      templateId,
      body: { sectionIds: newOrder.map((s: TemplateSection) => s.id) },
    });
  };

  const onDelete = async (id: number) => {
    await deleteMut.mutateAsync(id);
  };

  return (
    <Panel>
      <PanelHeader className="flex-row items-center justify-between">
        <PanelTitle className="text-sm flex items-center gap-2 font-semibold tracking-tight">
          <LayoutList className="h-4 w-4 text-muted-foreground" />
          بخش‌های قالب (سکشن‌ها)
        </PanelTitle>
        <PanelAction>
          {templateId && (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild></DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-48">
                <DropdownMenuLabel>وضعیت قالب</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    template &&
                    updateTemplateMut.mutate({
                      id: template.id,
                      body: { state: "ACTIVE" },
                    })
                  }>
                  <PlayCircle className="h-4 w-4" /> فعال
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    template &&
                    updateTemplateMut.mutate({
                      id: template.id,
                      body: { state: "DRAFT" },
                    })
                  }>
                  <Pencil className="h-4 w-4" /> پیش‌نویس
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    template &&
                    updateTemplateMut.mutate({
                      id: template.id,
                      body: { state: "CLOSED" },
                    })
                  }>
                  <Lock className="h-4 w-4" /> بسته‌شده
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    template &&
                    updateTemplateMut.mutate({
                      id: template.id,
                      body: { state: "ARCHIVED" },
                    })
                  }>
                  <Archive className="h-4 w-4" /> آرشیو
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>اقدامات</DropdownMenuLabel>
                <DropdownMenuItem onClick={openCreate}>
                  <Plus className="h-4 w-4" /> افزودن سکشن جدید
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            size="sm"
            onClick={openCreate}
            disabled={!templateId || createMut.isPending}>
            <Plus className="h-4 w-4 ms-1" /> جدید
          </Button>
        </PanelAction>
      </PanelHeader>
      <PanelContent className="flex-col gap-3 w-full text-xs">
        {!templateId && (
          <div className="text-xs text-muted-foreground">
            ابتدا یک تمپلیت انتخاب کنید.
          </div>
        )}
        {templateId && (
          <div className="space-y-3 w-full">
            {isLoading && (
              <div className="text-xs text-muted-foreground">
                در حال بارگذاری...
              </div>
            )}
            {!isLoading && ordered.length === 0 && (
              <div className="text-xs text-muted-foreground">
                سکشنی یافت نشد
              </div>
            )}
            <div className="flex flex-col gap-2 w-full">
              {ordered.map((sec: TemplateSection, idx: number) => (
                <div
                  key={sec.id}
                  className="group flex items-center justify-between gap-3 rounded-md border p-2 hover:bg-muted/40 transition-colors">
                  <div className="flex flex-col text-right leading-tight">
                    <div
                      className="text-xs font-medium line-clamp-1"
                      title={sec.title}>
                      {sec.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      ترتیب: {sec.order}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0 || reorderMut.isPending}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => move(idx, 1)}
                      disabled={
                        idx === ordered.length - 1 || reorderMut.isPending
                      }>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(sec)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(sec.id)}
                      disabled={deleteMut.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PanelContent>

      <Dialog
        open={!!dialogOpen}
        onOpenChange={(o) => setDialogOpen(o ? dialogOpen : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">
              {dialogOpen?.mode === "create" ? "ایجاد سکشن" : "ویرایش سکشن"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3 text-xs" dir="rtl">
            <div className="space-y-1.5">
              <Label htmlFor="sec-title" className="text-[11px] font-medium">
                عنوان سکشن
              </Label>
              <Input
                id="sec-title"
                {...register("title", { required: true })}
                className="h-8 text-xs"
              />
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
    </Panel>
  );
}
