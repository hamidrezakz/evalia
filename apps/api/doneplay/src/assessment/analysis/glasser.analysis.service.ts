import { AssessmentAnalysisContext, AssessmentAnalysisService } from './types';

/**
 * Glasser (Basic Needs) Analysis
 * ---------------------------------------------------------
 * محاسبه میانگین نیازها (Needs) بر اساس نگاشت سؤال → نیاز.
 * خروجی در AI export داخل analyses.glasser می‌آید.
 *
 * نحوه فعال شدن (Activation):
 *  1) وجود meta.glasserScoring داخل تمپلیت (حالت معمول و توصیه‌شده)
 *     ساختار پیشنهادی:
 *     {
 *       "glasserScoring": {
 *         "needs": [
 *           { "code": "POWER", "label": "قدرت" },
 *           { "code": "LOVE", "label": "محبت" },
 *           { "code": "FUN", "label": "تفریح" },
 *           { "code": "FREEDOM", "label": "آزادی" },
 *           { "code": "SURVIVAL", "label": "بقا" }
 *         ],
 *         "questions": {
 *           "1": "POWER",
 *           "2": "LOVE",
 *           "3": "FUN",
 *           "4": "FREEDOM",
 *           "5": "SURVIVAL"
 *         }
 *       }
 *     }
 *     - هر کلید داخل questions شماره ترتیبی سؤال (۱-based) در خروجی AI export است.
 *  2) افزودن شناسه تمپلیت به آرایه TEMPLATE_IDS برای فعال‌سازی اجباری حتی بدون meta.
 *
 * نحوه افزودن تمپلیت با ID:
 *  - در پایگاه داده ID تمپلیت را پیدا کن.
 *  - داخل آرایه STATIC TEMPLATE_IDS آن را قرار بده:
 *      static TEMPLATE_IDS: number[] = [123, 456];
 *  - ری‌استارت API (در صورت نیاز به بارگذاری مجدد کد).
 *
 * نکته طراحی:
 *  - استفاده از meta.glasserScoring تطبیق‌پذیرتر است (Migration ساده، عدم نیاز به تغییر کد).
 *  - لیست ID بیشتر برای حالت Legacy یا تست سریع مناسب است.
 *  - اگر پرسش‌ها جابجا شوند حتماً mapping questions را آپدیت کن (مبنای نگاشت ترتیب است نه questionId).
 *
 * خطاها:
 *  - اگر meta.glasserScoring نبود ولی تحلیل صدا زده شد -> خروجی: { error: 'missing_glasser_meta' }
 *
 * توسعه‌های پیشنهادی آینده:
 *  - افزودن weight برای برخی پرسش‌ها.
 *  - افزودن normalizer (مثلاً مقایسه با نُرم جمعیتی).
 *  - افزودن نسخه: glasserScoring.version = 1 برای versioning.
 */
export class GlasserAnalysisService implements AssessmentAnalysisService {
  key = 'glasser';

  // Add fixed template IDs here if you want forced activation even without meta
  static TEMPLATE_IDS: number[] = [
    // e.g. 101, 205
  ];

  supports(template: any): boolean {
    if (!template) return false;
    if (GlasserAnalysisService.TEMPLATE_IDS.includes(template.id)) return true;
    return !!(template.meta && (template.meta as any).glasserScoring);
  }

  analyze(ctx: AssessmentAnalysisContext) {
    const meta: any = ctx.template.meta || {};
    const gs = meta.glasserScoring;
    if (!gs) {
      return { error: 'missing_glasser_meta' };
    }
    const mapping = gs.questions || {};
    // Normalize needs definitions
    const needsArr: { code: string; label: string }[] = Array.isArray(gs.needs)
      ? gs.needs.map((n: any) => ({
          code: n.code || n.id || n.key,
          label: n.label || n.name || n.code,
        }))
      : Object.entries(gs.needs || {}).map(([code, v]: any) => ({
          code,
          label: v?.label || code,
        }));
    const stats: Record<
      string,
      {
        code: string;
        label: string;
        count: number;
        sum: number;
        questions: number[];
      }
    > = {};
    for (const n of needsArr) {
      stats[n.code] = {
        code: n.code,
        label: n.label,
        count: 0,
        sum: 0,
        questions: [],
      };
    }
    for (const q of ctx.questions) {
      const needCode = mapping[String(q.number)] || mapping[q.number];
      if (!needCode || !stats[needCode]) continue;
      if (q.numeric == null) continue;
      const st = stats[needCode];
      st.count += 1;
      st.sum += q.numeric;
      st.questions.push(q.number);
    }
    const needs = Object.values(stats).map((s) => ({
      ...s,
      average: s.count ? parseFloat((s.sum / s.count).toFixed(2)) : 0,
    }));
    const scored = needs.filter((n) => n.count > 0);
    let highest: any[] | undefined;
    let lowest: any[] | undefined;
    if (scored.length) {
      const maxAvg = Math.max(...scored.map((n) => n.average));
      const minAvg = Math.min(...scored.map((n) => n.average));
      highest = scored.filter((n) => n.average === maxAvg);
      lowest = scored.filter((n) => n.average === minAvg);
    }
    return {
      needs,
      highest,
      lowest,
      answeredQuestions: ctx.answered,
      totalQuestions: ctx.total,
    };
  }
}
