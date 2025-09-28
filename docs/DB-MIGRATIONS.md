# راهنمای کامل مدیریت اسکیما و مایگریشن‌های پایگاه داده (Prisma)

این سند توضیح می‌دهد بعد از "clone" ریپو چه کارهایی لازم است، وقتی اسکیما (schema.prisma) را در محیط توسعه تغییر می‌دهی چه مراحلی دارد، روی سرور (Production) چه دستورات در چه ترتیبی اجرا شوند، و سناریوهای ویژه (Rollback، Reset لوکال، Seed، Conflict بین هم‌تیمی‌ها، چند سرور و ...).

> تکنولوژی: PostgreSQL + Prisma Migrate + NestJS
> ساختار: `packages/database/doneplay/prisma/schema.prisma` و مایگریشن‌ها در همان مسیر.

---

## فهرست مطالب

1. شروع بعد از Clone اولیه
2. چرخه توسعه (Development Cycle)
3. چرخه استقرار (Deployment Cycle)
4. تفاوت migrate dev و migrate deploy
5. سناریوهای عملی (Use Cases)
6. Rollback / برگشت موقت
7. Reset کامل دیتابیس لوکال
8. Seed (در صورت اضافه شدن)
9. چند سرور / Scale-Out
10. چک‌های امنیتی و بهترین‌عمل‌ها
11. خطاهای رایج و رفع آن‌ها
12. چک‌لیست سریع خلاصه
13. Prisma Studio (مدیریت داده)

---

## 1. شروع بعد از Clone اولیه

```bash
# 1) نصب وابستگی‌ها (یک بار)
pnpm install

# 2) ساخت فایل‌های env لازم
#   - apps/api/doneplay/.env  (PORT, DATABASE_URL, JWT_* ...)
#   - apps/web/doneplay/.env.local (NEXT_PUBLIC_API_BASE, NEXTAUTH_* ...)
#   - packages/database/doneplay/prisma/.env (DATABASE_URL)

# 3) ایجاد مایگریشن پایه (اولین بار فقط)
pnpm db:init   # ==> prisma migrate dev --name init + generate

# 4) بیلد و دپلوی محلی
pnpm deploy:all   # (api migrate deploy + api build + web build)

# 5) اجرای هر دو سرویس (اگر پورت تداخل ندارد)
pnpm start:all
```

اگر پوشه `prisma/migrations` موجود و داخلش مایگریشن هست (از گیت آمده) دیگر `db:init` نزن.

---

## 2. چرخه توسعه (Development Cycle)

وقتی می‌خواهی مدل‌ها را تغییر دهی (اضافه/حذف فیلد، مدل جدید، تغییر Enum):

1. ویرایش `schema.prisma`
2. ساخت مایگریشن جدید با نام معنی‌دار:
   ```bash
   pnpm --filter @doneplay/database prisma migrate dev --name add_user_avatar
   ```
3. اجرای تست / بیلد (اختیاری ولی توصیه‌شده):
   ```bash
   pnpm api:build
   ```
4. Commit & Push شامل فولدر جدید در `prisma/migrations/...`
5. اعضای تیم `git pull` و سپس (اگر لوکال‌شان آپدیت نیست) می‌توانند فقط:
   ```bash
   pnpm --filter @doneplay/api prisma:migrate:deploy   # یا ساده: pnpm api:deploy (که build هم می‌زند)
   ```

نکات:

- `migrate dev` فقط روی لوکال / محیط غیر پرود.
- هر مایگریشن یک اسکریپت SQL نسخه‌ای تولید می‌کند؛ آن را تغییر نده مگر تضاد بحرانی.

---

## 3. چرخه استقرار (Deployment Cycle)

روی سرور Production:

```bash
# کشیدن آخرین تغییرات
git pull origin main

# نصب وابستگی‌های تازه (اگر چیزی تغییر کرده بود)
pnpm install --frozen-lockfile

# اعمال مایگریشن‌های جدید به ترتیب
pnpm api:deploy    # شامل prisma migrate deploy + build

# اجرای سرویس‌ها (مثلاً با PM2 یا systemd)
pnpm api:start
pnpm web:start  # یا اگر پورت فرانت جداست
```

در صورتی که فرانت نیز نیاز به ری‌بیلد دارد (فایل‌های Type یا GraphQL / API تغییر کرده):

```bash
pnpm web:build
```

Zero-Downtime پیشنهاد:

1. Build در مسیر release جدید
2. migrate deploy روی دیتابیس مشترک
3. health check موفق
4. سوییچ Nginx / پروکسی به نسخه جدید
5. خاموش کردن نسخه قبلی

