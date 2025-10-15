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

interface ConfirmDeleteQuestionDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => Promise<any> | void;
  loading?: boolean;
  questionText?: string;
}

export function ConfirmDeleteQuestionDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
  questionText,
}: ConfirmDeleteQuestionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>حذف سؤال</AlertDialogTitle>
          <AlertDialogDescription className="text-xs leading-relaxed">
            {questionText ? (
              <>
                آیا مطمئن هستید می‌خواهید این سؤال را حذف کنید؟
                <div className="mt-2 p-2 text-[11px] rounded bg-muted/50 border line-clamp-3">
                  {questionText}
                </div>
              </>
            ) : (
              <>آیا از حذف این سؤال اطمینان دارید؟</>
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

export default ConfirmDeleteQuestionDialog;
