export const SEO_SETTINGS_KEY = "seo_settings";

export type SeoTwitterCard = "summary" | "summary_large_image";

export type SeoRouteKey =
  | "home"
  | "login"
  | "register"
  | "registerSenha"
  | "esqueciSenha"
  | "redefinirSenha";

export type SeoAppPageKey =
  | "dashboard"
  | "album"
  | "colecao"
  | "pacotinhos"
  | "quiz"
  | "missoes"
  | "ranking"
  | "trocas"
  | "figurinha"
  | "perfil";

export const SEO_ROUTE_LABELS: Record<
  SeoRouteKey,
  { label: string; path: string; usesTitleTemplate: boolean }
> = {
  home: { label: "Landing (início)", path: "/", usesTitleTemplate: false },
  login: { label: "Login", path: "/login", usesTitleTemplate: true },
  register: { label: "Cadastro", path: "/register", usesTitleTemplate: true },
  registerSenha: {
    label: "Criar senha",
    path: "/register/senha",
    usesTitleTemplate: true,
  },
  esqueciSenha: {
    label: "Esqueci minha senha",
    path: "/esqueci-senha",
    usesTitleTemplate: true,
  },
  redefinirSenha: {
    label: "Redefinir senha",
    path: "/redefinir-senha",
    usesTitleTemplate: true,
  },
};

export const SEO_APP_PAGE_LABELS: Record<
  SeoAppPageKey,
  { label: string; path: string }
> = {
  dashboard: { label: "Início (dashboard)", path: "/dashboard" },
  album: { label: "Álbum", path: "/album" },
  colecao: { label: "Coleção", path: "/colecao" },
  pacotinhos: { label: "Pacotinhos", path: "/pacotinhos" },
  quiz: { label: "Quiz do Dia", path: "/quiz" },
  missoes: { label: "Missões", path: "/missoes" },
  ranking: { label: "Ranking", path: "/ranking" },
  trocas: { label: "Trocas", path: "/trocas" },
  figurinha: { label: "Minha Figurinha", path: "/figurinha" },
  perfil: { label: "Meu Perfil", path: "/perfil" },
};

/** Configuração SEO por rota pública. Campos vazios herdam os valores globais. */
export interface SeoRouteConfig {
  /** Título curto na aba (parte antes do sufixo do site, quando há template). */
  tabTitle: string;
  /** Título completo para Google e tag &lt;title&gt;; vazio = usa tabTitle (+ template se aplicável). */
  seoTitle: string;
  /** Meta description exibida no Google e buscadores. */
  metaDescription: string;
  ogImageUrl: string | null;
  ogTitle: string;
  ogDescription: string;
  noIndex: boolean;
}

export interface SeoAppPageConfig {
  tabTitle: string;
}

export interface SeoSettings {
  siteName: string;
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImageUrl: string | null;
  faviconUrl: string | null;
  themeColor: string;
  twitterCard: SeoTwitterCard;
  twitterSite: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  routes: Record<SeoRouteKey, SeoRouteConfig>;
  appPages: Record<SeoAppPageKey, SeoAppPageConfig>;
}

const EMPTY_ROUTE: SeoRouteConfig = {
  tabTitle: "",
  seoTitle: "",
  metaDescription: "",
  ogImageUrl: null,
  ogTitle: "",
  ogDescription: "",
  noIndex: false,
};

