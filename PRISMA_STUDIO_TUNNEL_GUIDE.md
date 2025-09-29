# راهنمای کامل Prisma Studio (تونل امن SSH)

این سند روش‌های باز کردن Prisma Studio در محیط Production بدون اکسپوز مستقیم پورت به اینترنت را توضیح می‌دهد. همچنین سناریوی «روش دوم» که با پورت سفارشی (مثل 5561) تست کردی، اینجا به صورت کامل مستند شده است.

---

## فهرست

1. فلسفه و معماری
2. مقایسه روش‌ها
3. شروع سریع (Quick Start)
4. روش استاندارد (پورت ثابت 5555)
5. روش دوم (پورت پویا 5561 / دلخواه)
6. امنیت و چرایی امن بودن تونل
7. بستن صحیح و پاک‌سازی
8. عیب‌یابی متداول
9. Alias و اسکریپت کمکی
10. سوالات متداول (FAQ)

---

## 1. فلسفه و معماری

Prisma Studio یک UI موقت برای مشاهده / ویرایش دیتاست. ما نمی‌خواهیم آن را روی اینترنت عمومی publish کنیم. به همین دلیل:

- Studio داخل کانتینر API روی یک پورت داخلی (مثلاً 5555 یا 5561) گوش می‌دهد.
- آن پورت در `docker-compose.yml` به Host منتشر (publish) نشده است.
- ما با SSH Tunnel یک اتصال محلی روی سیستم خودمان (localhost:5555) ایجاد می‌کنیم که ترافیک را رمزنگاری شده تا سرور حمل می‌کند و آنجا به پورت داخلی کانتینر فوروارد می‌کند.
- نتیجه: کسی خارج از تونل به Studio دسترسی ندارد، حتی اگر پورت روی کانتینر باز باشد.

معماری جریان:
(مرورگر شما) -> http://localhost:5555 -> (SSH client) ==Encrypted==> (SSH Server) -> (کانتینر API:PORT)

---

## 2. مقایسه روش‌ها

| روش                        | توضیح                                 | مزیت                    | ریسک                                            |
| -------------------------- | ------------------------------------- | ----------------------- | ----------------------------------------------- |
| پورت ثابت 5555             | همیشه از یک پورت داخلی استفاده می‌شود | حفظ عادت و ساده         | احتمال برخورد (EADDRINUSE) اگر فراموش کنی ببندی |
| پورت پویا (5561، 5562 ...) | هر بار پورت تازه انتخاب می‌کنی        | کاهش برخورد + لاگ تمایز | نیاز به یادآوری پورت و تنظیم تونل               |
| Publish مستقیم در compose  | اضافه کردن `ports: "5555:5555"`       | ساده‌ترین اتصال         | ناامن: هر کسی با IP می‌بیند (ضد هدف ما)         |

---

## 3. شروع سریع (Quick Start)

سناریوی ساده (پورت 5555):

```bash
# سرور (داخل پوشه ریپو)
sudo docker compose exec api pnpm --filter @doneplay/api prisma:studio --port 5555 --hostname 0.0.0.0 --browser none
# در ترمینال دوم سرور (گرفتن IP کانتینر در صورت نیاز)
sudo docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' evalia-api-1
# سیستم شخصی (PowerShell / Bash محلی)
ssh -L 5555:<CONTAINER_IP>:5555 ubuntu@SERVER_IP
# مرورگر محلی
http://localhost:5555
```

اگر خطای پورت یا تداخل داشتی (یا می‌خواهی جدا باشد):

```bash
# سرور
sudo docker compose exec api pnpm --filter @doneplay/api prisma:studio --port 5561 --hostname 0.0.0.0 --browser none
# IP کانتینر
sudo docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' evalia-api-1
# سیستم شخصی
ssh -L 5555:<CONTAINER_IP>:5561 ubuntu@SERVER_IP
# مرورگر
http://localhost:5555
```

---

## 4. روش استاندارد (پورت ثابت 5555)

1. اجرای Studio:

```bash
sudo docker compose exec api pnpm --filter @doneplay/api prisma:studio --port 5555 --hostname 0.0.0.0 --browser none
```

2. گرفتن IP کانتینر (اگر از localhost داخل همان کانتینر تونل نمی‌زنی):

```bash
sudo docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' evalia-api-1
```

3. تونل محلی:

```bash
ssh -L 5555:<IP>:5555 ubuntu@SERVER_IP
```

4. مرورگر: http://localhost:5555
5. پایان: Ctrl+C در ترمینال Studio + خروج از SSH.

نکته: اگر قبلاً یک سشن Studio باز بوده، اجرای مجدد باعث EADDRINUSE می‌شود.

---

## 5. روش دوم (پورت پویا 5561 / دلخواه)

این روش دقیقا همان است اما هر بار پورت تازه انتخاب می‌شود تا:

- هم‌پوشانی با سشن قبلی پیش نیاید.
- در لاگ‌ها مشخص باشد این سشن جدید است.

گام‌ها (مثال 5561):

```bash
sudo docker compose exec api pnpm --filter @doneplay/api prisma:studio --port 5561 --hostname 0.0.0.0 --browser none
sudo docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' evalia-api-1
ssh -L 5555:<IP>:5561 ubuntu@SERVER_IP
//ssh -L 5555:<172.19.0.3>:5561 ubuntu@185.204.169.179
# مرورگر
http://localhost:5555
```

اگر این پورت هم درگیر شد، سریع یک عدد دیگر (5562، 5563) بگذار.

