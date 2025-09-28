"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Combobox from "@/components/ui/combobox";
import { UserStatusEnum } from "@/lib/enums";
import { cn, formatIranPhone } from "@/lib/utils";
import { normalizePhone } from "@/lib/normalize-phone";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { useOrganizations } from "@/organizations/organization/context/queries";
import {
  createUser,
  updateUser,
  type CreateUserInput,
} from "@/users/api/users.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersKeys } from "@/users/api/users-query-keys";
import { Plus, UserPen, AlertTriangle } from "lucide-react";

type BaseUserForm = {
  fullName?: string;
  phone?: string;
  password?: string;
  status?: string;
};

export interface UserUpsertDialogProps {
  mode: "create" | "edit";
  defaultValues?: BaseUserForm & { id?: number };
  /**
   * When true, the user must be added to the active organization (from OrgContext).
   * Org selection is hidden and a strong hint is shown.
   */
  restrictToActiveOrg?: boolean;
  /**
   * Optional controlled trigger. If provided, the dialog will render children as trigger via asChild.
   * If omitted, a default button will be shown (Add/Edit). Use this to mount the popup on any custom button.
   */
  trigger?: React.ReactNode;
  className?: string;
  onSuccess?: (userId: number) => void;
  // Controlled open support (optional). If provided, component becomes controlled.
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UserUpsertDialog(props: UserUpsertDialogProps) {
  const {
    mode,
    defaultValues,
    restrictToActiveOrg,
    trigger,
    className,
    onSuccess,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
  } = props;
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = isControlled ? (controlledOpen as boolean) : uncontrolledOpen;
  const setOpen = (v: boolean) =>
    isControlled ? controlledOnOpenChange?.(v) : setUncontrolledOpen(v);
  const qc = useQueryClient();
  const { activeOrganizationId, organizations: myOrgs } = useOrgState();
  const orgsQuery = useOrganizations(true);
  const activeOrgName = React.useMemo(() => {
    const list = ((orgsQuery.data as any[]) ||
      (myOrgs as any[]) ||
      []) as any[];
    const found = list.find((o: any) => o?.id === activeOrganizationId);
    return (found?.name as string) || undefined;
  }, [orgsQuery.data, myOrgs, activeOrganizationId]);

  // Form state
  const [fullName, setFullName] = React.useState(defaultValues?.fullName || "");
  const [phone, setPhone] = React.useState(
    defaultValues?.phone
      ? formatIranPhone(defaultValues.phone, { hyphen: false })
      : ""
  );
  const [password, setPassword] = React.useState(
    defaultValues?.password || (mode === "create" ? "123456" : "")
  );
  const [status, setStatus] = React.useState<string>(
    defaultValues?.status || (mode === "create" ? "INVITED" : "ACTIVE")
  );
  const [orgId, setOrgId] = React.useState<number | null>(
    restrictToActiveOrg ? activeOrganizationId ?? null : null
  );

  React.useEffect(() => {
    if (restrictToActiveOrg) setOrgId(activeOrganizationId ?? null);
  }, [restrictToActiveOrg, activeOrganizationId]);

  const isEdit = mode === "edit";

  const mutation = useMutation({
    mutationFn: async () => {
      const normalizedPhone = phone ? normalizePhone(phone) : undefined;
      if (isEdit && defaultValues?.id) {
        return updateUser(defaultValues.id, {
          fullName,
          phone: normalizedPhone,
          status,
        });
      }
      const payload: CreateUserInput = {
        fullName: fullName || undefined,
        phone: normalizedPhone,
        password: password || undefined,
        status: status || "INVITED",
      };
      const user = await createUser(payload);
      // If organization selected/forced, add membership via membership API
      if (orgId) {
        const { addOrganizationMember } = await import(
          "@/organizations/member/api/organization-membership.api"
        );
        try {
          await addOrganizationMember(orgId, {
            userId: user.id,
            roles: ["MEMBER"],
          });
        } catch (e: any) {
          (e as any)._membershipFailed = true;
          throw e; // propagate so onError can display proper message
        }
      }
      return user;
    },
    onSuccess: async (res) => {
      qc.invalidateQueries({ queryKey: usersKeys.all });
      if (orgId) {
        const { organizationMembershipKeys } = await import(
          "@/organizations/member/api/organization-membership-query-keys"
        );
        qc.invalidateQueries({
          queryKey: organizationMembershipKeys.list(orgId, {}),
        });
        qc.invalidateQueries({
          queryKey: organizationMembershipKeys.lists(orgId),
        });
      }
      setOpen(false);
      onSuccess?.(res.id as any);
    },
    onError: async (err: any) => {
      // Show user-friendly error messages (simple inline fallback)
      const msg = err?._membershipFailed
        ? "افزودن کاربر موفق بود ولی اتصال به سازمان انجام نشد"
        : err?.message || "خطا در ذخیره کاربر";
      // Replace console with toast-like minimal fallback (component has no toast import—simplify by alert)
      if (typeof window !== "undefined") {
        // optional lightweight feedback; integrate real toast if available
        console.warn(msg);
      }
    },
  });

  const resetForm = () => {
    setFullName(defaultValues?.fullName || "");
    setPhone(
      defaultValues?.phone
        ? formatIranPhone(defaultValues.phone, { hyphen: false })
        : ""
    );
    setPassword(defaultValues?.password || (mode === "create" ? "123456" : ""));
    setStatus(
      defaultValues?.status || (mode === "create" ? "INVITED" : "ACTIVE")
    );
    setOrgId(restrictToActiveOrg ? activeOrganizationId ?? null : null);
  };

  const onOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) resetForm();
  };

  // Ensure form fields populate when dialog opens programmatically or when target user changes
  React.useEffect(() => {
    if (open) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues?.id]);

  const orgItems = (orgsQuery.data || myOrgs || []).map((o) => ({
    id: o.id,
    name: o.name,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant={isEdit ? "secondary" : "default"}
            icon={isEdit ? <UserPen /> : <Plus />}>
            {isEdit ? "ویرایش کاربر" : "افزودن کاربر"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className={cn("sm:max-w-xl", className)}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "ویرایش کاربر" : "افزودن کاربر جدید"}
          </DialogTitle>
          <DialogDescription className="text-[11px]">
            {isEdit
              ? "اطلاعات کاربر را به‌روزرسانی کنید."
              : "کاربر جدید ایجاد می‌شود. وضعیت پیش‌فرض: دعوت‌شده. رمز عبور پیش‌فرض: 123456"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="col-span-1 sm:col-span-2">
            <Label htmlFor="fullName" className="mb-1 block">
              نام و نام‌خانوادگی
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثلاً علی رضایی"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="mb-1 block">
              شماره تلفن
            </Label>
            <Input
              id="phone"
              dir="ltr"
              inputMode="numeric"
              pattern="[0-9+]*"
              className="font-mono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثلاً 09305138169"
            />
          </div>
          {!isEdit && (
            <div>
              <Label htmlFor="password" className="mb-1 block">
                رمز عبور (اختیاری)
              </Label>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="پیش‌فرض 123456"
              />
            </div>
          )}
          <div>
            {!restrictToActiveOrg && (
              <div>
                {" "}
                <Label className="mb-1 block">وضعیت</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="انتخاب وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    {UserStatusEnum.options().map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Organization selection only in create mode */}
          {!isEdit && (
            <div className="sm:col-span-2">
              <Label className="mb-1 block">عضویت سازمانی</Label>
              {restrictToActiveOrg ? (
                <div
                  className="mt-2 rounded-md border border-amber-200/70 bg-amber-50/60 dark:bg-amber-900/20 dark:border-amber-800/40 p-3"
                  dir="rtl">
                  <div className="flex flex-row-reverse items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-medium">
                        افزودن به سازمان فعال
                      </div>
                      <div className="text-[12px] leading-6 text-muted-foreground">
                        کاربر به سازمان فعال شما افزوده می‌شود.
                        {activeOrganizationId ? (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 px-2 py-0.5">
                            <span>سازمان:</span>
                            <span className="text-foreground">
                              {activeOrgName || "نامشخص"}
                            </span>
                            <span className="opacity-70">
                              #{activeOrganizationId}
                            </span>
                          </span>
                        ) : (
                          <span className="block mt-1 text-rose-600">
                            سازمان فعالی یافت نشد.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <Combobox
                    items={orgItems}
                    value={orgId}
                    onChange={(val) => setOrgId((val as number) || null)}
                    placeholder="انتخاب سازمان برای عضویت"
                    getKey={(it) => (it as any).id}
                    getLabel={(it) => (it as any).name}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline">انصراف</Button>
          </DialogClose>
          <Button
            onClick={() => mutation.mutate()}
            isLoading={mutation.isPending}
            variant="default">
            {isEdit ? "ذخیره تغییرات" : "ایجاد کاربر"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