---

## 4. تفاوت migrate dev و migrate deploy

| دستور                 | محیط مناسب          | کارکرد                         | رفتار اضافی                        |
| --------------------- | ------------------- | ------------------------------ | ---------------------------------- |
| prisma migrate dev    | Development / Local | ایجاد مایگریشن جدید + اجرای آن | Generate Client + اصلاح drift کوچک |
| prisma migrate deploy | Production / CI     | فقط اجرای مایگریشن‌های موجود   | خطا اگر drift یا مایگریشن گم شده   |

هرگز `migrate dev` روی Production نزن؛ ممکن است مایگریشن پیش‌بینی نشده بسازد.

---

## 5. سناریوهای عملی (Use Cases)

### A) افزودن فیلد ساده

1. افزودن فیلد به مدل (مثلاً `User.bio String?`)
2. `prisma migrate dev --name add_user_bio`
3. Commit + Push
4. سرور: `pnpm api:deploy`

### B) تغییر نام فیلد (Rename)

Prisma به صورت native rename را تشخیص کامل نمی‌دهد؛ ممکن است drop + add شود. برای حفظ دیتا:

- یا دستی SQL را در فایل migration اصلاح کن (با احتیاط)
- یا ابتدا ستون جدید بساز، داده را backfill کن، بعد ستون قبلی را حذف.

### C) تغییر Enum (مثلاً اضافه کردن مقدار)

فقط مقدار جدید را اضافه کن، سپس migrate dev. (حذف مقدار enum در Postgres نیازمند تغییرات دستی است.)

### D) حذف مدل بزرگ

1. حذف مدل از schema
2. migrate dev
3. قبل از deploy مطمئن شو داده مهمی نیست (یا backup بگیر)

### E) Conflict بین دو توسعه‌دهنده

- هر دو نفر migration ساخته‌اند.
- بعد از pull ممکن است ترتیب متفاوت شود.
- راه حل: هر migration جداست؛ ترتیب اجرایش مهم است ولی Prisma نسخه‌ها را به ترتیب timestamp پوشه اجرا می‌کند. اگر conflict فایل داخل migration SQL رخ داد، merge دستی.

### F) سرور Stage / آزمایشی

Stage == شبیه Prod ولی با دیتابیس جدا. از همان `migrate deploy` استفاده کن؛ seed (اگر باشد) متفاوت یا محدود داده.

---

## 6. Rollback / برگشت موقت

Prisma rollback خودکار ندارد (برخلاف Liquibase). روش‌های عملی:

1. Backup قبل از deploy (Snapshot یا pg_dump)
2. اگر مایگریشن بد است:
   - Restore Backup
   - اصلاح migration یا ساخت migration جدید برای اصلاح
3. برای emergency سریع: ساخت migration معکوس دستی (SQL دستی)

> پیشنهاد: برای Production حتماً استراتژی Backup خودکار روزانه + قبل از هر deploy داشته باش.

---

## 7. Reset کامل دیتابیس لوکال

وقتی دیتابیس لوکال برای تست خراب یا پر از داده آزمایشی است:

```bash
# (Option A) Prisma Reset (داده پاک می‌شود)
prisma migrate reset --schema=packages/database/doneplay/prisma/schema.prisma
# یا با اسکریپت سفارشی (اگر اضافه کنیم)
```

این دستور: Drop + Create + Apply همه migrations + (در آینده) Seed.

اگر می‌خواهی اسکریپت ثابت داشته باشیم می‌توانیم اضافه کنیم (بگو تا بسازم).

---

## 8. Seed (در صورت اضافه شدن)

الان seed نداریم. اگر بخواهیم:

1. فایل `packages/database/doneplay/prisma/seed.ts`
2. در package.json دیتابیس:
   ```json
   "prisma:seed": "prisma db seed --schema=prisma/schema.prisma"
   ```
3. داخل seed از `import { PrismaClient } from '@prisma/client'` و داده اولیه را درج کن.
4. Production usually: seed فقط داده‌های سیستمی (نه تست).

---

## 9. چند سرور / Scale-Out

اگر چند instance API داری:

- فقط یکی از آن‌ها باید `migrate deploy` را اجرا کند (Leader)؛ بقیه فقط بالا بیایند.
- گزینه: قبل از start در همه، یک قفل ساده (مثلاً جدول migrations_lock) یا اجرای deploy در CI قبل از انتشار.

---

## 10. چک‌های امنیتی و بهترین‌عمل‌ها

