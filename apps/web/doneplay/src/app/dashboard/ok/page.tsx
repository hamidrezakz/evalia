"use client";

import AiAssessmentExportButton from "@/assessment/components/AiAssessmentExportButton";
import { useGlasserAnalysis } from "@/assessment/analysis/glasser/glasser-analysis-hook";
import GlasserNeedsRadarChart from "@/assessment/analysis/glasser/GlasserNeedsRadarChart";

function GlasserAnalysisPanel({
  sessionId,
  userId,
  perspective,
}: {
  sessionId: number;
  userId: number;
  perspective: string;
}) {
  const { data, analysis, isLoading, error } = useGlasserAnalysis(
    sessionId,
    userId,
    perspective
  );
  if (isLoading) return <div>در حال بارگذاری تحلیل...</div>;
  if (error)
    return (
      <div style={{ color: "red" }}>
        خطا در دریافت: {(error as any).message}
      </div>
    );
  if (!data) return <div>داده‌ای یافت نشد.</div>;
  if (!analysis) return <div>الگوریتم گلاسر در متای تمپلیت موجود نیست.</div>;

  return (
    <div style={{ marginTop: 24 }} className="flex flex-col gap-10">
      <div>
        <h3 style={{ marginTop: 0 }}>نمودار رادار نیازهای گلاسر</h3>
        <GlasserNeedsRadarChart analysis={analysis} />
      </div>
    </div>
  );
}

// Removed old table cell styles (replaced by chart component)

export default function TestExportPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Export For AI</h2>
      <AiAssessmentExportButton sessionId={1} userId={1} perspective="SELF" />
      <GlasserAnalysisPanel sessionId={1} userId={1} perspective="SELF" />
    </div>
  );
}
