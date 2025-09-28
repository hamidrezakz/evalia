"use client";
import * as React from "react";
import {
  useOrganization,
  useUpdateOrganization,
} from "../api/organization-hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditOrganizationNameDialogProps {
  orgId: number | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export default function EditOrganizationNameDialog({
  orgId,
  open,
  onOpenChange,
}: EditOrganizationNameDialogProps) {
  const { data } = useOrganization(orgId, open);
  const updateMut = useUpdateOrganization(orgId || 0);
  const [name, setName] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  React.useEffect(() => {
    if (open && data?.name) {
      setName(data.name);
      setTouched(false);
    }
    if (!open) {
      setName("");
      setTouched(false);
    }
  }, [open, data?.name]);

  function handleSave() {
    if (!orgId) return;
    if (!name.trim() || name.trim() === data?.name) return;
    updateMut.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  }

  const dirty = touched && name.trim() !== data?.name;
  const invalid = !name.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">ویرایش نام سازمان</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-medium">نام سازمان</label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!touched) setTouched(true);
              }}
              placeholder="نام جدید سازمان"
            />
            {invalid && touched && (
              <p className="text-[10px] text-rose-600">
                نام نمیfتواند خالی باشد
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="justify-start gap-2 pt-2">
          <Button
            size="sm"
            disabled={invalid || !dirty || updateMut.isPending}
            onClick={handleSave}>
            {updateMut.isPending ? "در حال ذخیره..." : "ذخیره"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={updateMut.isPending}>
            انصراف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
