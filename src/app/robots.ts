import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/profile", "/api/", "/unauthorized"],
    },
    sitemap: "https://belmanchurch.in/sitemap.xml",
    host: "https://belmanchurch.in",
  };
}