export const DEFAULT_APP_PAGES: Record<SeoAppPageKey, SeoAppPageConfig> = {
  dashboard: { tabTitle: "Início" },
  album: { tabTitle: "Álbum" },
  colecao: { tabTitle: "Coleção" },
  pacotinhos: { tabTitle: "Pacotinhos" },
  quiz: { tabTitle: "Quiz do Dia" },
  missoes: { tabTitle: "Missões" },
  ranking: { tabTitle: "Ranking" },
  trocas: { tabTitle: "Trocas" },
  figurinha: { tabTitle: "Minha Figurinha" },
  perfil: { tabTitle: "Meu Perfil" },
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  siteName: "Álbum GB",
  titleTemplate: "%s · Álbum Grupo Boticário",
  defaultTitle: "Álbum de Figurinhas — Grupo Boticário",
  defaultDescription:
    "Crie sua figurinha personalizada, abra pacotinhos e complete o álbum digital do Grupo Boticário.",
  defaultOgImageUrl: null,
  faviconUrl: "/images/favicon.svg",
  themeColor: "#0d6632",
  twitterCard: "summary_large_image",
  twitterSite: "",
  robotsIndex: true,
  robotsFollow: true,
  routes: {
    home: {
      tabTitle: "Álbum Digital de Figurinhas — Grupo Boticário",
      seoTitle: "",
      metaDescription:
        "Crie sua figurinha personalizada, abra pacotinhos, complete coleções e troque figurinhas com outros fãs do Grupo Boticário.",
      ogImageUrl: null,
      ogTitle: "",
      ogDescription: "",
      noIndex: false,
    },
    login: { ...EMPTY_ROUTE, tabTitle: "Entrar" },
    register: { ...EMPTY_ROUTE, tabTitle: "Criar conta" },
    registerSenha: { ...EMPTY_ROUTE, tabTitle: "Criar senha" },
    esqueciSenha: { ...EMPTY_ROUTE, tabTitle: "Esqueci minha senha" },
    redefinirSenha: { ...EMPTY_ROUTE, tabTitle: "Redefinir senha" },
  },
  appPages: { ...DEFAULT_APP_PAGES },
};

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return typeof value === "string" ? value : null;
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** Compatível com configs antigas que usavam `title` e `description`. */
function parseRouteConfig(raw: unknown, fallback: SeoRouteConfig): SeoRouteConfig {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const o = raw as Record<string, unknown>;
  const legacyTitle = typeof o.title === "string" ? o.title : "";
  const legacyDescription = typeof o.description === "string" ? o.description : "";

  return {
    tabTitle: asString(o.tabTitle ?? legacyTitle, fallback.tabTitle),
    seoTitle: asString(o.seoTitle, fallback.seoTitle),
    metaDescription: asString(
      o.metaDescription ?? legacyDescription,
      fallback.metaDescription,
    ),
    ogImageUrl: asNullableString(o.ogImageUrl) ?? fallback.ogImageUrl,
    ogTitle: asString(o.ogTitle, fallback.ogTitle),
    ogDescription: asString(o.ogDescription, fallback.ogDescription),
    noIndex: asBool(o.noIndex, fallback.noIndex),
  };
}

function parseAppPageConfig(
  raw: unknown,
  fallback: SeoAppPageConfig,
): SeoAppPageConfig {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const o = raw as Record<string, unknown>;
  return {
    tabTitle: asString(o.tabTitle, fallback.tabTitle),
  };
}

export function parseSeoSettings(raw: string | null | undefined): SeoSettings {
  if (!raw) return DEFAULT_SEO_SETTINGS;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const defaults = DEFAULT_SEO_SETTINGS;
    const routesRaw =
      data.routes && typeof data.routes === "object"
        ? (data.routes as Record<string, unknown>)
        : {};
    const appPagesRaw =
      data.appPages && typeof data.appPages === "object"
        ? (data.appPages as Record<string, unknown>)
        : {};

    const twitterCard = data.twitterCard;
    const card: SeoTwitterCard =
      twitterCard === "summary" || twitterCard === "summary_large_image"
        ? twitterCard
        : defaults.twitterCard;

    const routeKeys = Object.keys(SEO_ROUTE_LABELS) as SeoRouteKey[];
    const appPageKeys = Object.keys(SEO_APP_PAGE_LABELS) as SeoAppPageKey[];

    return {
      siteName: asString(data.siteName, defaults.siteName),
      titleTemplate: asString(data.titleTemplate, defaults.titleTemplate),
      defaultTitle: asString(data.defaultTitle, defaults.defaultTitle),
      defaultDescription: asString(data.defaultDescription, defaults.defaultDescription),
      defaultOgImageUrl:
        asNullableString(data.defaultOgImageUrl) ?? defaults.defaultOgImageUrl,
      faviconUrl: asNullableString(data.faviconUrl) ?? defaults.faviconUrl,
      themeColor: asString(data.themeColor, defaults.themeColor),
      twitterCard: card,
      twitterSite: asString(data.twitterSite, defaults.twitterSite),
      robotsIndex: asBool(data.robotsIndex, defaults.robotsIndex),
      robotsFollow: asBool(data.robotsFollow, defaults.robotsFollow),
      routes: Object.fromEntries(
        routeKeys.map((key) => [
          key,
          parseRouteConfig(routesRaw[key], defaults.routes[key]),
        ]),
      ) as Record<SeoRouteKey, SeoRouteConfig>,
      appPages: Object.fromEntries(
        appPageKeys.map((key) => [
          key,
          parseAppPageConfig(appPagesRaw[key], defaults.appPages[key]),
        ]),
      ) as Record<SeoAppPageKey, SeoAppPageConfig>,
    };
  } catch {
    return DEFAULT_SEO_SETTINGS;
  }
}

