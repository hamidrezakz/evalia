"use client";
import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar, FileText, Users, CheckCircle2, Pencil } from "lucide-react";
import {
  useOrganization,
  useOrganizations,
} from "@/organizations/organization/api/organization-hooks";
import {
  useTemplate,
  useTemplates,
  useCreateSession,
  useUpdateSession,
  useSession,
} from "@/assessment/api/templates-hooks";
import { useTeams } from "@/organizations/team/api/team-hooks";

type FormVals = {
  organizationId: number | null;
  templateId: number | null;
  name: string;
  description?: string;
  startAt: string;
  endAt: string;
  teamScopeId?: number | null;
};

// Helpers: safe date parsing and formatting for input[type="datetime-local"]
function formatLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function safeToLocalInput(v?: string | null): string {
  if (!v) return "";
  // Try native parse first
  let date: Date | null = null;
  if (!isNaN(Date.parse(v))) {
    date = new Date(v);
  } else {
    // Try replace space with T (e.g. "2025-09-20 10:00:00")
    const withT = v.replace(" ", "T");
    if (!isNaN(Date.parse(withT))) {
      date = new Date(withT);
    } else if (!withT.endsWith("Z") && !isNaN(Date.parse(withT + "Z"))) {
      // Try appending Z to treat as UTC if no tz
      date = new Date(withT + "Z");
    }
  }
  if (date && !isNaN(date.getTime())) return formatLocalInput(date);
  // Fallback: extract YYYY-MM-DD HH:mm or YYYY-MM-DDTHH:mm
  const m = v.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
  if (m) return `${m[1]}T${m[2]}`;
  return "";
}

