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
    if (/^https?:\/\//i.test(urlOrPath)) {
      try {
        const u = new URL(urlOrPath);
        // هر URL مطلقی که مسیر /avatars/ دارد در صورت وجود CDN بازنویسی می‌شود (host مهم نیست)
        if (u.pathname.startsWith("/avatars/") && cdn) {
          return cdn + u.pathname + (u.search || "");
        }
      } catch {}
      return urlOrPath;
    }
    if (urlOrPath.startsWith("/avatars/")) {
      // برای آواتار هیچگاه به API fallback نمی‌کنیم تا درخواست به بک‌اند نرود
      if (cdn) return cdn + urlOrPath;
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[avatar] NEXT_PUBLIC_CDN_BASE خالی است؛ آدرس نسبی بدون backend fetch استفاده می‌شود."
        );
      }
      return urlOrPath; // relative -> مرورگر روی همون origin فرانت لود می‌کند (نه API)
    }
    // سایر مسیرهای legacy (مثلا /uploads/) در صورت نیاز هنوز می‌توانند به API بچسبند
    if (urlOrPath.startsWith("/")) {
      return api ? api + urlOrPath : urlOrPath;
    }
    return urlOrPath;
  }, [urlOrPath]);
  return { src, isLoading: false, error: null };
}
