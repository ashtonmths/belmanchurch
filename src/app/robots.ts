import { type MetadataRoute } from "next";
import { SITE_URL } from "~/lib/parish";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/profile", "/api/", "/unauthorized"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
