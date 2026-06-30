import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo-metadata";

/**
 * Apenas rotas públicas e indexáveis entram no sitemap.
 * As páginas internas (/dashboard, /album, /pacotinhos, …) são `noindex`
 * e ficam atrás de autenticação, por isso não são listadas aqui.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
