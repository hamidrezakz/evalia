# Dynamic Property Access with Bracket Notation

## مقدمه

Bracket Notation (براکت نوتیشن) روشی برای دسترسی یا تغییر پراپرتی‌های آبجکت با نام داینامیک است.

---

## سینتکس پایه

```js
const obj = { name: "Ali", age: 30 };
obj["name"]; // "Ali"
```

---

## تفاوت با Dot Notation

- Dot: فقط برای پراپرتی‌های ثابت (`obj.name`)
- Bracket: برای پراپرتی‌های داینامیک (`obj[key]`)

---

## مثال پیشرفته (آپدیت داینامیک)

```js
function updateField(obj, field, value) {
  return { ...obj, [field]: value };
}
const user = { name: "Ali", age: 30 };
const updated = updateField(user, "age", 31); // { name: "Ali", age: 31 }
```

---

## در ری‌اکت (فرم‌ها)

```js
const [state, setState] = useState({ name: "", email: "" });
const handleChange = (e) => {
  setState({ ...state, [e.target.name]: e.target.value });
};
```

---

## نکات حرفه‌ای

- می‌توانید پراپرتی‌هایی با نام متغیر بسازید یا تغییر دهید.
- در تایپ‌اسکریپت، با keyof و index signature ترکیب می‌شود.

---

## جمع‌بندی

Bracket Notation ابزار قدرتمندی برای کار با آبجکت‌های داینامیک و فرم‌های پیچیده است.
