// Utility: Normalize Iranian phone number to +98 format
export function normalizePhone(identifier: string): string {
  const phone = identifier.trim();
  // اگر با + شروع شد و حداقل 10 رقم داشت، همان را برگردان
  if (/^\+\d{10,}$/.test(phone)) return phone;
  // اگر با 09 شروع شد
  if (/^09\d{9}$/.test(phone)) return "+98" + phone.slice(1);
  // اگر با 9 شروع شد و 10 رقم بود
  if (/^9\d{9}$/.test(phone)) return "+98" + phone;
  // اگر با 989 شروع شد
  if (/^989\d{8}$/.test(phone)) return "+" + phone;
  // اگر با 98 شروع شد
  if (/^98\d{9}$/.test(phone)) return "+" + phone;
  // اگر با 00 شروع شد (مثلاً 0098...)
  if (/^0098\d{9}$/.test(phone)) return "+98" + phone.slice(4);
  // در غیر این صورت همان مقدار اولیه را برگردان (ممکن است ایمیل باشد)
  return phone;
}
