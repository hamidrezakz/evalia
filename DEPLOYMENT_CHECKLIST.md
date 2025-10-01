# Deployment Checklist (Monorepo: API + Web)

> این سند خلاصه اجزای لازم برای استقرار پایدار پروژه است. برای تولید ایمیج‌ها از Dockerfile ریشه (multi-stage) و برای اجرای سرویس‌ها از `docker-compose.yml` استفاده می‌کنیم. دو Dockerfile تکی داخل apps (به‌صورت Legacy) نگه داشته شده‌اند اما در Compose مصرف نمی‌شوند.

## 1. پیش‌نیازها

- Docker / Docker Compose به‌روز
- دامنه‌ها: `doneplay.site`, `api.doneplay.site`
- رکوردهای DNS (A / AAAA) به سرور اشاره کنند
- گواهی SSL معتبر (Let’s Encrypt یا Cloudflare Origin) در مسیر: `nginx/ssl/doneplay.site/{fullchain.pem,privkey.pem}`

## 2. فایل‌های مهم ریپو

| دسته               | مسیر / فایل                                                    | توضیح                                             |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------- |
| Orchestration      | `docker-compose.yml`                                           | تعریف سرویس‌ها + healthcheck                      |
| Build              | `Dockerfile` (root)                                            | multi-stage: deps, build-api, build-web, api, web |
| Reverse Proxy      | `nginx/conf.d/doneplay.conf`                                   | SSL, redirect, proxy_pass                         |
| SSL Assets         | `nginx/ssl/doneplay.site/*`                                    | گواهی‌ها (Mount فقط در production)                |
| Env Samples        | `.env.example` / `.env.db.example`                             | الگو برای متغیرها                                 |
| API Env (prod)     | `apps/api/doneplay/.env.production`                            | DATABASE_URL ، secrets و ...                      |
| Web Env (prod)     | `apps/web/doneplay/.env.production`                            | NEXT*PUBLIC*\* و آدرس API                         |
| Workspace          | `pnpm-workspace.yaml`                                          | تعریف پکیج‌ها                                     |
| Lockfile           | `pnpm-lock.yaml`                                               | ثبات نسخه‌ها                                      |
| Prisma Schemas     | `packages/database/*/prisma/schema.prisma`                     | مدل دیتابیس                                       |
| Migrations         | `packages/database/*/prisma/migrations/`                       | تغییرات دیتابیس                                   |
| Uploads (runtime)  | `apps/api/doneplay/uploads/`                                   | نباید داخل ایمیج باشد (Volume)                    |
| Legacy Dockerfiles | `apps/api/doneplay/Dockerfile`, `apps/web/doneplay/Dockerfile` | استفاده نمی‌شوند                                  |

## 3. متغیرهای محیطی (نمونه‌های متداول)

API (`apps/api/doneplay/.env.production`):

```
DATABASE_URL=postgresql://user:pass@db:5432/appdb?schema=public
APP_PORT=4000
JWT_SECRET=... (طول مناسب)
NODE_ENV=production
LOG_LEVEL=info
```

Web (`apps/web/doneplay/.env.production`):

```
NEXT_PUBLIC_API_BASE_URL=https://api.doneplay.site
NODE_ENV=production
```

Database (`.env.db`):

```
POSTGRES_DB=appdb
POSTGRES_USER=appuser
POSTGRES_PASSWORD=secure_pass
TZ=UTC
```

## 4. روند Build و Run (Production)

1. اطمینان از وجود فایل‌های env (بدون قرار دادن در git)
2. اجرای:
   ```bash
   docker compose build --pull
   docker compose up -d
   ```
3. بررسی health:
   - API: `docker compose logs api | grep Health`
   - Web: درخواست GET به صفحه اصلی
4. تایید اعمال مهاجرت:
   - لاگ: `Running migrations` یا پیام سفارشی اسکریپت `start:prod:migrated`

## 5. Backup دیتابیس

- Volume: `pgdata`
- اسکریپت نمونه: `scripts/db-backup.sh` (می‌توان کرون بیرونی تعریف کرد)
- توصیه: زمان‌بندی روزانه + نگهداری 7 نسخه اخیر

## 6. بهینه‌سازی‌های پیشنهادی (Optional)

- افزودن مرحله prune برای حذف devDependencies در runtime ایمیج API/Web
- فعال‌سازی تولید خروجی standalone در Next.js (کاهش اندازه ایمیج)
- اضافه کردن ابزار Observability (Prometheus endpoint یا OpenTelemetry)
- Rate limiting ساده در Nginx برای مسیرهای لاگین

## 7. استراتژی بروزرسانی

```
# Pull latest changes
git pull origin main
# Rebuild only changed layers
docker compose build web api
# Apply
docker compose up -d
```

توجه: اگر schema.prisma تغییر کرد و migrations جدید اضافه شد، مرحله start:prod:migrated آن را اعمال می‌کند (idempotent).

## 8. پاکسازی (Maintenance)

- حذف ایمیج‌های معلق: `docker image prune -f`
- حذف ولوم‌های بلااستفاده: `docker volume prune -f`
- بررسی مصرف دیسک: `docker system df`

## 9. امنیت

- اطمینان از تنظیم HSTS (در nginx کانفیگ شده)
- جلوگیری از لو رفتن .env ها (در .dockerignore موجود)
- حداقل سطح دسترسی فایل‌های کلید خصوصی (chmod 600 اگر خارج از کانتینر)
- درصورت استفاده از Cloudflare، Mode = Full (Strict)

## 10. Legacy Dockerfiles

این فایل‌ها (در مسیرهای اپ) فقط برای سناریوهای خاص نگه داشته شده‌اند. پیشنهاد: یک برچسب بالای‌شان اضافه شود یا rename به `Dockerfile.legacy`.

---

برای بهبود بعدی می‌توان یک اسکریپت CI (GitHub Actions یا GitLab CI) افزود که: build → push به registry → run compose deploy. اگر خواستی، مرحله بعد را مشخص کن.
