This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Avatar CDN Integration

The backend now stores avatar asset URLs as relative paths (e.g. `/avatars/1.jpg?v=abc123def456`).

Frontend resolution rules:

1. If `NEXT_PUBLIC_CDN_BASE` is defined, any relative path starting with `/avatars/` is prefixed with that base. Example:
   - `NEXT_PUBLIC_CDN_BASE=https://cdn.doneplay.site`
   - Stored path: `/avatars/1.jpg?v=abc123def456`
   - Final browser URL: `https://cdn.doneplay.site/avatars/1.jpg?v=abc123def456`
2. Legacy absolute URLs (begin with `http`) are used as-is.
3. Other relative paths (e.g. legacy `/uploads/...`) fall back to API base via `resolveApiBase()`.

Environment variable example (create `.env.local`):

```env
NEXT_PUBLIC_CDN_BASE=https://cdn.doneplay.site
```

The hook `useAvatarImage` was updated to skip blob fetching for CDN / remote URLs, relying on standard HTTP cache.

If you change CDN domain, just update `NEXT_PUBLIC_CDN_BASE` – no DB migration needed.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
