import type { MetadataRoute } from "next";
import { RESUME_EXAMPLES } from "@/lib/examples";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const pages = ["", "/comecar", "/importar", "/modelos", "/exemplos", "/precos", "/privacidade", "/termos"];
  return [
    ...pages.map((path) => ({
      url: base + path,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path === "/privacidade" || path === "/termos" ? 0.3 : 0.8,
    })),
    ...RESUME_EXAMPLES.map((x) => ({
      url: base + "/exemplos/" + x.id,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
