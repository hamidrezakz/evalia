import React, { useMemo, useState } from "react";
import { triggerDownloadJson } from "../export/download-json.util";
import { getUserAiExport } from "../api/ai-export.api";
import { useOrgState } from "@/organizations/organization/context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Download,
  Loader2,
  FileJson,
  Sparkles,
  CheckCircle2,
  Copy,
  X,
} from "lucide-react";

interface Props {
  sessionId: number;
  userId: number;
  perspective: string;
  subjectUserId?: number;
  filename?: string; // default auto
}

export const AiAssessmentExportButton: React.FC<Props> = ({
  sessionId,
  userId,
  perspective,
  subjectUserId,
  filename,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadedName, setDownloadedName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { activeOrganizationId } = useOrgState();
  const [showPrompt, setShowPrompt] = useState(false);

  const samplePrompt = `با استفاده از فایل JSON پیوست که شامل:
• متادیتای آزمون (شناسه، عنوان، توضیحات)
• سوالات و پاسخ‌های نرمال‌شده (و در صورت وجود، مقایسه‌ای)
• تحلیل‌های محاسبه‌شده (مانند مدل نیاز/Glasser)
یک گزارش تحلیلی و ساختاریافته تولید کن:
1) خلاصه اجرایی ۳-۴ جمله‌ای
2) نقاط قوت (بولت)
3) ریسک‌ها/الگوهای نگران‌کننده با استدلال مبتنی بر داده
4) روابط احتمالی بین پاسخ‌ها/نمره‌ها (در صورت کافی‌بودن داده)
5) ۳–۵ اقدام عملی با شاخص پیگیری
قوانین:
- بی‌پشتوانه حدس نزن؛ اگر داده کافی نیست "کافی نیست" بگو.
- تیترهای سطح 2 و فهرست‌های واضح.
زبان: فارسی روان و حرفه‌ای.`;

  /**
   * Copy prompt text with graceful fallback for environments (some mobile browsers / in-app webviews)
   * where navigator.clipboard may be undefined or requires a secure context.
   */
  function handleCopyPrompt() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(samplePrompt)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    } catch {
      fallbackCopy();
    }
  }

  function fallbackCopy() {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = samplePrompt;
      textarea.style.position = "fixed"; // avoid scroll jump
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Clipboard copy failed", err);
    }
  }

  async function handleConfirmDownload() {
    setError(null);
    setLoading(true);
    setDownloadedName(null);
    try {
      const exportObj = await getUserAiExport(
        sessionId,
        userId,
        perspective,
        subjectUserId,
        activeOrganizationId || undefined
      );
      const name =
        filename ||
        `assessment-${
          exportObj.meta.sessionId
        }-user-${userId}-${perspective}-${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")}.json`;
      triggerDownloadJson(exportObj, name);
      setDownloadedName(name);
    } catch (e: any) {
      setError(e?.message || "خطا در تولید خروجی");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !loading && setOpen(o)}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2"
          isLoading={loading}
          icon={<FileJson className="size-4" />}
          iconPosition="right">
          فایل تحلیلی AI
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-xl max-w-[96%] p-0 overflow-hidden"
        dir="rtl">
        {/* Header */}
        <div className="flex items-start gap-4 p-5 border-b bg-gradient-to-l from-background to-muted/40">
          <div className="rounded-full p-2 bg-primary/10 text-primary shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-base font-bold tracking-tight">
              خروجی تحلیلی آزمون (AI)
            </DialogTitle>
            <p className="mt-1 text-[11px] text-muted-foreground truncate">
              JSON ساختاریافته برای گفت‌وگو با مدل‌های زبانی
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                <FileJson className="size-3.5" /> ساختار منسجم
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                <Sparkles className="size-3.5" /> آماده برای LLM
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                <CheckCircle2 className="size-3.5" /> شامل تحلیل‌ها
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-3 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> پرامپت پیشنهادی
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[11px]"
                  onClick={handleCopyPrompt}
                  title="کپی پرامپت"
                  icon={
                    copied ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <Copy className="size-4" />
                    )
                  }
                  iconPosition="right">
                  {copied ? "کپی شد" : "کپی"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setShowPrompt((s) => !s)}
                  title={showPrompt ? "بستن متن" : "نمایش کامل"}>
                  {showPrompt ? "بستن" : "نمایش کامل"}
                </Button>
              </div>
            </div>
            <div className="relative">
              <pre
                className={
                  "text-[11px] whitespace-pre-wrap rounded-md border bg-muted/50 p-3 pr-4 font-[inherit] leading-relaxed transition-[max-height] duration-200 ease-out overflow-hidden " +
                  (showPrompt ? "max-h-96" : "max-h-28")
                }>
                {samplePrompt}
              </pre>
              {!showPrompt && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-muted/70 to-transparent rounded-b-md" />
              )}
            </div>
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {downloadedName && !error && (
            <div className="flex items-center gap-2 text-xs rounded-md border border-emerald-300/50 bg-emerald-100/40 dark:bg-emerald-900/20 p-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-4" /> فایل «{downloadedName}» ذخیره
              شد — اکنون می‌توانید آن را در یک مدل متنی بارگذاری کنید.
            </div>
          )}
        </div>
        <DialogFooter className="px-5 pb-5 pt-2 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={handleConfirmDownload}
              isLoading={loading}
              icon={<Download className="size-4" />}
              iconPosition="right">
              دانلود فایل
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setOpen(false)}
              disabled={loading}
              icon={<X className="size-4" />}
              iconPosition="right">
              بستن
            </Button>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <FileJson className="size-3.5" />
            {downloadedName ? "آماده برای استفاده" : "فایل JSON ساختاریافته"}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AiAssessmentExportButton;
