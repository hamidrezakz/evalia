"use client";
import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "@/users/api/users.api";
import { usersKeys } from "@/users/api/users-query-keys";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface UsersRowActionsProps {
  canEdit?: boolean;
  canBlock?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onBlock?: () => void;
  onDelete?: () => void;
  userId?: number;
}

export function UsersRowActions({
  canEdit,
  canBlock,
  canDelete,
  onEdit,
  onBlock,
  onDelete,
  userId,
}: UsersRowActionsProps) {
  const qc = useQueryClient();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const delMut = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("no user id");
      await deleteUser(userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.all });
      setConfirmOpen(false);
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            aria-label="More"
            data-stop-row-click
            onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuLabel>اقدامات</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canEdit && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                const anyEvent = e as unknown as {
                  stopPropagation?: () => void;
                };
                if (typeof anyEvent.stopPropagation === "function")
                  anyEvent.stopPropagation();
                onEdit?.();
              }}>
              ویرایش
            </DropdownMenuItem>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-rose-600"
                onSelect={(e) => {
                  e.preventDefault();
                  const anyEvent = e as unknown as {
                    stopPropagation?: () => void;
                  };
                  if (typeof anyEvent.stopPropagation === "function")
                    anyEvent.stopPropagation();
                  onDelete?.();
                  setConfirmOpen(true);
                }}>
                حذف
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کاربر</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این کاربر مطمئن هستید؟ این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={delMut.isPending}>
              انصراف
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={(e) => {
                e.preventDefault();
                delMut.mutate();
              }}
              disabled={delMut.isPending}>
              {delMut.isPending ? "در حال حذف…" : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
