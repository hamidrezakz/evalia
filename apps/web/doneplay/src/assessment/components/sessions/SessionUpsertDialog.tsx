"use client";
import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox"; // retained for template selection only
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText,
  Users,
  CheckCircle2,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import {
  useOrganization,
  useOrganizations,
} from "@/organizations/organization/api/organization-hooks";
import OrgSelectCombobox from "@/organizations/organization/components/OrgSelectCombobox";
import TeamSelectCombobox from "@/organizations/team/components/TeamSelectCombobox";
import {
  useTemplate,
  useTemplates,
  useCreateSession,
  useUpdateSession,
  useSession,
} from "@/assessment/api/templates-hooks";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { useTeams } from "@/organizations/team/api/team-hooks";
import { JalaliDatePicker } from "@/components/date/JalaliDateComponents";

type FormVals = {
  organizationId: number | null;
  templateId: number | null;
  name: string;
  description?: string;
  startAt: string; // ISO
  endAt: string; // ISO
  teamScopeId?: number | null;
};

const nowISO = () => new Date().toISOString();
const plusDaysISO = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString();

export function SessionUpsertDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sessionId?: number | null;
  defaultOrganizationId?: number | null;
  trigger?: React.ReactNode;
  onSuccess?: (id: number) => void;
  initialSession?: any;
}) {
  const {
    open,
    onOpenChange,
    sessionId,
    defaultOrganizationId,
    trigger,
    onSuccess,
    initialSession,
  } = props;
  const isEdit = !!sessionId;
  const { data: sessionData } = useSession(isEdit ? sessionId! : null);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormVals>({
    defaultValues: {
      organizationId: defaultOrganizationId ?? null,
      templateId: null,
      name: "",
      description: "",
      startAt: nowISO(),
      endAt: plusDaysISO(7),
      teamScopeId: null,
    },
  });

  useEffect(() => {
    if (isEdit && initialSession) {
      reset({
        organizationId: initialSession.organizationId ?? null,
        templateId: initialSession.templateId ?? null,
        name: initialSession.name,
        description: initialSession.description || "",
        startAt: initialSession.startAt,
        endAt: initialSession.endAt,
        teamScopeId: initialSession.teamScopeId ?? null,
      });
    }
  }, [isEdit, initialSession, reset]);

  useEffect(() => {
    if (isEdit && sessionData) {
      reset({
        organizationId: sessionData.organizationId ?? null,
        templateId: sessionData.templateId ?? null,
        name: sessionData.name,
        description: (sessionData as any).description || "",
        startAt: (sessionData as any).startAt,
        endAt: (sessionData as any).endAt,
        teamScopeId: (sessionData as any).teamScopeId ?? null,
      });
    }
  }, [isEdit, sessionData, reset]);

  // Orgs
  // Organization listing now handled by centralized OrgSelectCombobox
  const orgQ = useOrganizations({ pageSize: 50 });
  const organizations = (orgQ.data as any)?.data || [];
  const selectedOrgId = watch("organizationId");
  const { activeOrganizationId } = useOrgState();
  // Fallback: اگر کاربر هنوز سازمانی داخل فرم انتخاب نکرده، از سازمان فعال سشن (کانتکس) استفاده کن
  const effectiveOrgId = selectedOrgId || activeOrganizationId || null;
  const selectedOrgQ = useOrganization(selectedOrgId || null);
  const mergedOrgs = React.useMemo(() => {
    const sel = selectedOrgQ.data as any;
    if (!sel) return organizations;
    const exists = organizations.some((o: any) => o.id === sel.id);
    return exists ? organizations : [sel, ...organizations];
  }, [organizations, selectedOrgQ.data]);

  // Templates
  const [templateSearch, setTemplateSearch] = React.useState("");
  const { data: templatesData, isLoading: tplLoading } = useTemplates(
    effectiveOrgId,
    { search: templateSearch }
  );
  const templates = templatesData?.data || [];
  const selectedTemplateId = watch("templateId") || null;
  const selectedTemplateQ = useTemplate(effectiveOrgId, selectedTemplateId);
  const mergedTemplates = React.useMemo(() => {
    const sel = selectedTemplateQ.data as any;
    if (!sel) return templates;
    const exists = templates.some((t: any) => t.id === sel.id);
    return exists ? templates : [sel, ...templates];
  }, [templates, selectedTemplateQ.data]);

  const createMut = useCreateSession();
  const updateMut = useUpdateSession();

  const startAtVal = watch("startAt");
  const endAtVal = watch("endAt");
  const invalidRange = React.useMemo(() => {
    if (!startAtVal || !endAtVal) return false;
    try {
      return new Date(endAtVal).getTime() < new Date(startAtVal).getTime();
    } catch {
      return false;
    }
  }, [startAtVal, endAtVal]);

  const onSubmit = handleSubmit(async (vals) => {
    const effOrgId =
      vals.organizationId ??
      initialSession?.organizationId ??
      (sessionData as any)?.organizationId ??
      null;
    const effTplId =
      vals.templateId ??
      initialSession?.templateId ??
      (sessionData as any)?.templateId ??
      null;
    if (!effOrgId || !effTplId || invalidRange) return;
    if (isEdit && sessionId) {
      const updated = await updateMut.mutateAsync({
        id: sessionId,
        body: {
          name: vals.name,
          description: vals.description || undefined,
          startAt: vals.startAt,
          endAt: vals.endAt,
          teamScopeId: vals.teamScopeId ?? undefined,
        },
      });
      onOpenChange(false);
      onSuccess?.(updated.id);
    } else {
      const created = await createMut.mutateAsync({
        organizationId: effOrgId,
        templateId: effTplId,
        name: vals.name,
        description: vals.description || undefined,
        startAt: vals.startAt,
        endAt: vals.endAt,
        teamScopeId: vals.teamScopeId ?? undefined,
      });
      onOpenChange(false);
      onSuccess?.(created.id);
      reset({
        organizationId: defaultOrganizationId ?? null,
        templateId: null,
        name: "",
        description: "",
        startAt: nowISO(),
        endAt: plusDaysISO(7),
        teamScopeId: null,
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent className="sm:max-w-3xl p-4 md:p-6 rounded-xl border border-border/60 bg-background/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {isEdit ? "ویرایش جلسه" : "ایجاد جلسه جدید"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEdit ? "ویرایش اطلاعات جلسه" : "تمپلیت، محدوده و جزئیات جلسه"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5 mt-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>سازمان</Label>
              <OrgSelectCombobox
                value={watch("organizationId") ?? activeOrganizationId ?? null}
                onChange={(id) => {
                  setValue("organizationId", id ?? null);
                  setValue("teamScopeId", null);
                }}
                disabled={isEdit}
                placeholder="انتخاب سازمان"
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>تمپلیت</Label>
              <Combobox<{ id: number; name: string }>
                items={effectiveOrgId ? mergedTemplates : []}
                value={watch("templateId")}
                onChange={(v) => setValue("templateId", (v as number) ?? null)}
                searchable
                searchValue={templateSearch}
                onSearchChange={setTemplateSearch}
                placeholder={
                  effectiveOrgId
                    ? "انتخاب/جستجوی تمپلیت"
                    : "ابتدا سازمان را انتخاب کنید"
                }
                getKey={(t) => t.id}
                getLabel={(t) => t.name}
                loading={tplLoading && !!effectiveOrgId}
                leadingIcon={FileText}
                disabled={isEdit || !effectiveOrgId}
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>نام جلسه</Label>
              <Input
                placeholder="مثلاً سنجش ماهانه تیم ۱"
                {...register("name", { required: true })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs">شروع</Label>
              <JalaliDatePicker
                withTime
                value={startAtVal}
                onChange={(iso) => setValue("startAt", iso || nowISO())}
                placeholder="انتخاب تاریخ شروع"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">پایان</Label>
              <JalaliDatePicker
                withTime
                value={endAtVal}
                onChange={(iso) => setValue("endAt", iso || plusDaysISO(7))}
                placeholder="انتخاب تاریخ پایان"
              />
            </div>
            {invalidRange && (
              <div className="md:col-span-2 flex items-center gap-2 rounded-md border border-amber-400/50 bg-amber-100/40 px-3 py-2 text-[11px] text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <TeamScopeField
              orgId={watch("organizationId")}
              value={watch("teamScopeId")}
              onChange={(v) => setValue("teamScopeId", v)}
            />
            <div className="space-y-2 md:col-span-2">
              <Label>توضیحات</Label>
              <Input
                placeholder="توضیح کوتاه"
                className="text-sm"
                {...register("description")}
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/60 mt-2">
            <span className="text-[11px] text-muted-foreground">
              {isEdit ? "ویرایش رکورد موجود" : "رکورد جدید"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => onOpenChange(false)}
                disabled={createMut.isPending || updateMut.isPending}>
                انصراف
              </Button>
              <Button
                size="sm"
                className="h-8 px-4 text-xs"
                onClick={onSubmit}
                isLoading={createMut.isPending || updateMut.isPending}
                disabled={
                  createMut.isPending || updateMut.isPending || invalidRange
                }>
                {isEdit ? (
                  <>
                    <Pencil className="h-4 w-4 ms-1" /> ذخیره تغییرات
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 ms-1" /> ثبت جلسه
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TeamScopeField({
  orgId,
  value,
  onChange,
}: {
  orgId: number | null | undefined;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>دامنه تیم (اختیاری)</Label>
      <TeamSelectCombobox
        orgId={orgId ?? null}
        value={value ?? null}
        onChange={onChange}
        placeholder={orgId ? "انتخاب تیم یا خالی" : "ابتدا سازمان"}
      />
    </div>
  );
}

export default SessionUpsertDialog;
