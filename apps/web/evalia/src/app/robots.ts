import type { MetadataRoute } from "next";

// Disallow indexing of private dashboard; allow public root/pages by default.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/dashboard"],
      },
    ],
    sitemap: "https://doneplay.site/sitemap.xml",
  };
}
