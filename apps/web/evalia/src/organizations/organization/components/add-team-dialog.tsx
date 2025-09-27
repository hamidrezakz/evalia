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
import { useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { useCreateTeam } from "@/organizations/team/api/team-hooks";
import { orgKeys } from "@/organizations/organization/api/organization-query-keys";

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
  const createTeam = useCreateTeam(orgId);

  function handleCreate() {
    if (!name) return;
    createTeam.mutate(
      { name, description: desc || undefined },
      {
        onSuccess: () => {
          // Invalidate specific organization detail to refresh embedded teams array
          qc.invalidateQueries({ queryKey: orgKeys.byId(orgId) });
          setName("");
          setDesc("");
          onOpenChange(false);
        },
      }
    );
  }
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
          {createTeam.error &&
            (() => {
              const err: unknown = createTeam.error;
              let msg = "خطا";
              if (err && typeof err === "object") {
                const maybeError = err as { message?: unknown };
                if (
                  typeof maybeError.message === "string" &&
                  maybeError.message.trim()
                ) {
                  msg = maybeError.message;
                }
              }
              return <div className="text-[11px] text-rose-600">{msg}</div>;
            })()}
        </div>
        <DialogFooter className="justify-start gap-2 pt-2">
          <Button
            size="sm"
            disabled={!name || createTeam.isPending}
            onClick={handleCreate}>
            {createTeam.isPending ? "در حال ثبت..." : "ایجاد"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={createTeam.isPending}>
            انصراف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddTeamDialog;
