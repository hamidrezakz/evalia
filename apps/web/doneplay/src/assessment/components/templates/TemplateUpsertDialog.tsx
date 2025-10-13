"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, X } from "lucide-react";

export interface TemplateUpsertDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: { name: string; description?: string | null };
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    description?: string | null;
  }) => Promise<void> | void;
}

export function TemplateUpsertDialog({
  open,
  mode,
  initial,
  isSubmitting,
  onClose,
  onSubmit,
}: TemplateUpsertDialogProps) {
  const { register, handleSubmit, reset } = useForm<{
    name: string;
    description?: string | null;
  }>({
    defaultValues: {
      name: initial?.name || "",
      description: initial?.description || "",
    },
  });

  React.useEffect(() => {
    reset({
      name: initial?.name || "",
      description: initial?.description || "",
    });
  }, [initial, reset]);

  const submit = handleSubmit(async (vals) => {
    await onSubmit({ name: vals.name, description: vals.description || null });
  });

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "ایجاد تمپلیت جدید" : "ویرایش تمپلیت"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tpl-name">نام</Label>
            <Input
              id="tpl-name"
              {...register("name", { required: true })}
              className="pl-8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tpl-desc">توضیحات</Label>
            <Input
              id="tpl-desc"
              {...register("description")}
              className="pl-8"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 ms-1" /> انصراف
            </Button>
            <Button type="submit" disabled={!!isSubmitting}>
              <CheckCircle2 className="h-4 w-4 ms-1" /> ثبت
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TemplateUpsertDialog;