export interface ResolvedSeoRoute {
  /** Valor enviado a metadata.title no Next.js. */
  title: string;
  /** Título completo exibido na aba e no Google (com template aplicado). */
  fullTitle: string;
  tabTitle: string;
  seoTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string | null;
  noIndex: boolean;
}

export function applyTitleTemplate(template: string, pageTitle: string): string {
  if (!template.includes("%s")) return pageTitle;
  return template.replace("%s", pageTitle);
}

/** Prévia dos valores globais (aba Geral) — reflete os inputs, sem override da rota Home. */
export function resolveGlobalSeoPreview(settings: SeoSettings): {
  title: string;
  description: string;
  ogImageUrl: string | null;
  siteName: string;
} {
  return {
    title: settings.defaultTitle.trim() || DEFAULT_SEO_SETTINGS.defaultTitle,
    description:
      settings.defaultDescription.trim() || DEFAULT_SEO_SETTINGS.defaultDescription,
    ogImageUrl: settings.defaultOgImageUrl,
    siteName: settings.siteName.trim() || DEFAULT_SEO_SETTINGS.siteName,
  };
}

export function resolveSeoRoute(
  settings: SeoSettings,
  route: SeoRouteKey,
): ResolvedSeoRoute {
  const routeConfig = settings.routes[route];
  const routeMeta = SEO_ROUTE_LABELS[route];

  const tabTitle =
    routeConfig.tabTitle.trim() ||
    (route === "home" ? settings.defaultTitle : "");
  const seoTitle = routeConfig.seoTitle.trim();
  const metaDescription =
    routeConfig.metaDescription.trim() || settings.defaultDescription;

  const title = seoTitle || tabTitle || settings.defaultTitle;

  const fullTitle =
    seoTitle ||
    (routeMeta.usesTitleTemplate && tabTitle
      ? applyTitleTemplate(settings.titleTemplate, tabTitle)
      : tabTitle || settings.defaultTitle);

  const ogTitle = routeConfig.ogTitle.trim() || fullTitle;
  const ogDescription = routeConfig.ogDescription.trim() || metaDescription;
  const ogImageUrl = routeConfig.ogImageUrl ?? settings.defaultOgImageUrl;

  return {
    title,
    fullTitle,
    tabTitle,
    seoTitle,
    metaDescription,
    ogTitle,
    ogDescription,
    ogImageUrl,
    noIndex: routeConfig.noIndex,
  };
}

export function resolveAppPageTitle(
  settings: SeoSettings,
  page: SeoAppPageKey,
): string {
  const custom = settings.appPages[page]?.tabTitle.trim();
  if (custom) return custom;
  return DEFAULT_APP_PAGES[page].tabTitle;
}

export function resolveAppPageFullTitle(
  settings: SeoSettings,
  page: SeoAppPageKey,
): string {
  const tabTitle = resolveAppPageTitle(settings, page);
  return applyTitleTemplate(settings.titleTemplate, tabTitle);
}
