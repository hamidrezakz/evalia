// نگاشت پیام‌های خطای خام (سرور / شبکه) به پیام‌های کاربرپسند فارسی.
// در صورت استاندارد شدن کدهای خطا در بک‌اند، فقط کافیست به این آبجکت اضافه شوند.
// کلید می‌تواند متن پیام خام یا کد خطا (مثلاً OTP_INVALID) باشد.

const map: Record<string, string> = {
  // عمومی
  "Body validation failed": "ورودی نامعتبر است.",
  "Response validation failed": "خطای داخلی در پردازش پاسخ.",
  "Network error": "ارتباط با سرور برقرار نشد.",
  "Request failed": "درخواست ناموفق بود.",
  "Invalid credentials": "نام کاربری یا رمز عبور اشتباه است.",
  UNAUTHORIZED: "دسترسی غیرمجاز.",
  FORBIDDEN: "اجازه دسترسی ندارید.",

  // احراز هویت / کاربر
  USER_NOT_FOUND: "کاربر یافت نشد.",
  USER_ALREADY_EXISTS: "این شماره قبلاً ثبت شده است.",
  ACCOUNT_DISABLED: "حساب کاربری غیرفعال است.",
  PASSWORD_INCORRECT: "رمز عبور نادرست است.",
  PASSWORD_WEAK: "رمز عبور انتخاب‌شده ضعیف است.",

  // OTP
  OTP_INVALID: "کد تایید اشتباه است.",
  OTP_EXPIRED: "کد تایید منقضی شده است.",
  OTP_TOO_MANY_REQUESTS: "تعداد درخواست کد زیاد است، بعداً تلاش کنید.",
  OTP_DAILY_LIMIT: "سهمیه ارسال کد امروز تمام شده است.",
  RATE_LIMIT: "لطفاً کمی صبر کنید و دوباره تلاش نمایید.",

  // ثبت‌نام تکمیلی
  SIGNUP_TOKEN_INVALID: "لینک/توکن ثبت‌نام معتبر نیست.",
  SIGNUP_TOKEN_EXPIRED: "توکن ثبت‌نام منقضی شده است.",
  SIGNUP_INCOMPLETE: "اطلاعات لازم برای تکمیل ثبت‌نام وارد نشده است.",
};

export function friendlyError(message?: string | null) {
  if (!message) return null;
  return map[message] || message;
}
