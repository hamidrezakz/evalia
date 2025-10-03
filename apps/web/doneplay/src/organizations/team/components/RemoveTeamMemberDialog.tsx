"use client";
import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface RemoveTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => Promise<any> | void;
  loading?: boolean;
  memberName?: string;
}

export function RemoveTeamMemberDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
  memberName,
}: RemoveTeamMemberDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>حذف عضو از تیم</AlertDialogTitle>
          <AlertDialogDescription className="text-xs leading-relaxed">
            {memberName ? (
              <>
                آیا مطمئن هستید می‌خواهید{" "}
                <span className="font-medium">{memberName}</span> را از تیم حذف
                کنید؟
              </>
            ) : (
              <>آیا از حذف این عضو اطمینان دارید؟</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel className="text-xs">انصراف</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={loading}
              onClick={() => onConfirm()}
              className="text-xs">
              {loading ? "در حال حذف..." : "حذف"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default RemoveTeamMemberDialog;
