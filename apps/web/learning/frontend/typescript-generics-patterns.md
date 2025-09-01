# TypeScript Generics & Advanced Types

## مقدمه

Generics (جنریک‌ها) در تایپ‌اسکریپت به شما اجازه می‌دهند توابع، کلاس‌ها یا تایپ‌هایی بنویسید که با انواع مختلف کار کنند و همچنان تایپ‌سیف باشند.

---

## سینتکس پایه جنریک

```ts
function identity<T>(value: T): T {
  return value;
}
const num = identity<number>(5); // 5
const str = identity<string>("ali"); // "ali"
```

---

## جنریک در تایپ آبجکت و اینترفیس

```ts
interface ApiResponse<T> {
  data: T;
  error?: string;
}
const res: ApiResponse<number> = { data: 42 };
```

---

## keyof و Index Signature

```ts
interface User {
  name: string;
  age: number;
}
type UserKeys = keyof User; // "name" | "age"
function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

---

## مثال پیشرفته (فرم داینامیک)

```ts
function setField<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  return { ...obj, [key]: value };
}
```

---

## نکات حرفه‌ای

- جنریک‌ها کد را قابل استفاده مجدد و تایپ‌سیف می‌کنند.
- با extends می‌توانید محدودیت بگذارید.
- با utility types (Partial, Pick, Record, ...) ترکیب می‌شوند.

---

## جمع‌بندی

جنریک‌ها ابزار قدرتمند تایپ‌اسکریپت برای ساخت کد منعطف و امن هستند.
