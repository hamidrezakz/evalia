"use client";
import * as React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
  PanelDescription,
} from "@/components/ui/panel";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useFullTemplate } from "@/assessment/api/templates-hooks";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { QuestionText } from "@/app/dashboard/tests/take/components/QuestionText";
import { QuestionBoolean } from "@/app/dashboard/tests/take/components/QuestionBoolean";
import { QuestionSingleChoice } from "@/app/dashboard/tests/take/components/QuestionSingleChoice";
import { QuestionMultiChoice } from "@/app/dashboard/tests/take/components/QuestionMultiChoice";
import { QuestionScale } from "@/app/dashboard/tests/take/components/QuestionScale";
import { ResponsePerspectiveBadge } from "@/components/status-badges";
import { QuestionTypeBadge } from "@/components/status-badges/QuestionTypeBadge";
import { ListChecks } from "lucide-react";

export default function TemplateExamPreview({
  templateId,
  title = "پیش‌نمایش آزمون",
  sectionId,
}: {
  templateId: number | null;
  title?: string;
  sectionId?: number | null;
}) {
  const { activeOrganizationId } = useOrgState();
  const { data, isLoading, error } = useFullTemplate(
    activeOrganizationId,
    templateId
  );
  const sections: any[] = React.useMemo(() => {
    const list = Array.isArray((data as any)?.sections)
      ? (data as any).sections
      : Array.isArray((data as any)?.data?.sections)
      ? (data as any).data.sections
      : [];
    if (sectionId) return list.filter((s: any) => s?.id === sectionId);
    return list;
  }, [data, sectionId]);

  const counts = React.useMemo(() => {
    const secCount = Array.isArray(sections) ? sections.length : 0;
    const qCount = Array.isArray(sections)
      ? sections.reduce(
          (acc: number, s: any) => acc + (s?.questions?.length || 0),
          0
        )
      : 0;
    return { secCount, qCount };
  }, [sections]);

  return (
    <div className="space-y-4" dir="rtl">
      <Separator />
      <Panel className="shadow-sm">
        <PanelHeader>
          <PanelTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{title}</span>
            <Badge variant="secondary" className="text-[10px]">
              پیش‌نمایش
            </Badge>
          </PanelTitle>
          <PanelDescription>
            نمایشی از سوالات قالب انتخاب‌شده، بدون ذخیره پاسخ.
            {counts.secCount || counts.qCount ? (
              <span className="ml-2 text-[11px] text-muted-foreground">
                • {counts.secCount} بخش – {counts.qCount} پرسش
              </span>
            ) : null}
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="flex-col gap-4">
          {!templateId ? (
            <div className="text-sm text-muted-foreground">
              ابتدا یک قالب را انتخاب کنید.
            </div>
          ) : isLoading ? (
            <div className="text-sm text-muted-foreground">
              در حال بارگذاری قالب…
            </div>
          ) : error ? (
            <div className="text-sm text-rose-600">
              {String((error as any)?.message || error)}
            </div>
          ) : !data ? (
            <div className="text-sm text-muted-foreground">قالبی یافت نشد.</div>
          ) : (
            <div className="max-w-3xl">
              {sections.map((sec: any, sIdx: number) => (
                <section
                  key={sec.id}
                  className="space-y-4 rounded-lg border bg-card/40 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-semibold">
                      {sec.title}
                    </h2>
                    <Badge variant="outline" className="text-[10px]">
                      {sec?.questions?.length || 0} پرسش
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-5">
                    {sec.questions.map((link: any, idx: number) => {
                      const q = link.question as any;
                      const type = q?.type as string;
                      const text = q?.text as string;
                      const direct = Array.isArray(q?.options) ? q.options : [];
                      const fromSet = Array.isArray(q?.optionSet?.options)
                        ? q.optionSet.options
                        : [];
                      const options = (direct.length ? direct : fromSet).map(
                        (o: any) => ({
                          id: o.id,
                          value: String(o.value),
                          label: String(o.label),
                        })
                      );
                      return (
                        <div
                          key={link.id}
                          className="scroll-mt-[75px] rounded-md border bg-background p-3 hover:border-primary/30 transition-colors">
                          <div className="mb-2 flex flex-wrap items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="h-5 px-2 text-[10px]">
                                {idx + 1}
                              </Badge>
                              <span className="font-medium text-sm">
                                {text}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {type ? (
                                <QuestionTypeBadge
                                  type={type as any}
                                  size="xs"
                                  tone="soft"
                                />
                              ) : null}
                              {link.required ? (
                                <Badge
                                  variant="outline"
                                  className="h-5 px-2 text-[10px] border-amber-400 text-amber-700 dark:text-amber-400">
                                  اجباری
                                </Badge>
                              ) : null}
                              {Array.isArray(link.perspectives) &&
                              link.perspectives.length > 0 ? (
                                <div className="flex items-center gap-1.5">
                                  {link.perspectives.map((p: string) => (
                                    <ResponsePerspectiveBadge
                                      key={p}
                                      value={p as any}
                                    />
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                          {type === "TEXT" && (
                            <QuestionText
                              id={link.id}
                              value={undefined as any}
                              onChange={() => {}}
                              onSubmitNext={() => {}}
                            />
                          )}
                          {type === "BOOLEAN" && (
                            <QuestionBoolean
                              name={`q-${link.id}`}
                              value={undefined as any}
                              onChange={() => {}}
                            />
                          )}
                          {type === "SINGLE_CHOICE" && (
                            <QuestionSingleChoice
                              name={`q-${link.id}`}
                              options={options}
                              value={undefined as any}
                              onChange={() => {}}
                            />
                          )}
                          {type === "MULTI_CHOICE" && (
                            <QuestionMultiChoice
                              options={options}
                              value={undefined as any}
                              onChange={() => {}}
                            />
                          )}
                          {type === "SCALE" && (
                            <QuestionScale
                              name={`q-${link.id}`}
                              options={
                                options.length
                                  ? options
                                  : [1, 2, 3, 4, 5].map((n) => ({
                                      value: String(n),
                                      label: String(n),
                                    }))
                              }
                              value={undefined as any}
                              onChange={() => {}}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </PanelContent>
      </Panel>
    </div>
  );
}
