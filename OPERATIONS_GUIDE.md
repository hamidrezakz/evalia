# عملیات و نگهداشت زیرساخت DonePlay

این فایل خلاصه‌ی کارهای روزمره (بعد از pull/merge)، باز کردن امن Prisma Studio، بکاپ دیتابیس، ریستور، و نکات امنیتی/عیب‌یابی است.

---

## 1. چرخه استقرار (Deploy Cycle)

### بعد از pull یا merge روی سرور

از داخل پوشه ریپو (`~/evalia`):

```bash
# دریافت آخرین تغییرات
git pull --rebase

# (اختیاری) اگر lockfile تغییر کرده یا پکیج جدید اضافه شد:
sudo docker compose build api web

# بالا / ری‌کریت سرویس‌ها (مهاجرت خودکار در start:prod:migrated اجرا می‌شود)
sudo docker compose up -d --force-recreate api web

# بررسی لاگ‌ها
sudo docker compose logs -n 50 api
sudo docker compose logs -n 50 web
```

اگر Dockerfile یا nginx تغییر کرد:

```bash
sudo docker compose build nginx
sudo docker compose up -d --force-recreate nginx
```

### بررسی سلامت سریع

```bash
curl -I https://api.doneplay.site/health
curl -I https://doneplay.site/
```

---

## 2. Prisma Migrate و Studio

### اجرای مهاجرت‌ها دستی (اگر auto-migrate برداشته شد)

```bash
sudo docker compose exec api pnpm --filter @doneplay/api prisma:migrate:deploy
```

### باز کردن امن Prisma Studio (SSH Tunnel)

روی سیستم شخصی:

```bash
ssh -L 5555:localhost:5555 ubuntu@185.204.169.179
```

روی سرور (تب تونل باز باشد):

```bash
sudo docker compose exec api pnpm --filter @doneplay/api prisma:studio --port 5555 --hostname 0.0.0.0 --browser none
```

سپس در مرورگر سیستم خودت: http://localhost:5555
خروج: Ctrl+C در سرور + بستن SSH.

### باز کردن (ناامن – فقط برای تست کوتاه) – توصیه نمی‌شود

```bash
sudo docker compose exec api pnpm --filter @doneplay/api prisma:studio --port 5555 --hostname 0.0.0.0 --browser none
# (در صورت Publish شدن پورت 5555 در compose) – توصیه نمی‌شود در Production
```

### عیب‌یابی Prisma Studio (پورت 5555 در حال استفاده - EADDRINUSE)

اگر خطای زیر دیدی:

```
Error: listen EADDRINUSE: address already in use 0.0.0.0:5555
```

یعنی قبلاً یک فرآیند Studio داخل همان کانتینر روی پورت 5555 فعال مانده.

1. تست کن واقعاً باز است:

```bash
sudo docker compose exec api curl -I http://localhost:5555 || echo "not responding"
```

اگر 200 یا پاسخ HTML آمد، فقط تونل را به همان متصل کن (نیازی به اجرای مجدد نیست).

2. اگر گیر کرده بود (هیچ پاسخی نداد) کانتینر API را ری‌استارت کن:

```bash
sudo docker compose restart api
```

و دوباره Studio را اجرا کن.

3. یا از یک پورت جایگزین (مثلاً 5561) استفاده کن:

```bash
sudo docker compose exec api pnpm --filter @doneplay/api prisma:studio --port 5561 --hostname 0.0.0.0 --browser none
```

سپس تونل روی سیستم شخصی:

```bash
ssh -L 5555:172.19.0.3:5561 ubuntu@SERVER_IP
```

که در آن 172.19.0.3 همان IP کانتینر (دریافتی با inspect) است.

یادداشت: اگر از سناریوی پورت جایگزین (مثل 5561) استفاده کردی، می‌توانی هر بار مستقیماً پورت آزاد دیگری (5562، 5563، …) انتخاب کنی تا از برخورد جلوگیری شود. راهنمای کامل‌تر (معماری تونل، امنیت، بستن امن) در فایل `PRISMA_STUDIO_TUNNEL_GUIDE.md` (بخش «روش دوم با پورت دلخواه») توضیح داده می‌شود.

4. گرفتن IP کانتینر:

```bash
sudo docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' evalia-api-1
```

5. Alias راحت (روی سرور):

```bash
echo "alias studio='sudo docker compose exec api pnpm --filter @doneplay/api prisma:studio --port 5555 --hostname 0.0.0.0 --browser none'" >> ~/.bashrc && source ~/.bashrc
```

---

## 3. دسترسی به Postgres

### فقط داخل شبکه (ترجیحی)

در کانتینرها: hostname=`db` پورت=5432

### تونل برای PgAdmin / psql روی سیستم شخصی

```bash
ssh -L 5433:localhost:5432 ubuntu@SERVER_IP
psql -h localhost -p 5433 -U postgres -d doneplay
```

