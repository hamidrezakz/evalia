# Next.js App Router: params & preload Explained

## 1. What is `params`?

- `params` is an object automatically provided to your page/layout components in Next.js App Router.
- It contains all dynamic route parameters from the URL.
- Example:
  - Route: `/app/user/[id]/page.tsx`
  - URL: `/user/42`
  - In your page:
    ```tsx
    export default function Page({ params }) {
      // params = { id: '42' }
      return <div>User ID: {params.id}</div>;
    }
    ```
- If you have multiple dynamic segments (e.g., `/blog/[category]/[slug]`), params will include all:
  ```tsx
  // params = { category: 'react', slug: 'hooks' }
  ```
- Use `params` to fetch data, display info, or control logic based on the URL.

---

## 2. What is `preload`?

- `preload` is a pattern for starting data fetching early, before you actually need the data.
- The goal: By the time you render a component that needs the data, it’s already fetched (or in progress), so the UI is faster.

### How to use `preload`:

1. Create a `preload` function that calls your data-fetching function (without `await`):
   ```js
   export function preload(id) {
     void getItem(id); // start fetching, don't wait
   }
   ```
2. Call `preload(id)` before a blocking operation (like another `await`):
   ```js
   export default async function Page({ params }) {
     const { id } = params;
     preload(id); // start fetching early
     const isAvailable = await checkIsAvailable();
     return isAvailable ? <Item id={id} /> : null;
   }
   ```
3. In your component, fetch the data as usual:
   ```js
   export async function Item({ id }) {
     const data = await getItem(id); // will be fast if already preloaded
     // ...
   }
   ```

### Why does this work?

- If your data-fetching function is cached (e.g., using `cache` from React or Next.js), the first call (from `preload`) starts the fetch and stores the result.
- When you later call the same function with the same arguments, it returns the cached result instantly.

---

## 3. Best Practices

- Use `preload` when you know you’ll need data soon, but have other async work to do first.
- Always use `params` to get dynamic values from the URL in your pages/layouts.
- For secure server-only data fetching, use the `server-only` package at the top of your data files:
  ```js
  import "server-only";
  ```

---

Keep this file as a quick reference for params and preload patterns in Next.js App Router!
