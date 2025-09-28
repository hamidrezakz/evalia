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
import { QuestionText } from "@/app/dashboard/tests/take/components/QuestionText";
import { QuestionBoolean } from "@/app/dashboard/tests/take/components/QuestionBoolean";
import { QuestionSingleChoice } from "@/app/dashboard/tests/take/components/QuestionSingleChoice";
import { QuestionMultiChoice } from "@/app/dashboard/tests/take/components/QuestionMultiChoice";
import { QuestionScale } from "@/app/dashboard/tests/take/components/QuestionScale";

export default function TemplateExamPreview({
  templateId,
  title = "پیش‌نمایش آزمون",
  sectionId,
}: {
  templateId: number | null;
  title?: string;
  sectionId?: number | null;
}) {
  const { data, isLoading, error } = useFullTemplate(templateId);
  const sections: any[] = React.useMemo(() => {
    const list = Array.isArray((data as any)?.sections)
      ? (data as any).sections
      : Array.isArray((data as any)?.data?.sections)
      ? (data as any).data.sections
      : [];
    if (sectionId) return list.filter((s: any) => s?.id === sectionId);
    return list;
  }, [data, sectionId]);

  return (
    <div className="space-y-4" dir="rtl">
      <Separator />
      <Panel className="shadow-sm">
        <PanelHeader>
          <PanelTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span>{title}</span>
            <Badge variant="secondary" className="text-[10px]">
              پیش‌نمایش
            </Badge>
          </PanelTitle>
          <PanelDescription>
            نمایشی از سوالات قالب انتخاب‌شده، بدون ذخیره پاسخ.
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
            <div className="max-w-2xl">
              {sections.map((sec: any) => (
                <section key={sec.id} className="space-y-4">
                  <h2 className="text-lg font-semibold">{sec.title}</h2>
                  <div className="space-y-8">
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
                        <div key={link.id} className="scroll-mt-[75px]">
                          <div className="mb-2">
                            <span className="font-medium">
                              {idx + 1}. {text}
                            </span>
                            {link.required ? (
                              <span className="text-amber-600 text-xs mr-2">
                                (اجباری)
                              </span>
                            ) : null}
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
