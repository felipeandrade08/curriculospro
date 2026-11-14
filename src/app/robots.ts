import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/modelos"],
      disallow: ["/api/", "/editor", "/curriculos", "/perfil-profissional", "/adaptar-vaga", "/auth/"],
    },
    sitemap: SITE_URL + "/sitemap.xml",
  };
}
