"use client";
import * as React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
  PanelDescription,
} from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useFullTemplate,
  useUpdateTemplateQuestion,
  useDeleteTemplateQuestion,
} from "@/assessment/api/templates-hooks";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { useQueryClient } from "@tanstack/react-query";
import { templatesKeys } from "@/assessment/api/templates-hooks";
import { ResponsePerspectiveEnum, type ResponsePerspective } from "@/lib/enums";
import {
  Edit2,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  X,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TemplateQuestionsPreviewEditor({
  templateId,
  templateName,
}: {
  templateId: number | null;
  templateName?: string | null;
}) {
  const qc = useQueryClient();
  const { activeOrganizationId } = useOrgState();
  const { data, isLoading, error } = useFullTemplate(
    activeOrganizationId,
    templateId
  );
  const sections: any[] = React.useMemo(() => {
    const d: any = data as any;
    if (Array.isArray(d?.sections)) return d.sections;
    if (Array.isArray(d?.data?.sections)) return d.data.sections;
    return [];
  }, [data]);
  const updateLink = useUpdateTemplateQuestion(activeOrganizationId);
  const deleteLink = useDeleteTemplateQuestion(activeOrganizationId);

  async function invalidate() {
    if (templateId) {
      await qc.invalidateQueries({ queryKey: templatesKeys.full(templateId) });
    }
  }

  // Move up/down by swapping order with neighbor
  async function moveLink(section: any, idx: number, dir: -1 | 1) {
    const base = Array.isArray(section?.questions) ? section.questions : [];
    const list = [...base].sort(
      (a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0)
    );
    const target = list[idx];
    const neighbor = list[idx + dir];
    if (!target || !neighbor) return;
    await updateLink.mutateAsync({
      id: target.id,
      body: { order: neighbor.order },
    });
    await updateLink.mutateAsync({
      id: neighbor.id,
      body: { order: target.order },
    });
    await invalidate();
  }

  return (
    <div className="space-y-4" dir="rtl">
      <Panel className="shadow-sm">
        <PanelHeader>
          <PanelTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            پیش‌نمایش و مدیریت سوالات قالب
            {templateName ? (
              <span className="text-sm text-muted-foreground">
                – {templateName}
              </span>
            ) : null}
          </PanelTitle>
          <PanelDescription>
            ترتیب، ویژگی‌ها و حذف سوالات افزوده‌شده به قالب را اینجا مدیریت
            کنید.
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="flex-col gap-6">
          {!templateId ? (
            <div className="text-sm text-muted-foreground">
              ابتدا یک قالب را از ستون چپ انتخاب کنید.
            </div>
          ) : isLoading ? (
            <div className="text-sm text-muted-foreground">
              در حال بارگذاری…
            </div>
          ) : error ? (
            <div className="text-sm text-rose-600">
              {String((error as any)?.message || error)}
            </div>
          ) : !data ? (
            <div className="text-sm text-muted-foreground">قالبی یافت نشد.</div>
          ) : (
            sections
              .slice()
              .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))
              .map((sec: any) => (
                <SectionBlock
                  key={sec.id}
                  section={sec}
                  onMove={moveLink}
                  onUpdate={async (id, body) => {
                    await updateLink.mutateAsync({ id, body });
                    await invalidate();
                  }}
                  onDelete={async (id) => {
                    await deleteLink.mutateAsync(id);
                    await invalidate();
                  }}
                />
              ))
          )}
        </PanelContent>
      </Panel>
    </div>
  );
}

