# Data Fetching & Suspense Patterns in Next.js (App Router, React 18+)

## 1. Server Component Data Fetching (Default)

- Use `fetch` or any async function directly in Server Components.
- Data is fetched on the server during SSR/ISR.
- Example:

```tsx
// Server Component
async function Page() {
  const data = await fetch("https://api.example.com/data").then((res) =>
    res.json()
  );
  return <div>{data.title}</div>;
}
```

- **Caching:**

  - fetch is not cached by default—each call makes a new request.
  - By default, Next.js caches the rendered HTML (not the raw data).
    // Default cache duration:
    // If the page is SSG(static), the HTML cache remains until the next build/deploy (you must rebuild the project to get new data).
    // If the page is ISR, the cache duration is what you set in revalidate (e.g., every 60 seconds).
    // If the page is SSR and you haven't set revalidate or cache: 'no-store', usually there is no cache and each request gets a fresh render.
  - Use `{ cache: 'no-store' }` to disable caching and always fetch fresh data.
  - Use `{ next: { revalidate: 60 } }` for ISR (revalidate every 60s).

  - If caching is enabled (e.g., with `{ cache: 'force-cache' }`), Next.js will store the fetched data on the server and share it across all users and requests until the cache expires or is revalidated. This improves performance and reduces backend load.

---

## Advanced Caching: React cache vs. Next.js force-cache vs. Client-Side Cache

### React's `cache` (from 'react')

- **Purpose:** Memoizes async functions on the server (SSR/Server Components) to deduplicate fetches within a single server render/request.
- **Scope:** Per-request and per-user. **Not shared** between users or across requests. Each new request gets a fresh cache.
- **Use case:** When you need the same data for both metadata and page content, or want to deduplicate fetches in SSR.
- **Example:**
  ```ts
  import { cache } from 'react';
  export const getPost = cache(async (id) => fetch(...));
  ```

### Next.js `force-cache` (fetch option)

- **Purpose:** Caches fetch results on the server and shares them across all users and requests (server-wide cache).
- **Scope:** Shared between all users and requests until revalidation or cache expiry.
- **Use case:** For static or rarely-changing data (SSG/ISR/SSR), e.g., product lists, blog posts.
- **Example:**
  ```ts
  await fetch("/api/data", { cache: "force-cache" });
  ```

### Client-Side Caching (SWR, React Query, custom hooks)

- **Purpose:** Caches data in the browser (per user/session) to avoid duplicate fetches and improve UX.
- **Scope:** Per user/browser session. Not shared between users or server requests.
- **Use case:** For user-specific, real-time, or interactive data in Client Components.
- **Example:**
  ```ts
  const { data } = useSWR("/api/data", fetcher);
  ```

#### Comparison Table

| Feature  | React cache (per-request) | Next.js force-cache (server-wide) | Client-side cache (browser) |
| -------- | ------------------------- | --------------------------------- | --------------------------- |
| Scope    | Per server request/user   | Server-wide (all users/requests)  | Per user/browser session    |
| Shared?  | ❌ (not shared)           | ✅ (shared)                       | ❌ (not shared)             |
| Use case | SSR deduplication         | SSG/SSR/ISR caching               | Fast UX, offline            |
| Example  | Memoize in SSR            | Cache fetch results               | SWR, React Query            |

**Key Points:**

- **React cache**: Use to deduplicate fetches within a single SSR render/request. Not shared between users or requests.
- **force-cache**: Use to share cached data across all users and requests (server-wide).
- **Client-side cache**: Use for fast, user-specific data in the browser.

## 2. Server Component with Suspense (Streaming)

- Use `<Suspense>` to stream parts of the page as data becomes available.
- Example:

```tsx
import { Suspense } from "react";
import Posts from "./Posts";

export default function Page() {
  return (
    <div>
      <h1>Blog</h1>
      <Suspense fallback={<div>Loading posts...</div>}>
        <Posts />
      </Suspense>
    </div>
  );
}
```

- In this example, Posts is typically a Server Component that fetches data asynchronously (e.g., with fetch or database queries).
  If Posts is a Client Component, it should receive data as a prop (and use prop with the `use` hook) or fetch data on the client.

- **Benefit:**
  - Page shell loads fast, async parts stream in when ready.

## 3. Passing Promises to Client Components (Streaming Data)

- Pass a Promise from a Server Component to a Client Component as a prop.
- Use the `use` hook in the Client Component to resolve the Promise.
- Example:

