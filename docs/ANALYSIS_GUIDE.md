# Assessment Analysis System Guide

این راهنما توضیح می‌دهد چطور یک سیستم تحلیل (Analysis) جدید برای آزمون‌های پلتفرم بسازید و آن را به خروجی AI Export اضافه کنید.

## معماری کلی

- هر تحلیل یک سرویس مستقل است که واسط `AssessmentAnalysisService` را پیاده‌سازی می‌کند.
- رجیستری (`analysis/analysis.registry.ts`) همه سرویس‌ها را لیست می‌کند.
- در AI Export (متد `AiExportService.build`) همه سرویس‌هایی که `supports(template)` آن‌ها true شود اجرا و خروجی در فیلد `analyses` درج می‌گردد.
- کلید خروجی هر سرویس = `service.key` (مثلاً: `glasser`).

## واسط (Interface)

```ts
export interface AssessmentAnalysisService {
  key: string; // نام یکتا
  supports(template: any): boolean; // آیا این تحلیل برای این تمپلیت فعال است؟
  analyze(ctx: AssessmentAnalysisContext): any; // خروجی تحلیل (آزاد / JSON friendly)
}
```

`AssessmentAnalysisContext` شامل:

```ts
interface AssessmentAnalysisContext {
  template: any; // خود تمپلیت (Prisma object)
  questions: Array<{
    // سوالات نرمال‌شده (ترتیب 1-based)
    number: number;
    numeric: number | null;
    answer: string | null;
    type: string;
  }>;
  answered: number; // تعداد پاسخ داده شده
  total: number; // کل سوالات
}
```

## مسیر فایل‌ها

```
apps/api/doneplay/src/assessment/analysis/
  - types.ts               (تعریف اینترفیس‌ها)
  - analysis.registry.ts   (ثبت سرویس‌ها)
  - glasser.analysis.service.ts (نمونه پیاده‌سازی گلاسر)
```

## افزودن یک تحلیل جدید (گام به گام)

1. ایجاد فایل جدید: `yourname.analysis.service.ts`
2. پیاده‌سازی کلاس:

```ts
import { AssessmentAnalysisService, AssessmentAnalysisContext } from "./types";

export class YourAnalysisService implements AssessmentAnalysisService {
  key = "yourAnalysisKey";

  supports(template: any): boolean {
    // مثال‌ها:
    // بر اساس slug:
    // return template.slug?.toLowerCase().includes('your-slug');
    // یا بر اساس meta:
    // return !!(template.meta && (template.meta as any).yourAnalysisMeta);
    return false;
  }

  analyze(ctx: AssessmentAnalysisContext) {
    // منطق استخراج، پردازش و بازگرداندن نتیجه
    return {
      summary: "example",
      sampleRate: ctx.answered / ctx.total,
    };
  }
}
```

3. ثبت در رجیستری:

```ts
// analysis.registry.ts
import { YourAnalysisService } from "./yourname.analysis.service";
const SERVICES: AssessmentAnalysisService[] = [
  new GlasserAnalysisService(),
  new YourAnalysisService(),
];
```

4. (اختیاری) تعریف ساختار meta مخصوص برای فعال‌سازی:

```json
{
  "yourAnalysisMeta": {
    "groups": ["A", "B"],
    "map": { "1": "A", "2": "B" }
  }
}
```

5. فراخوانی API:

```
GET /sessions/:id/user/:userId/ai-export?perspective=SELF
```

خروجی:

```json
{
  "analyses": {
    "yourAnalysisKey": { "summary": "example", "sampleRate": 0.8 }
  }
}
```

## الگوی Meta پیشنهادی

برای تحلیل‌های مشابه گلاسر (نگاشت سوال → گروه):

```json
{
  "<analysisKey>Scoring": {
    "groups": [
      { "code": "GROUP_A", "label": "گروه A" },
      { "code": "GROUP_B", "label": "گروه B" }
    ],
    "questions": {
      "1": "GROUP_A",
      "2": "GROUP_B",
      "3": "GROUP_A"
    },
    "version": 1
  }
}
```

- `groups`: تعریف مجموعه گروه‌ها (ترجیحاً کد پایدار + لیبل نمایشی)
- `questions`: نگاشت شماره ترتیبی اصلی سؤال (۱-based در خروجی AI) به گروه
- `version`: امکان versioning در آینده

## نکات مهم طراحی

- از questionId استفاده نکن؛ ترتیب (number) پایدارتر است اگر تمپلیت ثابت باشد.
- اگر جابجایی سوالات زیاد است، می‌توان snapshot نگاشت را هنگام انتشار تمپلیت freeze کرد.
- خروجی باید JSON serializable باشد (توابع و کلاس‌ها ممنوع).
- اگر تحلیل هزینه‌بر است (O(n^2) یا فراخوانی خارجی)، می‌توان cache ساده (مثلاً Redis) اضافه کرد.

## مدیریت خطا

- اگر meta ناقص بود: خروجی بهتر است شکل `{ error: 'invalid_meta', detail: '...' }` داشته باشد.
- تحلیل نباید باعث شکست کل AI export شود؛ Catch داخلی + ادامه.

## تست سریع (پیشنهادی)

یک تست ساده e2e یا unit:

```ts
// pseudo-code
const svc = new YourAnalysisService();
expect(svc.supports({ meta: { yourAnalysisMeta: {} } })).toBe(true);
const out = svc.analyze({ template: {...}, questions: [...], answered: 5, total: 10 });
expect(out).toHaveProperty('sampleRate');
```

## افزودن شناسایی چندگانه

می‌توانید در `supports` چند شرط ترکیب کنید:

```ts
supports(tpl: any): boolean {
  if (!tpl) return false;
  const meta = tpl.meta as any;
  if (meta?.yourAnalysisMeta) return true;
  if (tpl.slug?.startsWith('your-')) return true;
  if ([101, 202].includes(tpl.id)) return true; // fallback ids
  return false;
}
```

## توسعه‌های آینده (Roadmap پیشنهادی)

- افزودن سیستم priority برای تحلیل‌ها
- افزودن dependency (یک تحلیل نیاز به خروجی تحلیل دیگر داشته باشد)
- استاندارد کردن ساختار common برای: groups, mapping, weights, version
- افزودن endpoint جدا برای /sessions/:id/analyses فقط (بدون سوالات)

---

### FAQ سریع

| سوال                          | پاسخ                                                                    |
| ----------------------------- | ----------------------------------------------------------------------- |
| چرا number به جای questionId؟ | خروجی AI ساده‌تر و مستقل از تغییرات دیتابیس.                            |
| اگر سوال حذف شد؟              | mapping را آپدیت کن؛ تحلیل خودش فقط سوالات موجود را لحاظ می‌کند.        |
| اگر numeric نبود؟             | آن سوال در محاسبات میانگین نادیده گرفته می‌شود.                         |
| چطور override کنم؟            | در meta یک کلید version یا flags بگذار و در analyze براساس آن رفتار کن. |

در صورت نیاز می‌توانیم یک CLI برای validate کردن meta قبل از انتشار اضافه کنیم.

---

موفق باشید! اگر تحلیل جدید مدنظرت هست اسم و ساختار متاش را بده تا اسکلت اولیه‌اش را بسازم.
