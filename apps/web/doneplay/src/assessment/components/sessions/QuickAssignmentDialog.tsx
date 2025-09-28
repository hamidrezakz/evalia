"use client";
/** QuickAssignmentDialog
 * دیالوگ سریع برای افزودن یک اختصاص (Assignment) تکی به جلسه
 * ورودی ها: sessionId (الزامی)، organizationId (برای فیلتر کاربران)
 * فیلدها: کاربر پاسخ دهنده (respondent/self) ، پرسپکتیو ، در صورت نیاز سوژه
 */
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users } from "lucide-react";
import UserSelectCombobox from "@/users/components/UserSelectCombobox";
import { ResponsePerspectiveEnum, type ResponsePerspective } from "@/lib/enums";
import { useAddAssignment } from "@/assessment/api/templates-hooks";

interface QuickAssignmentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sessionId: number | null;
  organizationId: number | null;
  onSuccess?: () => void;
}

export default function QuickAssignmentDialog({
  open,
  onOpenChange,
  sessionId,
  organizationId,
  onSuccess,
}: QuickAssignmentDialogProps) {
  const perspectives = React.useMemo(
    () => ResponsePerspectiveEnum.values as ResponsePerspective[],
    []
  );
  const [perspective, setPerspective] =
    React.useState<ResponsePerspective>("SELF");
  const [userId, setUserId] = React.useState<number | null>(null); // respondent
  const [subjectUserId, setSubjectUserId] = React.useState<number | null>(null);
  const addMut = useAddAssignment();

  // Reset when closed
  React.useEffect(() => {
    if (!open) {
      setUserId(null);
      setSubjectUserId(null);
      setPerspective("SELF");
    }
  }, [open]);

  // Central user selector handles its own debounced remote search

  async function submit() {
    if (!sessionId || !userId) return;
    const isSelf = perspective === "SELF";
    const respondentUserId = userId;
    const subj = isSelf ? userId : subjectUserId || userId;
    await addMut.mutateAsync({
      sessionId,
      // legacy mapping
      userId: respondentUserId,
      respondentUserId,
      subjectUserId: subj,
      perspective,
    } as any);
    onSuccess?.();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-base">افزودن اختصاص جدید</DialogTitle>
          <DialogDescription className="text-xs">
            یک کاربر را انتخاب و در صورت نیاز پرسپکتیو و سوژه را تعیین کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <div className="space-y-2">
            <Label>کاربر پاسخ‌دهنده</Label>
            <UserSelectCombobox
              value={userId}
              onChange={(id) => setUserId(id)}
              orgId={organizationId ?? (undefined as any)}
              disabled={!organizationId}
              placeholder={
                organizationId ? "انتخاب/جستجوی کاربر" : "ابتدا سازمان"
              }
            />
          </div>
          <div className="space-y-2">
            <Label>پرسپکتیو</Label>
            <div className="flex flex-wrap gap-2">
              {perspectives.map((p) => (
                <label
                  key={p}
                  className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs cursor-pointer ${
                    perspective === p
                      ? "border-primary/60 bg-primary/5"
                      : "hover:bg-muted/40"
                  }`}>
                  <Checkbox
                    checked={perspective === p}
                    onCheckedChange={() => setPerspective(p)}
                  />
                  <span>{ResponsePerspectiveEnum.t(p)}</span>
                </label>
              ))}
            </div>
          </div>
          {perspective !== "SELF" && (
            <div className="space-y-2">
              <Label>سوژه (کاربر هدف)</Label>
              <UserSelectCombobox
                value={subjectUserId}
                onChange={(id) => setSubjectUserId(id)}
                orgId={organizationId ?? (undefined as any)}
                disabled={!organizationId}
                placeholder={
                  organizationId ? "انتخاب/جستجوی کاربر" : "ابتدا سازمان"
                }
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={addMut.isPending}>
              انصراف
            </Button>
            <Button
              size="sm"
              onClick={submit}
              disabled={addMut.isPending || !userId || !sessionId}
              isLoading={addMut.isPending}>
              ثبت
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