```tsx
// Server Component
import { Suspense } from "react";
import Posts from "./Posts";

export default function Page() {
  const posts = getPosts(); // returns Promise
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Posts posts={posts} />
    </Suspense>
  );
}

// Client Component
("use client");
import { use } from "react";

export default function Posts({ posts }) {
  const allPosts = use(posts);
  return (
    <ul>
      {allPosts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

- **Note:** Only works if the Promise is passed from server to client and wrapped in `<Suspense>`.

## 4. Client Component Data Fetching (CSR)

- Use `useEffect`, SWR, or React Query for client-side fetching.
- Example with SWR:

```tsx
"use client";
import useSWR from "swr";

export default function Posts() {
  const { data, isLoading } = useSWR("/api/posts", fetcher);
  if (isLoading) return <div>Loading...</div>;
  return (
    <ul>
      {data.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

- **Benefit:**
  - Data is fetched in the browser, good for user-specific or real-time data.

## 5. Lazy Loading Components with Suspense

- Use `React.lazy` and `<Suspense>` to load components only when needed.
- Example:

```tsx
"use client";
import { Suspense, lazy } from "react";
const LazyComponent = lazy(() => import("./MyComponent"));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

- **Benefit:**
  - Reduces initial JS bundle size, improves performance.

---

## Advanced: React cache vs. Next.js force-cache vs. Client-Side Caching

### 1. React's `cache` (from 'react')

- **What is it?**
  - A utility (not a hook) for memoizing async functions on the server (SSR/Server Components).
  - Prevents duplicate data fetching within a single server render/request. If you call the same cached function with the same arguments multiple times during one render, it only fetches once.
  - Not shared between users or requests.
- **Use case:**
  - When you need the same data for both metadata and page content, or want to deduplicate fetches in SSR.
- **Example:**
  ```ts
  import { cache } from 'react';
  export const getPost = cache(async (id) => fetch(...));
  ```

### 2. Next.js `force-cache` (fetch option)

- **What is it?**
  - A fetch option that tells Next.js to cache the result on the server for all users/requests.
  - Shared across requests and users (server-wide cache).
- **Use case:**
  - For static or rarely-changing data (SSG/ISR/SSR), e.g., product lists, blog posts.
- **Example:**
  ```ts
  await fetch("/api/data", { cache: "force-cache" });
  ```

### 3. Client-Side Caching (SWR, React Query, custom hooks)

- **What is it?**
  - Caching in the browser (per user/session) to avoid duplicate fetches and improve UX.
  - Not shared between users or server requests.
- **Use case:**
  - For user-specific, real-time, or interactive data in Client Components.
- **Example:**
  ```ts
  const { data } = useSWR("/api/data", fetcher);
  ```

---

### Summary Table

| Feature  | React cache       | Next.js force-cache | Client-side cache |
| -------- | ----------------- | ------------------- | ----------------- |
| Scope    | Per server req    | Server-wide         | Per user/browser  |
| Shared?  | ❌ (not shared)   | ✅ (shared)         | ❌ (not shared)   |
| Use case | SSR deduplication | SSG/SSR/ISR caching | Fast UX, offline  |
| Example  | Memoize in SSR    | Cache fetch results | SWR, React Query  |

---

**Key Point:**

- Use React’s cache to avoid duplicate fetches in a single SSR render.
- Use force-cache to share cached data across all users and requests.
- Use client-side cache for fast, user-specific data on the browser.

---

## Summary Table

| Pattern                                 | Where?        | Data Fetching | Caching        | Suspense Use        |
| --------------------------------------- | ------------- | ------------- | -------------- | ------------------- |
| Server Component (default)              | Server        | SSR/ISR       | HTML output    | Optional            |
| Server Component + Suspense (streaming) | Server        | SSR/ISR       | HTML output    | Yes (stream parts)  |
| Promise to Client + use()               | Server+Client | SSR/ISR       | HTML output    | Yes (required)      |
| Client Component (CSR)                  | Client        | Browser       | Client lib/SWR | Yes (loading state) |
| Lazy Loading Component                  | Client        | N/A           | N/A            | Yes (loading state) |

## Notes

- Use Server Components for static/shared data, best performance.
- Use Client Components for user-specific, real-time, or interactive data.
- Use Suspense to improve UX for async data or lazy components.
- Control caching with fetch options (`cache`, `revalidate`).

---

For more details, check Next.js and React docs on data fetching and Suspense.