- هر migration باید commit شود (هیچ migration local بدون commit روی prod اجرا نشود).
- روی prod هرگز `prisma db push` یا `migrate dev`.
- Environmentهای مختلف DATABASE_URL متفاوت و امن (پسورد جدا).
- Backup خودکار (pg_dump یا روتین Managed Service).
- ارزیابی تغییرات حساس (حذف ستون، truncate) قبل از اجرا.

---

## 11. خطاهای رایج و رفع آن‌ها

| خطا                                   | دلیل                               | راه حل                                                                               |
| ------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| EPERM rename query_engine-windows.dll | Lock ویندوز / موتور در حال استفاده | بستن پروسه‌های node، حذف `.prisma` cache، `pnpm install --force`                     |
| P3014 Drift detected                  | دیتابیس و migrations هم‌خوان نیست  | بررسی deployment قبلی / اجرای `migrate dev` فقط لوکال؛ روی prod اصلاح دستی / بازبینی |
| Cannot find module '@prisma/client'   | generate نشده                      | اجرای `prisma generate` یا build (اسکریپت build ما دارد)                             |
| Timeout connecting DB                 | آدرس/پورت/فایروال                  | تست با psql یا `pg_isready`                                                          |
| Enum value removal error              | حذف enum در Postgres مشکل          | migration دستی ALTER TYPE یا استراتژی ستون جدید                                      |

---

## 12. چک‌لیست سریع خلاصه

**Clone & Init:**

```
pnpm install
pnpm db:init   # فقط اولین بار (اگر migrations خالی است)
pnpm deploy:all
pnpm start:all
```

**تغییر مدل:**

```
# ویرایش schema.prisma
pnpm --filter @doneplay/database prisma migrate dev --name <meaningful_name>
git add . && git commit -m "migration: <meaningful_name>"
git push
# روی سرور:
pnpm api:deploy
```

**Production Deploy تکراری:**

```
git pull
pnpm install --frozen-lockfile
pnpm api:deploy
pm2 restart api   # یا systemd
```

**Reset Dev (در صورت نیاز):**

```
prisma migrate reset --schema=packages/database/doneplay/prisma/schema.prisma
```

---

## سوالات بعدی؟

اگر می‌خواهی اسکریپت‌های کمکی (db:reset, db:seed, db:migrate:new) اضافه کنیم یا راهنمای انگلیسی/دو زبانه داشته باشیم، بگو تا اضافه کنم.

---

## 13. Prisma Studio (مدیریت داده)

Prisma Studio رابط کاربری برای دیدن و ویرایش رکوردهاست؛ Migration تولید نمی‌کند و فقط داده را تغییر می‌دهد.

### اجرای لوکال

```
pnpm db:studio
```

یا:

```
pnpm --filter @doneplay/database prisma:studio
```

پورت (معمولاً 5555) در خروجی لاگ چاپ می‌شود و مرورگر باز می‌گردد.

### تغییر پورت

```
pnpm --filter @doneplay/database prisma studio --schema=prisma/schema.prisma --port 5599
```

### استفاده امن در Production

Studio خودش احراز هویت قوی ندارد؛ هرگز مستقیماً روی اینترنت عمومی باز نکن:

1. SSH Tunnel:
   ```
   ssh -L 5555:localhost:5555 user@prod-server
   # روی سرور:
   pnpm db:studio
   # روی سیستم خودت: http://localhost:5555
   ```
2. یا اجرای موقت + محدودیت Firewall فقط به IP ادمین.
3. بعد از اتمام، پروسه را ببند تا پورت باز نماند.

### نکات امنیتی

- هر تغییری در داده ممکن است بدون لاگ کامل باشد؛ قبل از تغییر حساس Backup.
- برای تغییرات انبوه (bulk) به جای کلیک دستی، اسکریپت یا SQL اتمیک بنویس.
- اگر اسکیما عوض شد ولی مایگریشن روی Prod اجرا نشده، قبل از Studio: `pnpm api:deploy`.

### مشکلات رایج

| مشکل                  | دلیل                            | راه‌حل                                                                 |
| --------------------- | ------------------------------- | ---------------------------------------------------------------------- |
| مدل جدید دیده نمی‌شود | Client قدیمی                    | `pnpm api:build` یا `pnpm --filter @doneplay/database prisma:generate` |
| خطای اتصال            | DATABASE_URL اشتباه یا تونل قطع | اتصال را با `psql` تست کن                                              |
| پورت اشتباه           | پورت توسط ابزار دیگر اشغال      | با `--port` مقدار متفاوت بده                                           |

### بستن امن

Ctrl+C در ترمینال کافی است. اگر با tunnel کار می‌کنی، جلسه SSH را هم ببند.

---
