import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersKeys } from "./users-query-keys";
import { fetchAvatarObjectUrl } from "./avatars.api";
import { resolveApiBase } from "@/lib/api/helpers";

/**
 * useAvatarImage
 * - Input: relative or absolute URL like "/uploads/1.jpg" or "https://.../uploads/1.jpg"
 * - Behavior: fetches image as Blob, returns an object URL for <img/AvatarImage src>
 * - Caching: حداقل یک ساعت کش پایدار (staleTime = 1h) + gcTime = 2h
 * - رفتار قبلی باعث refetch غیر ضروری می‌شد چون blob URL ها در unmount revoke می‌شدند و روی mount بعدی دوباره دانلود انجام می‌گرفت.
 * - ساده‌سازی: حذف منطق staleBlob و عدم revoke در unmount تا وقتی TTL منقضی نشده (خطر نشت حافظه ناچیز است چون تعداد آواتارها محدود است)
 * - در صورت آپدیت آواتار: یا URL جدید (asset id جدید) می‌آید، یا می‌توانید با queryClient.invalidateQueries(usersKeys.avatarImage(absUrl)) دستی invalidate کنید.
 */
export function useAvatarImage(urlOrPath: string | null | undefined) {
  const absUrl = useMemo(() => {
    if (!urlOrPath) return null as string | null;
    return urlOrPath.startsWith("/") ? resolveApiBase() + urlOrPath : urlOrPath;
  }, [urlOrPath]);
  // آخرین object URL جهت مدیریت تغییر (فقط هنگام جایگزینی)
  const lastObjectRef = useRef<string | null>(null);
  const q = useQuery({
    queryKey: absUrl
      ? usersKeys.avatarImage(absUrl)
      : ["users", "avatar-image", "disabled"],
    queryFn: async () => {
      if (!absUrl) return null as string | null;
      try {
        return await fetchAvatarObjectUrl(absUrl);
      } catch (_e) {
        return null;
      }
    },
    enabled: !!absUrl,
    // یک ساعت دیتا تازه محسوب می‌شود
    staleTime: 60 * 60 * 1000,
    // دو ساعت در کش نگه دار بعد از آخرین استفاده
    gcTime: 2 * 60 * 60 * 1000,
  });
  // فقط هنگام تغییر blob جدید، قبلی را revoke کن (نه در unmount معمولی)
  useEffect(() => {
    const curr = (q.data ?? null) as string | null;
    const prev = lastObjectRef.current;
    if (prev && prev !== curr && prev.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(prev);
      } catch {}
    }
    lastObjectRef.current = curr;
  }, [q.data]);

  const src = (q.data as string | null) ?? absUrl;
  return {
    objectUrl: (q.data ?? null) as string | null,
    src,
    isLoading: q.isLoading,
    error: q.error,
  };
}