export function SessionUpsertDialog({
  open,
  onOpenChange,
  sessionId,
  defaultOrganizationId,
  trigger,
  onSuccess,
  initialSession,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sessionId?: number | null; // if provided => edit mode
  defaultOrganizationId?: number | null;
  trigger?: React.ReactNode; // optional external trigger
  onSuccess?: (id: number) => void;
  initialSession?: any;
}) {
  const isEdit = !!sessionId;
  const { data: sessionData } = useSession(isEdit ? sessionId! : null);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormVals>({
    defaultValues: {
      organizationId: defaultOrganizationId ?? null,
      templateId: null,
      name: "",
      description: "",
      startAt: formatLocalInput(new Date()),
      endAt: formatLocalInput(new Date(Date.now() + 7 * 24 * 3600 * 1000)),
      teamScopeId: null,
    },
  });

  // Prefill from initialSession immediately (before fetch), then refine with fetched sessionData
  useEffect(() => {
    if (isEdit && initialSession) {
      reset({
        organizationId: initialSession.organizationId ?? null,
        templateId: initialSession.templateId ?? null,
        name: initialSession.name,
        description: initialSession.description || "",
        startAt: safeToLocalInput(initialSession.startAt),
        endAt: safeToLocalInput(initialSession.endAt),
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
        startAt: safeToLocalInput((sessionData as any).startAt),
        endAt: safeToLocalInput((sessionData as any).endAt),
        teamScopeId: (sessionData as any).teamScopeId ?? null,
      });
    }
  }, [isEdit, sessionData, reset]);

  // Organization selection + search
  const [orgSearch, setOrgSearch] = React.useState("");
  const orgQ = useOrganizations({ q: orgSearch, page: 1, pageSize: 50 });
  const organizations = (orgQ.data as any)?.data || [];
  const selectedOrgId = watch("organizationId");
  const selectedOrgQ = useOrganization(selectedOrgId || null);
  const mergedOrgs = React.useMemo(() => {
    const sel = selectedOrgQ.data as any;
    if (!sel) return organizations;
    const exists = organizations.some((o: any) => o.id === sel.id);
    return exists ? organizations : [sel, ...organizations];
  }, [organizations, selectedOrgQ.data]);

  // Template selection + remote search
  const [templateSearch, setTemplateSearch] = React.useState("");
  const { data: templatesData, isLoading: tplLoading } = useTemplates({
    search: templateSearch,
  });
  const templates = templatesData?.data || [];
  const selectedTemplateId = watch("templateId") || null;
  const selectedTemplateQ = useTemplate(selectedTemplateId);
  const mergedTemplates = React.useMemo(() => {
    const sel = selectedTemplateQ.data as any;
    if (!sel) return templates;
    const exists = templates.some((t: any) => t.id === sel.id);
    return exists ? templates : [sel, ...templates];
  }, [templates, selectedTemplateQ.data]);

  const createMut = useCreateSession();
  const updateMut = useUpdateSession();

  const onSubmit = handleSubmit(async (vals) => {
    // Be robust: if ids are missing (e.g., due to async prefill), fallback to initial/session data
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
    if (!effOrgId || !effTplId) {
      // As a minimal UX guard, do nothing if critical ids are unavailable
      // You can replace this with a toast/error message if desired.
      return;
    }
    if (isEdit && sessionId) {
      const updated = await updateMut.mutateAsync({
        id: sessionId,
        body: {
          name: vals.name,
          description: vals.description || undefined,
          startAt: new Date(vals.startAt).toISOString(),
          endAt: new Date(vals.endAt).toISOString(),
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
        startAt: new Date(vals.startAt).toISOString(),
        endAt: new Date(vals.endAt).toISOString(),
        teamScopeId: vals.teamScopeId ?? undefined,
      });
      onOpenChange(false);
      onSuccess?.(created.id);
      // Reset form for next create
      reset({
        organizationId: defaultOrganizationId ?? null,
        templateId: null,
        name: "",
        description: "",
        startAt: formatLocalInput(new Date()),
        endAt: formatLocalInput(new Date(Date.now() + 7 * 24 * 3600 * 1000)),
        teamScopeId: null,
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "ویرایش جلسه" : "ایجاد جلسه جدید"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "ویرایش اطلاعات جلسه"
              : "تمپلیت، محدوده زمانی و نام جلسه را تعیین کنید."}
          </DialogDescription>
        </DialogHeader>

        {/* Form fields */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>سازمان</Label>
              <Combobox<any>
                items={mergedOrgs}
                value={watch("organizationId")}
                onChange={(v) => {
                  setValue("organizationId", (v as number) ?? null);
                  setValue("teamScopeId", null);
                }}
                searchable
                searchValue={orgSearch}
                onSearchChange={setOrgSearch}
                getKey={(o) => o.id}
                getLabel={(o) => o.name}
                loading={orgQ.isLoading}
                leadingIcon={Users}
                placeholder={"انتخاب سازمان"}
                disabled={isEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>تمپلیت</Label>
              <Combobox<{ id: number; name: string }>
                items={mergedTemplates}
                value={watch("templateId")}
                onChange={(v) => setValue("templateId", (v as number) ?? null)}
                searchable
                searchValue={templateSearch}
                onSearchChange={setTemplateSearch}
                placeholder={"انتخاب/جستجوی تمپلیت"}
                getKey={(t) => t.id}
                getLabel={(t) => t.name}
                loading={tplLoading}
                leadingIcon={FileText}
                disabled={isEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>نام جلسه</Label>
              <Input
                placeholder="مثلاً سنجش ماهانه تیم ۱"
                {...register("name", { required: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>شروع</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="datetime-local"
                  {...register("startAt", { required: true })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>پایان</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="datetime-local"
                  {...register("endAt", { required: true })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TeamScopeField
              orgId={watch("organizationId")}
              value={watch("teamScopeId")}
              onChange={(v) => setValue("teamScopeId", v)}
            />
            <div className="space-y-2">
              <Label>توضیحات</Label>
              <Input placeholder="توضیح کوتاه" {...register("description")} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={onSubmit}
              isLoading={createMut.isPending || updateMut.isPending}
              disabled={createMut.isPending || updateMut.isPending}>
              {isEdit ? (
                <>
                  <Pencil className="h-4 w-4 ms-1" /> به‌روزرسانی
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 ms-1" /> ثبت جلسه
                </>
              )}
            </Button>
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
  const [teamSearch, setTeamSearch] = React.useState("");
  return (
    <div className="space-y-2">
      <Label>دامنه تیم (اختیاری)</Label>
      {!orgId ? (
        <Combobox<any>
          items={[]}
          value={null}
          onChange={() => {}}
          placeholder="ابتدا سازمان را انتخاب کنید"
          leadingIcon={Users}
          disabled
        />
      ) : (
        <TeamScopeActiveSelect
          orgId={orgId as number}
          value={value ?? null}
          onChange={onChange}
          teamSearch={teamSearch}
          setTeamSearch={setTeamSearch}
        />
      )}
    </div>
  );
}

function TeamScopeActiveSelect({
  orgId,
  value,
  onChange,
  teamSearch,
  setTeamSearch,
}: {
  orgId: number;
  value: number | null;
  onChange: (v: number | null) => void;
  teamSearch: string;
  setTeamSearch: (v: string) => void;
}) {
  const teamsQ = useTeams(orgId, { q: teamSearch, pageSize: 50 });
  const teams = teamsQ.data || [];
  const items = React.useMemo(() => {
    if (value && !teams.find((t: any) => t.id === value)) {
      return [{ id: value, name: `تیم #${value}` }, ...teams];
    }
    return teams;
  }, [teams, value]);
  return (
    <Combobox<any>
      items={items}
      value={value}
      onChange={(v) => onChange((v as number) ?? null)}
      searchable
      searchValue={teamSearch}
      onSearchChange={setTeamSearch}
      getKey={(t) => t.id}
      getLabel={(t) => t.name}
      leadingIcon={Users}
      loading={teamsQ.isLoading}
      placeholder={"انتخاب تیم یا خالی"}
    />
  );
}

export default SessionUpsertDialog;
