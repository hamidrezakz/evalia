"use client";
import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Copy,
  Link as LinkIcon,
  Pencil,
  Power,
  PauseCircle,
  RotateCcw,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export interface OrganizationRowActionsProps {
  canEdit?: boolean;
  canDelete?: boolean;
  canActivate?: boolean;
  canSuspend?: boolean;
  canRestore?: boolean;
  // New props for invite link
  organizationSlug?: string;
  organizationName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onActivate?: () => void;
  onSuspend?: () => void;
  onRestore?: () => void;
}

export function OrganizationRowActions({
  canEdit,
  canDelete,
  canActivate,
  canSuspend,
  canRestore,
  onEdit,
  onDelete,
  onActivate,
  onSuspend,
  onRestore,
  organizationSlug,
  organizationName,
}: OrganizationRowActionsProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  function buildInviteUrl(slug?: string) {
    if (!slug) return "";
    const base = (
      process.env.NEXT_PUBLIC_APP_BASE ||
      (typeof window !== "undefined" ? window.location.origin : "")
    ).replace(/\/$/, "");
    return `${base}/auth/${slug}`;
  }

  async function copyInvite(slug?: string) {
    const url = buildInviteUrl(slug);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("لینک دعوت سازمان کپی شد");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        toast.success("لینک دعوت سازمان کپی شد");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        toast.error("کپی لینک با خطا مواجه شد");
      }
    }
  }
  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="More">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="min-w-44 mr-2"
          sideOffset={4}>
          <div className="px-2 pt-1 pb-1.5 text-[11px] font-medium text-muted-foreground select-none">
            عملیات سازمان
          </div>
          <DropdownMenuSeparator />
          {organizationSlug && (
            <>
              <DropdownMenuItem
                className="gap-2 text-[12px]"
                onClick={() => setInviteOpen(true)}>
                <LinkIcon className="h-3.5 w-3.5" />
                نمایش لینک دعوت
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {canEdit && (
            <DropdownMenuItem className="gap-2 text-[12px]" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" /> ویرایش سازمان
            </DropdownMenuItem>
          )}
          {canActivate && (
            <DropdownMenuItem
              className="gap-2 text-[12px]"
              onClick={onActivate}>
              <Power className="h-3.5 w-3.5" /> فعال‌سازی
            </DropdownMenuItem>
          )}
          {canSuspend && (
            <DropdownMenuItem className="gap-2 text-[12px]" onClick={onSuspend}>
              <PauseCircle className="h-3.5 w-3.5" /> تعلیق
            </DropdownMenuItem>
          )}
          {canRestore && (
            <DropdownMenuItem className="gap-2 text-[12px]" onClick={onRestore}>
              <RotateCcw className="h-3.5 w-3.5" /> بازگردانی
            </DropdownMenuItem>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-[12px] text-rose-600"
                onSelect={() => {
                  setConfirmDeleteOpen(true);
                }}>
                <Trash2 className="h-3.5 w-3.5" /> حذف سازمان
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Invite link dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <LinkIcon className="h-4 w-4" /> لینک دعوت به سازمان
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {organizationName && (
              <div className="text-[11px] text-muted-foreground">
                سازمان: <span className="font-medium">{organizationName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={buildInviteUrl(organizationSlug)}
                className="ltr:font-mono text-[12px] select-all"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyInvite(organizationSlug)}
                disabled={copied}
                className="shrink-0 inline-flex items-center gap-1 text-[11px]">
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> کپی شد
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> کپی
                  </>
                )}
              </Button>
            </div>
            <p className="text-[11px] leading-5 text-muted-foreground">
              این لینک برای دعوت افراد به سازمان شماست. آن را فقط با افراد مورد
              اعتماد به اشتراک بگذارید. گیرنده با کلیک روی این لینک به صفحه
              ورود/ثبت‌نام هدایت شده و پس از احراز هویت به سازمان شما متصل خواهد
              شد.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف سازمان؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عملیات غیرقابل بازگشت است. با حذف سازمان، اطلاعات و دسترسی‌های
              مربوطه هم حذف می‌شود. مطمئن هستید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                setConfirmDeleteOpen(false);
                onDelete?.();
              }}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
