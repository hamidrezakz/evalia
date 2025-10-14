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
import { Users, PlusCircle, CheckCircle2, XCircle } from "lucide-react";
import UserSelectCombobox from "@/globalcomboxs/UserSelectCombobox";
import { ResponsePerspectiveEnum, type ResponsePerspective } from "@/lib/enums";
import { ResponsePerspectiveBadge } from "@/components/status-badges";
import { useAddAssignment } from "@/assessment/api/sessions-hooks";

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
  const addMut = useAddAssignment(organizationId);

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
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-primary">
            <PlusCircle className="h-5 w-5 text-primary" />
            افزودن اختصاص جدید
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
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
                  className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs cursor-pointer transition-all ${
                    perspective === p
                      ? "border-primary/60 bg-primary/5 shadow-sm"
                      : "hover:bg-muted/40"
                  }`}>
                  <Checkbox
                    checked={perspective === p}
                    onCheckedChange={() => setPerspective(p)}
                  />
                  <ResponsePerspectiveBadge value={p} size="sm" />
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
          <div className="flex justify-start gap-2 pt-2">
            <Button
              size="sm"
              onClick={submit}
              disabled={addMut.isPending || !userId || !sessionId}
              isLoading={addMut.isPending}
              icon={<CheckCircle2/>}>
              ثبت
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={addMut.isPending}
              icon={<XCircle />}>
              انصراف
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
