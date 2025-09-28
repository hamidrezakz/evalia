import type { MetadataRoute } from "next";

// Basic static sitemap; extend with dynamic fetching of public entities if needed.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://doneplay.site";
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
