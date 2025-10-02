/**
 * Lightweight avatar prefetch utility.
 * It injects <link rel="prefetch" as="image"> for CDN avatar URLs
 * to warm browser cache before actual <img> elements mount.
 *
 * Usage (client):
 *   prefetchAvatars(['/avatars/1.jpg?v=abc', '/avatars/2.jpg?v=def']);
 */
export function prefetchAvatars(paths: string[], opts?: { cdnBase?: string }) {
  if (typeof window === "undefined") return;
  const cdn = (opts?.cdnBase || process.env.NEXT_PUBLIC_CDN_BASE || "").replace(
    /\/$/,
    ""
  );
  const head = document.head;
  for (const p of paths) {
    if (!p) continue;
    const isAbs = /^https?:\/\//i.test(p);
    const finalUrl = isAbs ? p : p.startsWith("/avatars/") && cdn ? cdn + p : p;
    if (!/^https?:\/\//i.test(finalUrl)) continue; // skip non absolute
    const existing = head.querySelector(
      `link[data-avatar-prefetch="${finalUrl}"]`
    );
    if (existing) continue;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "image";
    link.href = finalUrl;
    link.setAttribute("data-avatar-prefetch", finalUrl);
    head.appendChild(link);
  }
}

/**
 * Observe a scrolling container (or window) and prefetch avatars that will appear soon.
 * Provide an array (or function returning array) of avatar URL paths.
 */
export function createAvatarViewportPrefetch(options: {
  getCandidates: () => string[];
  root?: HTMLElement | null;
  threshold?: number;
  batch?: number;
}) {
  const { getCandidates, root, threshold = 0.75, batch = 20 } = options;
  let initialized = false;
  let observer: IntersectionObserver | null = null;

  function ensureObserver() {
    if (observer) return;
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            trigger();
          }
        }
      },
      { root: root || null, threshold }
    );
  }

  function attachOnce(el: HTMLElement) {
    ensureObserver();
    if (observer) observer.observe(el);
  }

  function trigger() {
    if (initialized) return;
    initialized = true;
    const all = getCandidates().slice(0, batch);
    prefetchAvatars(all);
  }

  return { attachOnce, trigger };
}
