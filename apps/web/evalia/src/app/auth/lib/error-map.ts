// Maps backend / network error messages to user-friendly localized messages.
// Extend as the backend adds standardized error codes.

const map: Record<string, string> = {
  "Body validation failed": "ورودی نامعتبر است.",
  "Response validation failed": "خطای داخلی در پردازش پاسخ.",
  "Network error": "ارتباط با سرور برقرار نشد.",
  "Request failed": "درخواست ناموفق بود.",
  "Invalid credentials": "نام کاربری یا رمز عبور اشتباه است.",
  OTP_INVALID: "کد تایید اشتباه است.",
  OTP_EXPIRED: "کد تایید منقضی شده است.",
  RATE_LIMIT: "لطفاً کمی صبر کنید و دوباره تلاش نمایید.",
};

export function friendlyError(message?: string | null) {
  if (!message) return null;
  return map[message] || message;
}
