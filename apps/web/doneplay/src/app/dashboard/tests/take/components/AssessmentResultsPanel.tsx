"use client";
import React from "react";
import { Sparkles, Activity, BarChart3, Download } from "lucide-react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
  PanelAction,
  PanelFooter,
} from "@/components/ui/panel";
import { AiAssessmentExportButton } from "@/assessment/components/AiAssessmentExportButton";
import { useAssessmentAnalyses } from "@/assessment/analysis/analyses-hook";
import GlasserNeedsRadarChart from "@/assessment/analysis/glasser/GlasserNeedsRadarChart";
import { Button } from "@/components/ui/button";

export interface AssessmentResultsPanelProps {
  canLoadAnalyses: boolean;
  sessionId: number | null;
  userId: number | null;
  perspective: string | null;
  subjectUserId: number | null;
  className?: string;
}

/**
 * Unified professional panel for assessment analyses & export actions.
 * - Fetches analyses only when canLoadAnalyses is true (fully answered & saved)
 * - Shows AI export button in action slot
 * - Renders available analyses (currently Glasser radar) in responsive layout
 */
export const AssessmentResultsPanel: React.FC<AssessmentResultsPanelProps> = ({
  canLoadAnalyses,
  sessionId,
  userId,
  perspective,
  subjectUserId,
  className,
}) => {
  const analysesQ = useAssessmentAnalyses(
    canLoadAnalyses ? sessionId : null,
    canLoadAnalyses ? userId : null,
    canLoadAnalyses ? perspective : null,
    canLoadAnalyses && perspective && perspective !== "SELF"
      ? subjectUserId || undefined
      : undefined
  );

  if (!canLoadAnalyses) return null;
  const glasser = (analysesQ.analyses as any)?.glasser;

  return (
    <Panel className={className}>
      <PanelHeader className="relative border-b border-border/60 pb-4">
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30 text-primary shadow-sm">
              <BarChart3 className="size-4" />
            </div>
            <div className="space-y-1 min-w-0">
              <PanelTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                تحلیل نهایی آزمون
                {analysesQ.isFetching && (
                  <Activity className="size-3.5 animate-pulse text-muted-foreground" />
                )}
              </PanelTitle>
              <PanelDescription className="text-[11px] truncate w-35 sm:w-fit items-center gap-1 pr-0">
                نتایج محاسبه‌شده و خروجی ویژه برای مدل‌های زبانی (AI)
              </PanelDescription>
            </div>
          </div>
          <PanelAction className="row-auto col-auto self-start">
            {sessionId != null && userId != null && perspective && (
              <AiAssessmentExportButton
                sessionId={sessionId}
                userId={userId}
                perspective={perspective}
                subjectUserId={
                  perspective !== "SELF"
                    ? subjectUserId || undefined
                    : undefined
                }
              />
            )}
          </PanelAction>
        </div>
      </PanelHeader>
      <PanelContent className="flex-col gap-6 pt-5">
        {analysesQ.isLoading && (
          <div className="text-[11px] text-muted-foreground">
            در حال آماده‌سازی تحلیل…
          </div>
        )}
        {analysesQ.error && (
          <div className="text-[11px] text-rose-600">
            {String((analysesQ.error as any)?.message || analysesQ.error)}
          </div>
        )}
        {/* Glasser analysis section */}
        {glasser && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <span className="inline-flex items-center justify-center size-6 rounded-md bg-background/60 border border-border/50">
                  <Sparkles className="size-3.5 text-primary" />
                </span>
                تحلیل نیازها (Glasser)
              </h4>
            </div>
            <div className="rounded-xl bg-muted/30 p-2 sm:p-3 border border-border/50">
              <GlasserNeedsRadarChart
                analysis={glasser}
                className="max-w-md dark:bg-transparent mx-auto"
              />
            </div>
          </div>
        )}
        {!glasser && !analysesQ.isLoading && !analysesQ.error && (
          <div className="text-[11px] text-muted-foreground">
            تحلیلی برای نمایش در حال حاضر موجود نیست.
          </div>
        )}
      </PanelContent>
      <PanelFooter className="flex-col items-start gap-2 text-[10px] text-muted-foreground border-t border-border/60 pt-4 pb-5">
        <div>
          این بخش پس از تکمیل کامل آزمون فعال می‌شود و می‌توانید خروجی را در
          ابزارهای AI بارگذاری کنید.
        </div>
        <div className="flex items-center gap-2">
          <Download className="size-3.5 opacity-70" />
          ساختار فایل JSON شامل: سوالات، پاسخ‌های نرمال‌شده، متادیتا، تحلیل‌ها
        </div>
      </PanelFooter>
    </Panel>
  );
};

AssessmentResultsPanel.displayName = "AssessmentResultsPanel";

export default AssessmentResultsPanel;
