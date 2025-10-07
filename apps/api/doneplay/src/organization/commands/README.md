# اسکریپت‌های بک‌فیل و لینک‌دهی منابع به سازمان (Org 1)

این پوشه شامل اسکریپت‌های CLI برای لینک‌کردن بانک سؤال، تمپلیت و OptionSet به سازمان با شناسه ۱ (orgId=1) است. این اسکریپت‌ها بعد از مهاجرت دیتابیس (migration) و اضافه‌شدن جداول linkage باید اجرا شوند تا مالکیت و دسترسی ADMIN برای سازمان ۱ روی همه منابع تضمین شود.

---

## اجرای اسکریپت اصلی (link-unowned-resources.command.ts)

### پیش‌نیازها

- migration مربوطه را اعمال کرده باشی (جداول Link و ستون‌های جدید اضافه شده باشند)
- `@prisma/client` با schema جدید regenerate شده باشد
- متغیر `DATABASE_URL` روی دیتابیس صحیح ست باشد (لوکال یا سرور)
- Node.js و pnpm و ts-node نصب باشند

### اجرای لوکال (dev/stage)

```powershell
pnpm --filter @doneplay/api exec ts-node src/organization/commands/link-unowned-resources.command.ts
```

یا (اگر ts-node نصب نیست):

```powershell
pnpm dlx ts-node apps/api/doneplay/src/organization/commands/link-unowned-resources.command.ts
```

### اجرای روی سرور (prod/stage)

1. بکاپ دیتابیس:
   ```bash
   bash scripts/db-backup.sh
   ```
2. اجرای اسکریپت:
   ```bash
   cd ~/evalia
   export DATABASE_URL='postgresql://postgres:***@localhost:5432/doneplay?schema=public'
   pnpm --filter @doneplay/api exec ts-node src/organization/commands/link-unowned-resources.command.ts
   ```

### نکات مهم

- اسکریپت idempotent است (چند بار اجرا شود فقط اختلاف‌ها را اصلاح می‌کند)
- بعد از اجرا، همه منابع باید به سازمان ۱ لینک شده باشند و سطح دسترسی ADMIN داشته باشند
- لاگ خروجی تعداد رکوردهای تغییر یافته را نمایش می‌دهد
- قبل از اجرا در prod حتماً بکاپ بگیر

### اعتبارسنجی بعد از اجرا

```sql
SELECT count(*) FROM "QuestionBank" WHERE "createdByOrganizationId" IS NULL;
SELECT count(*) FROM "AssessmentTemplate" WHERE "createdByOrganizationId" IS NULL;
SELECT count(*) FROM "OptionSet" WHERE "createdByOrganizationId" IS NULL;
```

همه باید ۰ شوند.

---

## سایر اسکریپت‌های مرتبط

- اگر اسکریپت دیگری اضافه شد، توضیح و طرز اجرا را همین‌جا بنویس.

---

> سوال داشتی یا نیاز به dry-run/پارامتر سفارشی داشتی، همینجا اضافه کن یا به تیم اطلاع بده.