الگوی کلی:

```bash
PORT=5561
sudo docker compose exec api pnpm --filter @doneplay/api prisma:studio --port $PORT --hostname 0.0.0.0 --browser none
IP=$(sudo docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' evalia-api-1)
ssh -L 5555:$IP:$PORT ubuntu@SERVER_IP
```

---

## 6. امنیت و چرایی امن بودن تونل

- پورت Studio در Host publish نشده => اسکن اینترنت به آن نمی‌رسد.
- SSH Tunnel ترافیک را رمزنگاری می‌کند؛ فردی در مسیر (ISP / شبکه) داده‌ها را نمی‌بیند.
- احراز هویت SSH (کلید یا پسورد) لازم است => مهاجم بدون دسترسی SSH نمی‌تواند UI را باز کند.
- Session موقتی است: با بستن ترمینال، دسترسی قطع می‌شود.
- سطح حمله محدود: فقط وقتی خودت آگاهانه Studio را اجرا می‌کنی باز است.

تهدیدات باقی‌مانده (کوچک):

- اگر سیستم شخصی malware داشته باشد، می‌تواند از localhost:5555 سوءاستفاده کند.
- اگر SSH سرور compromise شود، مهاجم می‌تواند داخل کانتینر هم Studio اجرا کند (مشکل بزرگ‌تر است، Studio فرع می‌شود).

سخت‌سازی بیشتر (اختیاری):

- محدود کردن کاربران مجاز SSH.
- Fail2ban / auditd.
- کلیدهای کوتاه‌مدت / حذف دسترسی بعد از استفاده.

---

## 7. بستن صحیح و پاک‌سازی

برای اطمینان اینکه هیچ پروسس اضافه نماند:

1. ترمینال اجرای Prisma Studio: Ctrl+C (Node process خارج می‌شود).
2. ترمینال SSH تونل: exit یا Ctrl+D.
3. بررسی عدم وجود لیسنر:

```bash
sudo docker compose exec api sh -c "ss -tlnp | grep 5555 || echo 'no 5555'"
```

(اگر پورت دیگری استفاده کردی، همان را جایگزین کن.)

اگر فراموش کنی Ctrl+C بزنی و فقط SSH را ببندی، فرآیند داخل کانتینر معمولاً چون STDIN قطع می‌شود exit می‌کند، ولی اگر Detached شده باشد ممکن است بماند؛ در این صورت:

```bash
sudo docker compose restart api
```

---

## 8. عیب‌یابی متداول

| مشکل               | نشانه                            | راه‌حل                                              |
| ------------------ | -------------------------------- | --------------------------------------------------- |
| EADDRINUSE         | خطای listen EADDRINUSE           | kill یا تغییر پورت (5561)                           |
| صفحه باز نمی‌شود   | مرورگر لود نمی‌کند               | تونل صحیح؟ IP درست؟ پورت درست؟                      |
| HTML خام می‌بینم   | خروجی curl هست ولی UI نه         | Hard refresh (Ctrl+F5)                              |
| تونل قطع می‌شود    | SSH بعد چند دقیقه می‌بندد        | بررسی کیفیت شبکه، ServerAliveInterval در SSH config |
| IP کانتینر عوض شده | بعد از recreate تونل کار نمی‌کند | مجدداً inspect و تونل جدید                          |

دستورهای تشخیصی:

```bash
# داخل کانتینر API
sudo docker compose exec api ss -tlnp | grep 5555
sudo docker compose exec api ps -ef | grep prisma
```

---

## 9. Alias و اسکریپت کمکی

داخل سرور (`~/.bashrc`):

```bash
alias studio5555='sudo docker compose exec api pnpm --filter @doneplay/api prisma:studio --port 5555 --hostname 0.0.0.0 --browser none'
function studio() {
  PORT="${1:-5555}";
  sudo docker compose exec api sh -c "ss -tlnp | grep :$PORT && echo 'Port busy' && exit 1 || true";
  sudo docker compose exec api pnpm --filter @doneplay/api prisma:studio --port $PORT --hostname 0.0.0.0 --browser none;
}
```

استفاده:

```bash
studio              # پورت 5555
studio 5561         # پورت 5561
```

---

## 10. FAQ

**آیا لازم است همیشه IP کانتینر را بگیرم؟**
بله، چون پورت را publish نکردیم. (مگر اینکه موقتاً در compose «ports» بگذاری که توصیه نمی‌شود.)

**چطور بدون گرفتن IP تونل بزنم؟**
یک راه این است که یک کانتینر socat بسازی و به شبکه متصل کنی و نام سرویس api را Resolve کنی؛ اما این پیچیدگی اضافه است.

**اگر چند نفر همزمان بخواهند Studio باز کنند؟**
هر نفر یک پورت داخلی متفاوت (5561، 5562...) انتخاب کند. تداخل حذف می‌شود.

**می‌توانم پورت لوکال را غیر از 5555 بگذارم؟**
بله: `ssh -L 6000:<IP>:5561 ...` سپس در مرورگر `http://localhost:6000`.

**آیا لازم است پس از پایان حتماً ببندم؟**
بله، چون باز ماندن غیرضروری سطح حمله را (هرچند کم) افزایش می‌دهد و ممکن است بعداً EADDRINUSE بدهد.

---

پایان.

اگر چیزی مبهم است یا می‌خواهی بخشی تصویری شود اطلاع بده تا بهبود دهیم.
