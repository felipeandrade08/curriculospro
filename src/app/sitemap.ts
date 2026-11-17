import type { MetadataRoute } from "next";
import { RESUME_EXAMPLES } from "@/lib/examples";
import { PROFESSIONS } from "@/lib/professions";
import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const pages = ["", "/comecar", "/importar", "/depoimentos", "/feito-para-voce", "/adaptar-vaga", "/curriculo", "/guias", "/entrevista", "/enviar-curriculo", "/modelos", "/exemplos", "/precos", "/privacidade", "/termos"];
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
    ...PROFESSIONS.map((x) => ({
      url: base + "/curriculo/" + x.slug,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...GUIDES.map((x) => ({
      url: base + "/guias/" + x.slug,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