function SectionBlock({
  section,
  onMove,
  onUpdate,
  onDelete,
}: {
  section: any;
  onMove: (section: any, idx: number, dir: -1 | 1) => Promise<void>;
  onUpdate: (id: number, body: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const list = (section.questions || [])
    .filter((q: any) => !q.deletedAt)
    .slice()
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">{section.title}</h3>
        <Badge variant="outline" className="text-[11px]">
          {list.length} سوال
        </Badge>
      </div>
      <div className="flex flex-col divide-y">
        {list.length === 0 ? (
          <div className="text-xs text-muted-foreground py-2">
            سوالی در این بخش وجود ندارد.
          </div>
        ) : (
          list.map((link: any, idx: number) => (
            <QuestionRow
              key={link.id}
              index={idx}
              count={list.length}
              section={section}
              link={link}
              onMove={onMove}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

function QuestionRow({
  index,
  count,
  section,
  link,
  onMove,
  onUpdate,
  onDelete,
}: {
  index: number;
  count: number;
  section: any;
  link: any;
  onMove: (section: any, idx: number, dir: -1 | 1) => Promise<void>;
  onUpdate: (id: number, body: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const q = link.question || {};
  const [editing, setEditing] = React.useState(false);
  const [order, setOrder] = React.useState<number>(link.order ?? 0);
  const [required, setRequired] = React.useState<boolean>(!!link.required);
  const [persp, setPersp] = React.useState<ResponsePerspective[]>(
    (Array.isArray(link.perspectives)
      ? link.perspectives
      : []) as ResponsePerspective[]
  );

  React.useEffect(() => {
    setOrder(link.order ?? 0);
    setRequired(!!link.required);
    setPersp(
      (Array.isArray(link.perspectives)
        ? link.perspectives
        : []) as ResponsePerspective[]
    );
  }, [link.id]);

  const perspectiveOptions =
    ResponsePerspectiveEnum.values as ResponsePerspective[];
  const type = q?.type as string | undefined;

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="flex-1 text-right">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {index + 1}. {q?.text || "—"}
            </span>
            {type ? (
              <Badge variant="outline" className="text-[10px]">
                {type}
              </Badge>
            ) : null}
            {link.required ? (
              <Badge className="text-[10px]">اجباری</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                اختیاری
              </Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {(perspectiveOptions || []).map((p) => {
              const isOn = link.perspectives?.includes(p);
              return (
                <span
                  key={p}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]",
                    isOn
                      ? "border-primary/50 text-primary bg-primary/5"
                      : "border-muted-foreground/20 text-muted-foreground"
                  )}>
                  {ResponsePerspectiveEnum.t(p as any)}
                </span>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:flex-none">
          <Button
            size="icon"
            variant="ghost"
            disabled={index === 0}
            title="انتقال به بالا"
            onClick={() => onMove(section, index, -1)}>
            <MoveUp className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            disabled={index === count - 1}
            title="انتقال به پایین"
            onClick={() => onMove(section, index, 1)}>
            <MoveDown className="h-4 w-4" />
          </Button>
          {!editing ? (
            <Button
              size="icon"
              variant="secondary"
              title="ویرایش"
              onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                size="icon"
                title="ثبت تغییرات"
                onClick={async () => {
                  await onUpdate(link.id, {
                    order,
                    required,
                    perspectives: persp,
                  });
                  setEditing(false);
                }}>
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title="انصراف"
                onClick={() => {
                  setEditing(false);
                  setOrder(link.order ?? 0);
                  setRequired(!!link.required);
                  setPersp(
                    (Array.isArray(link.perspectives)
                      ? link.perspectives
                      : []) as ResponsePerspective[]
                  );
                }}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            size="icon"
            variant="destructive"
            title="حذف سوال از بخش"
            onClick={() => onDelete(link.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {editing && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>ترتیب</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value || 0))}
            />
          </div>
          <div className="space-y-1">
            <Label>اجباری</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={required}
                onCheckedChange={(v) => setRequired(Boolean(v))}
              />
              <span className="text-xs text-muted-foreground">
                فعال = پاسخ ضروری
              </span>
            </div>
          </div>
          <div className="space-y-1 sm:col-span-3">
            <Label>پرسپکتیوها</Label>
            <div className="flex flex-wrap gap-2">
              {perspectiveOptions.map((p) => {
                const isOn = persp.includes(p);
                return (
                  <label
                    key={p}
                    className="inline-flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={isOn}
                      onCheckedChange={(v) => {
                        const on = Boolean(v);
                        const next = on
                          ? [...persp, p]
                          : persp.filter((x) => x !== p);
                        setPersp(next);
                      }}
                    />
                    <span>{ResponsePerspectiveEnum.t(p as any)}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
