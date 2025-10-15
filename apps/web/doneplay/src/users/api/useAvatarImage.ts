import { useMemo } from "react";

/**
 * useAvatarImage
 * - Input: relative or absolute URL like "/avatars/1.jpg" or full CDN URL
 * - مینیمال شده: فقط URL نهایی را می‌سازد (CDN یا API). هیچ fetch/Blob.
 * - کش: به عهده مرورگر + CDN (immutable + version hash).
 */
export function useAvatarImage(urlOrPath: string | null | undefined) {
  const src = useMemo(() => {
    if (!urlOrPath) return null as string | null;
    const cdn = (process.env.NEXT_PUBLIC_CDN_BASE || "").replace(/\/$/, "");
    const api = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
    const isAvatarPath = (p: string) =>
      p.startsWith("/avatars/") || p.startsWith("/org-avatars/");
    if (/^https?:\/\//i.test(urlOrPath)) {
      try {
        const u = new URL(urlOrPath);
        // هر URL مطلقی که مسیر /avatars/ یا /org-avatars/ دارد در صورت وجود CDN بازنویسی می‌شود (host مهم نیست)
        if (isAvatarPath(u.pathname) && cdn) {
          return cdn + u.pathname + (u.search || "");
        }
      } catch {}
      return urlOrPath;
    }
    if (isAvatarPath(urlOrPath)) {
      // آواتار کاربر/سازمان: ابتدا CDN، سپس API، در نهایت مسیر نسبی
      if (cdn) return cdn + urlOrPath;
      if (api) return api + urlOrPath;
      return urlOrPath;
    }
    // سایر مسیرهای legacy (مثلا /uploads/) در صورت نیاز هنوز می‌توانند به API بچسبند
    if (urlOrPath.startsWith("/")) {
      return api ? api + urlOrPath : urlOrPath;
    }
    return urlOrPath;
  }, [urlOrPath]);
  return { src, isLoading: false, error: null };
}
