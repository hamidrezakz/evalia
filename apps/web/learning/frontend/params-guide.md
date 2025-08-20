# Complete Guide to Using `params` in Next.js (App Router)

This guide helps you understand when you should use `params` as a Promise (with `await`) or as a plain object, and how to tell the difference in Next.js App Router.

---

## 1. Types of `params` Usage

### a) In Page or Layout Functions

In most cases, when `params` is passed as a prop to a page or layout function, it is a plain object and does **not** require `await`:

```tsx
export default function Page({ params }: { params: { id: string } }) {
  // params is a plain object
  return <div>Id: {params.id}</div>;
}
```

### b) In Special Async Functions (like `preload` or `generateMetadata`)

In some async functions, Next.js provides `params` as a Promise (for example, in `preload` or `generateMetadata`). In these cases, you **must** use `await`:

```tsx
export async function preload({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // You must use await here
  // ...
}
```

Or:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // ...
}
```

---

## 2. How to Tell Which One to Use

- **Check the TypeScript type:**
  - If `params: Promise<...>` → you must use `await`.
  - If `params: {...}` → use it directly.
- **Check the function context:**
  - If your function is async and Next.js provides `params` as a Promise (like in `preload` or `generateMetadata`), use `await`.
  - If `params` is passed as a prop to a page or layout, it is usually a plain object.
- **Check Next.js documentation and your project’s code samples.**

---

## 3. Summary Table

| Function Context         | Type of `params` | Needs `await`? |
| ------------------------ | ---------------- | :------------: |
| Page or Layout (props)   | Object           |       ❌       |
| preload/generateMetadata | Promise<Object>  |       ✅       |

---

## 4. Real-World Examples

### Example 1: Simple Page

```tsx
export default function Page({ params }: { params: { id: string } }) {
  // params: { id: string }
  return <div>{params.id}</div>;
}
```

### Example 2: preload

```tsx
export async function preload({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ...
}
```

### Example 3: generateMetadata

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // ...
}
```

---

## 5. Important Tips

- Always pay attention to the type of `params`.
- If you’re unsure, try `console.log(typeof params.then)`; if it’s `undefined`, it’s **not** a Promise.
- Check the Next.js documentation and your project’s code samples.

---

## 6. Should You Always Use `await` with `params`?

**No, you should NOT always use `await` with `params`.**

You should only use `await` if `params` is actually a Promise. If `params` is a plain object and you use `await`, it will not work as expected and may cause errors or confusion.

**Best practice:**

- If the TypeScript type is `Promise<...>`, use `await`.
- If the TypeScript type is just an object, use it directly.

Using `await` unnecessarily can make your code slower and less clear. Always follow the type and context.

If you’re unsure, check with `typeof params.then`—if it’s `undefined`, it’s not a Promise and you should not use `await`.

---

---

## 7. Summary

- In special async functions (like `preload`), `params` is usually a Promise → use `await`.
- In page or layout props, `params` is usually a plain object → use it directly.

If you have a specific example you’re unsure about, write it here and I’ll help you figure it out!