### (اگر هنوز map پورت داریم) اتصال مستقیم

Host = SERVER_IP Port = 5433 User = postgres DB = doneplay
(پیشنهاد: بعد از پایان تنظیمات پورت 5433 را از compose حذف کنید.)

---

## 4. بکاپ گیری از دیتابیس

### بکاپ سریع دستی (فشرده)

```bash
BACKUP_FILE=db_$(date +%Y%m%d_%H%M%S).sql.gz
sudo docker compose exec -T db pg_dump -U postgres -d doneplay | gzip > $BACKUP_FILE
ls -lh $BACKUP_FILE
```

دانلود روی سیستم شخصی:

```bash
scp ubuntu@SERVER_IP:~/evalia/$BACKUP_FILE .
```

### پوشه‌ی منظم بکاپ‌ها

```bash
mkdir -p backups
sudo docker compose exec -T db pg_dump -U postgres -d doneplay | gzip > backups/db_$(date +%Y%m%d_%H%M%S).sql.gz
ls -1t backups/db_*.sql.gz | head
```

### اسکریپت نمونه (Retention = آخرین 7 بکاپ)

فایل: `scripts/db-backup.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
DB_NAME=doneplay
DB_USER=postgres
RETENTION=7
OUT_DIR=backups
mkdir -p "$OUT_DIR"
FILE="$OUT_DIR/db_$(date +%Y%m%d_%H%M%S).sql.gz"
sudo docker compose exec -T db pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$FILE"
echo "Created $FILE"
# حذف بکاپ‌های قدیمی‌تر از n تای آخر
ls -1t "$OUT_DIR"/db_*.sql.gz | tail -n +$((RETENTION+1)) | xargs -r rm -f || true
```

### افزودن به کران (روزانه ساعت 03:10)

```bash
crontab -e
# اضافه کن:
10 3 * * * cd /home/ubuntu/evalia && /bin/bash scripts/db-backup.sh >> backups/backup.log 2>&1
```

### ریستور بکاپ

```bash
gunzip -c backups/db_YYYYMMDD_HHMMSS.sql.gz | sudo docker compose exec -T db psql -U postgres -d doneplay
```

(قبل ریستور مطمئن شو دیتای فعلی نیاز نیست.)

---

## 5. لاگ و عیب‌یابی

```bash
# آخرین لاگ‌ها
sudo docker compose logs -n 100 api
sudo docker compose logs -n 100 web
sudo docker compose logs -n 60 nginx

# وضعیت سرویس‌ها
sudo docker compose ps

# مصرف دیسک ولوم Postgres (تقریبی)
sudo docker compose exec db psql -U postgres -d doneplay -c "SELECT pg_size_pretty(pg_database_size('doneplay')) AS size;"
```

### خطای Bind پورت (80/443)

```bash
sudo lsof -iTCP:80 -sTCP:LISTEN
sudo lsof -iTCP:443 -sTCP:LISTEN
```

---

## 6. امنیت و نکات حیاتی

- کلید خصوصی SSL (`privkey.pem`) هرگز در git.
- برای مدیریت DB از SSH Tunnel استفاده کن، پورت پابلیک را حذف یا محدود کن (UFW).
- Prisma Studio فقط تونل موقت.
- Rotation رمزهای مهم (DB/JWT) در وقفه‌ها + ابطال session ها.
- Cloudflare روی Full(Strict) نگه‌دار (Origin Cert حاضر است).
- بعد از اعمال تغییر حساس: `sudo docker compose up -d --force-recreate` و تست health.

---

## 7. حذف پورت‌های مستقیم (وقتی مطمئن شدی)

در `docker-compose.yml` سرویس‌های api و web بخش:

```yaml
ports:
  - "4000:4000"  # حذف
ports:
  - "3001:3000"  # حذف
```

سپس:

```bash
sudo docker compose up -d --force-recreate api web
```

دسترسی فقط از طریق nginx.

---

## 8. بهینه‌سازی آتی (Optional)

- Slim کردن ایمیج (کپی فقط dist و prod node_modules)
- اضافه کردن Rate Limiting در nginx برای /auth
- سیستم مانیتورینگ (Netdata / UptimeRobot / Healthchecks.io)
- هشدار بکاپ شکست‌خورده (چک فایل log)

---

## 9. تست نهایی چرخه کامل (چک لیست سریع)

```bash
git pull --rebase
sudo docker compose build api web
sudo docker compose up -d --force-recreate api web
curl -I https://api.doneplay.site/health
ssh -L 5555:localhost:5555 ubuntu@SERVER_IP   # در صورت نیاز Studio
# بکاپ: sudo docker compose exec -T db pg_dump -U postgres -d doneplay | gzip > test.sql.gz
```

موفق باشی 🌱
