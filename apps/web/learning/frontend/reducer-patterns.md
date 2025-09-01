# Reducer Pattern in React (for Complex Forms)

## مقدمه

الگوی reducer برای مدیریت state پیچیده و چندمرحله‌ای در ری‌اکت استفاده می‌شود. این الگو مخصوصاً برای فرم‌های بزرگ یا ماشین حالت‌ها عالی است.

---

## سینتکس پایه

```js
function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
}
const [state, dispatch] = useReducer(reducer, initialState);
```

---

## نحوه تعریف و مقداردهی state

- معمولاً state به صورت یک آبجکت تعریف می‌شود که همه فیلدهای فرم یا وضعیت‌ها را در خود دارد:
  ```js
  const initialState = { name: "", email: "", loading: false, error: null };
  ```
- این آبجکت به useReducer داده می‌شود:
  ```js
  const [state, dispatch] = useReducer(reducer, initialState);
  ```
- state همیشه یک آبجکت است که وضعیت فعلی همه فیلدها را نگه می‌دارد (مثلاً state.email یا state.loading).

---

## چرا state به صورت آبجکت است؟

- اگر هر state را جدا با useState بنویسید، باید چندین useState داشته باشید (مثلاً یکی برای name، یکی برای email و ...).
- وقتی stateها به هم وابسته‌اند یا تعدادشان زیاد است، بهتر است همه را در یک آبجکت جمع کنید تا مدیریتشان راحت‌تر شود.
- آبجکت بودن باعث می‌شود بتوانید با یک اکشن داینامیک (مثل SET_FIELD) هر فیلدی را تغییر دهید.

---

## چطور state پاس داده و مقداردهی می‌شود؟

- useReducer خروجی‌اش یک آرایه است: [state, dispatch]
  - state: آبجکت وضعیت فعلی
  - dispatch: تابعی برای ارسال اکشن
- هر بار که dispatch اجرا می‌شود، reducer یک state جدید می‌سازد و به کامپوننت برمی‌گرداند.
- مقدار هر فیلد را می‌توانید با state.field بخوانید:
  ```js
  <input name="email" value={state.email} ... />
  ```
- مقدار هر فیلد را با dispatch و اکشن داینامیک تغییر می‌دهید:
  ```js
  onChange={e => dispatch({ type: "SET_FIELD", field: e.target.name, value: e.target.value })}
  ```
- reducer با استفاده از bracket notation مقدار همان فیلد را عوض می‌کند:
  ```js
  return { ...state, [action.field]: action.value };
  ```

---

## مزایا

- تمام منطق تغییر state در یک جا متمرکز است.
- تست و نگهداری راحت‌تر.
- مناسب برای فرم‌های چندمرحله‌ای و stateهای تو در تو.

---

## مثال فرم پیچیده

```js
const initial = { name: "", email: "", loading: false, error: null };
function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "LOADING":
      return { ...state, loading: action.value };
    case "ERROR":
      return { ...state, error: action.error };
    default:
      return state;
  }
}
const [state, dispatch] = useReducer(reducer, initial);

// استفاده در اینپوت:
<input
  name="email"
  value={state.email}
  onChange={(e) =>
    dispatch({ type: "SET_FIELD", field: e.target.name, value: e.target.value })
  }
/>;
```

---

## نکات حرفه‌ای

- می‌توانید اکشن‌های مختلف برای هر مرحله یا فیلد اضافه کنید.
- با تایپ‌اسکریپت، تایپ اکشن‌ها و state را دقیق تعریف کنید.
- برای فرم‌های خیلی ساده، useState کافی است؛ reducer برای فرم‌های پیچیده مناسب‌تر است.

---

## جمع‌بندی

الگوی reducer مدیریت state را ساختارمند و قابل توسعه می‌کند، مخصوصاً برای پروژه‌های بزرگ و فرم‌های چندمرحله‌ای.
