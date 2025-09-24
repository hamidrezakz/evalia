"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";

export interface AddTeamDialogProps {
  orgId: number;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function AddTeamDialog({
  orgId,
  open,
  onOpenChange,
}: AddTeamDialogProps) {
  const qc = useQueryClient();
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const addTeamMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/organizations/${orgId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: desc }),
      });
      if (!res.ok) throw new Error("خطا در ایجاد تیم");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries();
      setName("");
      setDesc("");
      onOpenChange(false);
    },
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">
            ایجاد تیم جدید برای سازمان #{orgId}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-right">
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="team-name-input">
              نام تیم
            </Label>
            <Input
              id="team-name-input"
              placeholder="مثلاً تیم فروش"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="team-desc-input">
              توضیحات (اختیاری)
            </Label>
            <Input
              id="team-desc-input"
              placeholder="توضیح کوتاه"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          {addTeamMut.error && (
            <div className="text-[11px] text-rose-600">
              {(addTeamMut.error as any)?.message || "خطا"}
            </div>
          )}
        </div>
        <DialogFooter className="justify-start gap-2 pt-2">
          <Button
            size="sm"
            disabled={!name || addTeamMut.isPending}
            onClick={() => addTeamMut.mutate()}>
            {addTeamMut.isPending ? "در حال ثبت..." : "ایجاد"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={addTeamMut.isPending}>
            انصراف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddTeamDialog;
