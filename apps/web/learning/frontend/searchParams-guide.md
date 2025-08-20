# searchParams in Next.js (App Router)

## What is searchParams?

`searchParams` refers to the query string parameters in a URL—the part that comes after the `?` symbol. These parameters are used to pass additional, dynamic information to a page without changing the main route.

**Example:**

```
/products/shoes?color=red&size=42
```

- `/products/shoes` is the main route (path)
- `?color=red&size=42` are the searchParams

---

## Why use searchParams?

- To filter, sort, or paginate data without changing the main URL path
- To pass user preferences or settings (like theme, language, view mode)
- To handle search queries
- To keep URLs clean and RESTful while supporting dynamic data

---

## How to use searchParams in Next.js

In the App Router, you can access `searchParams` in your page or layout components, or in special functions like `generateMetadata`.

**Example usage in a page:**

```tsx
export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const color = searchParams.color;
  const size = searchParams.size;
  // Use these values to filter or display data
}
```

**Example usage in generateMetadata:**

```tsx
export async function generateMetadata({ searchParams }) {
  const q = (await searchParams).q;
  return {
    title: q ? `Search results for ${q}` : "Search",
  };
}
```

---

## Key Points & Best Practices

- `searchParams` is always an object where each key is a parameter name and the value is a string, array, or undefined.
- In async functions (like `generateMetadata`), you may need to `await` searchParams if it is a Promise.
- Use searchParams for data that is optional, dynamic, or user-controlled (filters, sorts, search, etc.).
- Do not use searchParams for required route parameters—use `params` for those.
- Always validate and sanitize searchParams before using them (to prevent errors or security issues).
- Changing searchParams does not trigger a full page reload; it only updates the data or view.

---

## Real-World Examples

### Filtering and Sorting

```
/products?category=shoes&sort=price_asc
```

- Filter products by category and sort by price.

### Pagination

```
/blog?page=3
```

- Show the third page of blog posts.

### Search

```
/search?q=nextjs
```

- Show search results for the query "nextjs".

### User Preferences

```
/dashboard?theme=dark&lang=en
```

- Set dashboard theme and language.

---

## Summary Table

| Use Case        | Use params? | Use searchParams? |
| --------------- | :---------: | :---------------: |
| Required route  |     ✅      |        ❌         |
| Optional/filter |     ❌      |        ✅         |
| Pagination      |     ❌      |        ✅         |
| Search          |     ❌      |        ✅         |
| User settings   |     ❌      |        ✅         |

---

## Tips

- Use URLSearchParams in client components if you need to parse or manipulate the query string.
- Always provide fallback/default values for searchParams in your code.
- Document which searchParams your page supports for maintainability.

---

---

## How are searchParams added or changed in the browser?

There are several ways to add or update searchParams (query string) in the browser. Each method has its own use case and effect on the URL and page behavior:

### 1. Manually in the Address Bar

- The user can type or edit the query string directly in the browser’s address bar:
  ```
  /products?color=red&size=42
  ```
- Pressing Enter reloads the page with the new searchParams.

### 2. Using Links (`<a>` or Next.js `<Link>`)

- You can create links that include searchParams:
  ```tsx
  <Link href="/products?color=red&size=42">Red Shoes</Link>
  ```
- Clicking the link updates the URL and usually fetches new data, but does not do a full page reload in Next.js (client-side navigation).

### 3. With the Next.js Router (Client Components)

- In client components, you can programmatically change searchParams using the router:
  ```tsx
  import { useRouter } from "next/navigation";
  const router = useRouter();
  // Add or update searchParams
  router.push("/products?color=red&size=42");
  ```
- This updates the URL and triggers a client-side navigation (no full reload).

### 4. With Forms

- Submitting a form with the GET method adds form fields as searchParams:
  ```html
  <form method="get" action="/search">
    <input name="q" />
    <button type="submit">Search</button>
  </form>
  ```
- The resulting URL will be `/search?q=your-query`.

### 5. With JavaScript (URLSearchParams)

- You can manipulate the query string in the browser using the URLSearchParams API:
  ```js
  const params = new URLSearchParams(window.location.search);
  params.set("color", "blue");
  window.location.search = params.toString(); // Triggers a full reload
  ```
- This is useful for advanced scenarios, but note it causes a full page reload unless you use router.push.

---

## Does the URL change? Does the page reload?

- **Yes, the URL always changes** when you add or update searchParams.
- In Next.js (App Router), using `<Link>` or `router.push` updates the URL and fetches new data, but does **not** do a full page reload—only the relevant data or view updates (client-side navigation).
- If you change searchParams by typing in the address bar or using `window.location.search`, the browser does a full reload.

---

## Best Practices and Notes

- Use `<Link>` or `router.push` for smooth, client-side updates to searchParams.
- Use searchParams for optional, dynamic, or user-controlled data (filters, sorts, search, etc.).
- Always keep your UI in sync with the current searchParams.
- Avoid using searchParams for required route parameters—use `params` for those.
- Document which searchParams your page supports for maintainability.

---
