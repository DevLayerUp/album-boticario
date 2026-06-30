import { cache } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SEO_SETTINGS,
  parseSeoSettings,
  resolveAppPageTitle,
  resolveSeoRoute,
  SEO_SETTINGS_KEY,
  type ResolvedSeoRoute,
  type SeoAppPageKey,
  type SeoRouteKey,
  type SeoSettings,
} from "@/lib/seo-settings";

const PRODUCTION_SITE_URL = "https://www.faspornatureza.com.br";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/+$/, "");
  return PRODUCTION_SITE_URL;
}

/**
 * `cache` deduplica a leitura por request: layout + page chamam isto, mas só
 * dispara uma consulta ao Supabase por renderização.
 */
export const fetchSeoSettings = cache(async (): Promise<SeoSettings> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", SEO_SETTINGS_KEY)
    .maybeSingle();

  return data?.value ? parseSeoSettings(data.value) : DEFAULT_SEO_SETTINGS;
});

function buildOpenGraphImages(ogImageUrl: string | null | undefined) {
  if (!ogImageUrl) return undefined;
  return [{ url: ogImageUrl, width: 1200, height: 630, alt: "Prévia do link" }];
}

function buildRobots(
  settings: SeoSettings,
  routeNoIndex: boolean,
): Metadata["robots"] {
  const index = settings.robotsIndex && !routeNoIndex;
  const follow = settings.robotsFollow && !routeNoIndex;
  return {
    index,
    follow,
    googleBot: { index, follow },
  };
}

function buildTwitter(settings: SeoSettings, resolved: ResolvedSeoRoute): Metadata["twitter"] {
  const twitter: NonNullable<Metadata["twitter"]> = {
    card: settings.twitterCard,
    title: resolved.ogTitle,
    description: resolved.ogDescription,
  };
  if (settings.twitterSite.trim()) {
    twitter.site = settings.twitterSite.trim();
  }
  return twitter;
}

export function buildRootMetadata(settings: SeoSettings): Metadata {
  const siteUrl = getSiteUrl();
  const resolved = resolveSeoRoute(settings, "home");
  const favicon = settings.faviconUrl ?? "/images/favicon.png";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.defaultTitle,
      template: settings.titleTemplate,
    },
    description: settings.defaultDescription,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      type: "website",
      locale: "pt_BR",
      siteName: settings.siteName,
      url: siteUrl,
      images: buildOpenGraphImages(resolved.ogImageUrl),
    },
    twitter: buildTwitter(settings, resolved),
    icons: {
      icon: [{ url: favicon, type: "image/png" }],
      shortcut: favicon,
      apple: favicon,
    },
    robots: buildRobots(settings, false),
  };
}

export function buildRouteMetadata(
  settings: SeoSettings,
  route: SeoRouteKey,
  path?: string,
): Metadata {
  const resolved = resolveSeoRoute(settings, route);
  const siteUrl = getSiteUrl();
  const url = path ? new URL(path, siteUrl).toString() : siteUrl;

  return {
    title: resolved.title,
    description: resolved.metaDescription,
    alternates: {
      canonical: path ?? "/",
    },
    openGraph: {
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      type: "website",
      locale: "pt_BR",
      siteName: settings.siteName,
      url,
      images: buildOpenGraphImages(resolved.ogImageUrl),
    },
    twitter: buildTwitter(settings, resolved),
    robots: buildRobots(settings, resolved.noIndex),
  };
}

export async function buildAppPageMetadata(page: SeoAppPageKey): Promise<Metadata> {
  const settings = await fetchSeoSettings();
  return {
    title: resolveAppPageTitle(settings, page),
    robots: { index: false, follow: false },
  };
}
