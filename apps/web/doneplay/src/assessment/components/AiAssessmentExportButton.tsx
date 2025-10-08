import React, { useState } from "react";
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

  const samplePrompt = `با استفاده از فایل JSON پیوست که شامل:
  • متادیتای آزمون (شناسه، عنوان، توضیحات، دسته‌بندی)
  • فهرست سوالات با انواع (مقیاسی / چندگزینه‌ای / چندانتخابی / متنی)
  • پاسخ‌های نرمال‌شده کاربر (و در صورت وجود پاسخ‌های مقایسه‌ای)
  • هر تحلیل محاسبه‌شده (در بخش analyses) مثل الگوهای آماری، نمره‌های مشتق‌شده یا مدل‌های نیاز
گزارشی تحلیلی و ساختاریافته تولید کن که شامل بخش‌های زیر باشد:
1) خلاصه اجرایی ۳-۴ جمله‌ای
2) الگوهای مثبت یا نقاط قوت برجسته (Bullet)
3) الگوهای نگران‌کننده یا ریسک‌های بالقوه (با استدلال مبتنی بر داده)
4) همبستگی‌ها یا روابط احتمالی بین پاسخ‌ها یا نمره‌های محاسبه‌شده (اگر داده کفایت نداشت صریحاً ذکر کن)
5) ۳ تا ۵ پیشنهاد عملی و قابل اندازه‌گیری (هر کدام شامل: شرح، منطق، شاخص پیگیری)
6) اگر تحلیل‌های پیشرفته (مثلاً مدل نیاز یا دسته‌بندی خاص) وجود دارد، آن را به زبان ساده تفسیر کن.
قوانین خروجی:
- از حدس بی‌پشتوانه خودداری کن.
- اگر داده برای نتیجه‌گیری کافی نیست «کافی نیست» بگو.
- خروجی را با تیترهای سطح 2 و فهرست‌های واضح ارائه کن.
زبان خروجی: فارسی روان و حرفه‌ای.`;

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
        <Button size="sm" className="gap-2" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> آماده‌سازی
            </>
          ) : (
            <>
              <FileJson className="size-4" /> فایل تحلیلی AI
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-xl max-w-[96%] p-0 overflow-hidden"
        dir="rtl">
        <div className="flex items-start gap-4 p-5 border-b bg-gradient-to-l from-background to-muted/40">
          <div className="rounded-full p-2 bg-primary/10 text-primary shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <div className="space-y-2 flex-1">
            <DialogTitle className="text-md font-bold tracking-tight flex items-center gap-2">
              بسته داده تحلیلی آزمون
            </DialogTitle>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              این بسته JSON برای گفتگو با مدل‌های زبانی (LLM) طراحی شده تا تحلیل
              عمیق‌تر و شخصی‌سازی‌شده‌تری از نتایج آزمون ارائه شود.
            </p>
            <ul className="text-[11px] sm:text-[11px] leading-relaxed list-disc pr-5 space-y-1">
              <li>تمام سوالات و پاسخ‌های نرمال‌شده</li>
              <li>متادیتای آزمون و ساختار مقایسه‌ای</li>
              <li>تحلیل‌های محاسبه‌شده (مانند Glasser)</li>
              <li>قابل مصرف مستقیم در ChatGPT / Claude / Gemini</li>
            </ul>
          </div>
        </div>
        <div className="px-5 pt-4 pb-3 space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> پرامپت پیشنهادی
            </h4>
            <div className="relative">
              <pre className="text-[10px] whitespace-pre-wrap rounded-md border bg-muted/50 p-3 pr-4 max-h-48 overflow-auto font-[inherit] leading-relaxed">
                {samplePrompt}
              </pre>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopyPrompt}
                /* Use right positioning for RTL to keep button visually at logical start, adjust for mobile */
                className="absolute top-2 left-2 h-7 w-7 z-10 bg-background/60 backdrop-blur-sm hover:bg-background/80 border shadow-sm"
                title="کپی پرامپت">
                {copied ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              می‌توانید متن را تغییر داده و بر نقاط قوت یا تحلیل‌های خاص تمرکز
              دهید.
            </p>
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
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {downloadedName ? (
              <span className="flex items-center gap-1">
                <FileJson className="size-3.5" /> آماده برای استفاده
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <FileJson className="size-3.5" />
                <span className="mt-[3px]">یک فایل JSON ساختاریافته</span>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setOpen(false)}
              disabled={loading}>
              <X className="size-4" /> بستن
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={handleConfirmDownload}
              disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> در حال ساخت
                </>
              ) : (
                <>
                  <Download className="size-4" /> دانلود فایل
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AiAssessmentExportButton;
