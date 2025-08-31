# جریان احراز هویت (Frontend ↔ Backend)

این سند خلاصهٔ فلو چندمرحله‌ای احراز هویت مبتنی بر موبایل را در کلاینت (Next.js) و API (NestJS) توضیح می‌دهد.

## مراحل کلی

1. کاربر شماره موبایل را وارد می‌کند (Phase: IDENTIFIER)
2. بک‌اند بررسی می‌کند آیا کاربر وجود دارد.
   - اگر وجود دارد → نمایش فرم رمز عبور (Phase: PASSWORD) یا امکان ورود با OTP
   - اگر وجود ندارد → بلافاصله OTP برای ثبت‌نام ارسال و به مرحله OTP می‌رویم (Phase: OTP)
3. در مرحله OTP:
   - کاربر کد را وارد و verify می‌شود.
   - اگر کاربر قبلاً وجود داشته (LOGIN mode) → مستقیماً توکن‌ها صادر و ورود کامل می‌شود.
   - اگر کاربر جدید است (SIGNUP mode) → بک‌اند `signupToken` موقت برمی‌گرداند.
4. دریافت `signupToken` باعث انتقال به مرحله تکمیل ثبت‌نام (Phase: COMPLETE_REGISTRATION) می‌شود.
5. کاربر نام، نام خانوادگی و رمز عبور را وارد کرده و درخواست `completeRegistration` با `signupToken` ارسال می‌شود.
6. در صورت موفقیت، توکن‌های نهایی صادر و کاربر وارد داشبورد می‌شود.

## Endpoints (نمونه)

- `POST /auth/check-identifier` → { exists: boolean }
- `POST /auth/request-otp` → ارسال کد (devCode در محیط توسعه)
- `POST /auth/verify-otp` → { mode: "LOGIN" } یا { mode: "SIGNUP", signupToken }
- `POST /auth/complete-registration` → ورود نهایی
- `POST /auth/login-password` → ورود با رمز

## State Machine (Hook)

`useLoginMachine` وضعیت‌ها، فیلدها و ترنزیشن‌ها را مدیریت می‌کند:

- phases: IDENTIFIER | PASSWORD | OTP | COMPLETE_REGISTRATION
- fields: phone, password, otp, firstName, lastName, signupToken
- actions: submitIdentifier, doPasswordLogin, requestLoginOtp, verifyLoginOtp, finishRegistration

## قوانین OTP

- Throttle: فاصله حداقل ۳۰ ثانیه بین درخواست‌های OTP برای همان شماره (فرانت با تایمر `seconds` دکمه را غیرفعال می‌کند)
- محدودیت روزانه: X بار (نمایش پیام کاربرپسند در صورت رسیدن به سقف)
- حداکثر طول OTP: 6 رقم (فرانت ورودی را فیلتر می‌کند)

## مدیریت خطا

فایل `lib/error-map.ts` پیام‌ها را به فارسی نگاشت می‌کند؛ در صورت اضافه شدن کد جدید در بک‌اند، فقط map را به‌روزرسانی کنید. در UI از `friendlyError` استفاده می‌شود.

## UX نکات

- ورودی‌های عددی `dir="ltr"` برای خوانایی بهتر.
- نمایش تایمر ثانیه‌ای روی دکمه «ارسال مجدد» تا اتمام محدودیت ۳۰ ثانیه.
- نمایش کد توسعه (devCode) فقط در محیط توسعه.
- آیکون‌های بصری برای Phone / Lock / User جهت افزایش وضوح فرم.

## Flow Sequence (Pseudo)

```
IDENTIFIER:
  submitIdentifier(phone)
    -> exists? PASSWORD : (requestOtp + OTP)
PASSWORD:
  [loginWithPassword] OR [requestLoginOtp -> OTP]
OTP:
  verifyOtp(phone, code)
    -> LOGIN  => success
    -> SIGNUP => receive signupToken -> COMPLETE_REGISTRATION
COMPLETE_REGISTRATION:
  completeRegistration(signupToken, profileFields)
  => success
```

## آینده / پیشنهادها

- افزودن کدهای خطای استاندارد در بک‌اند (ENUM)
- ذخیره مرحله در sessionStorage برای refresh ایمن
- افزودن امکان انتخاب روش ورود (رمز/کد) در مرحله PASSWORD
- Mask ورودی موبایل (قالب +98xxxxxxxxxx)
- Accessibility بهبود فوکوس بین مراحل
