"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";
import { LandingImage } from "@/components/landing/landing-image";
import { OpenCookiePreferencesButton } from "@/components/landing/open-cookie-preferences-button";
import { GBG_PRIVACY_URL } from "@/lib/landing-urls";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type FooterSocialPlatform =
  | "youtube"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "tiktok";

export interface FooterNavLink {
  label:        string;
  href:         string;
  showChevron?: boolean;
}

export interface FooterNavItem {
  kind:       "group" | "link";
  title?:     string;
  titleHref?: string;
  label?:     string;
  href?:      string;
  links?:     FooterNavLink[];
}

export interface FooterNavColumn {
  items: FooterNavItem[];
}

export interface FooterSocialLink {
  platform?: FooterSocialPlatform;
  label:   string;
  href:    string;
}

export interface LandingFooterProps {
  logoUrl?:          string | null;
  logoHref?:         string;
  waveTopUrl?:       string | null;
  patternUrl?:       string | null;
  socialLinks?:      FooterSocialLink[];
  navColumns?:       FooterNavColumn[];
  backToTopLabel?:   string;
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */
const DEFAULT_LOGO     = "/images/landing/footer/logo.png";
const DEFAULT_WAVE_TOP = "/images/landing/footer/wave-top.png";
const DEFAULT_PATTERN  = "/images/landing/footer/pattern-left.svg";

const SOCIAL_ICON_MAP = {
  youtube:   FaYoutube,
  linkedin:  FaLinkedinIn,
  instagram: FaInstagram,
  facebook:  FaFacebookF,
  tiktok:    FaTiktok,
} as const;

export const DEFAULT_SOCIAL_LINKS: FooterSocialLink[] = [
  { platform: "youtube",   label: "YouTube",   href: "https://www.youtube.com/user/fundacaoboticario" },
  { platform: "linkedin",  label: "LinkedIn",  href: "https://www.linkedin.com/company/fundacaogrupoboticario/" },
  { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/fundacaogrupoboticario/" },
  { platform: "facebook",  label: "Facebook",  href: "https://www.facebook.com/fundacaogrupoboticario" },
  { platform: "tiktok",    label: "TikTok",    href: "https://www.tiktok.com/@fundacaogrupoboticario" },
];

const DEFAULT_NAV_COLUMNS: FooterNavColumn[] = [
  {
    items: [
      {
        kind:  "group",
        title: "Quem somos",
        links: [
          { label: "Quem somos", href: "https://fundacaogrupoboticario.org.br/quem-somos/" },
          { label: "35 anos de proteção da natureza", href: "https://fundacaogrupoboticario.org.br/35-anos/" },
          { label: "35 anos em 35 histórias", href: "https://fundacaogrupoboticario.org.br/35x35/" },
        ],
      },
      {
        kind:  "group",
        title: "Nossa atuação",
        links: [
          { label: "Nosso portfólio", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/" },
          { label: "Clima e adaptação", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/", showChevron: true },
          { label: "Oceano e costa resiliente", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/oceano-e-resiliencia-costeira/" },
          { label: "Água doce e qualidade da água", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/agua-e-seguranca-hidrica/" },
          { label: "Nossas reservas", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/nossas-reservas/" },
          { label: "Áreas naturais protegidas e restauradas", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/areas-naturais/" },
          { label: "Soluções e impacto para a natureza", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/solucoes-e-impacto/" },
        ],
      },
    ],
  },
  {
    items: [
      {
        kind:  "group",
        title: "Educação ambiental e engajamento",
        links: [
          { label: "Recursos educativos e projetos para você", href: "https://fundacaogrupoboticario.org.br/para-voce/" },
          { label: "Meu Ambiente", href: "https://fundacaogrupoboticario.org.br/para-voce/colecao-meu-ambiente/" },
          { label: "Colecionando Natureza", href: "/" },
          { label: "Plataforma de Defensores do Cerrado", href: "https://fundacaogrupoboticario.org.br/defensores-do-cerrado/" },
          { label: "Notícias, fatos e histórias", href: "https://fundacaogrupoboticario.org.br/noticias/" },
        ],
      },
      { kind: "link", label: "Biblioteca", href: "https://fundacaogrupoboticario.org.br/para-voce/biblioteca/" },
      { kind: "link", label: "Contato", href: "https://fundacaogrupoboticario.org.br/fale-conosco/" },
      { kind: "link", label: "Sala de imprensa", href: "https://fundacaogrupoboticario.org.br/sala-de-imprensa/" },
      {
        kind:      "group",
        title:     "Transparência",
        titleHref: "https://fundacaogrupoboticario.org.br/transparencia/",
        links: [
          { label: "Relatórios e publicações", href: "https://fundacaogrupoboticario.org.br/transparencia/publicacoes/" },
        ],
      },
      { kind: "link", label: "Canal de conduta", href: "https://conduta.grupoboticario.com.br/" },
    ],
  },
];

function inferPlatform(label: string): FooterSocialPlatform | null {
  const key = label.trim().toLowerCase();
  if (key.includes("youtube"))   return "youtube";
  if (key.includes("linkedin"))  return "linkedin";
  if (key.includes("instagram")) return "instagram";
  if (key.includes("facebook"))  return "facebook";
  if (key.includes("tiktok"))    return "tiktok";
  return null;
}

function resolvePlatform(link: FooterSocialLink): FooterSocialPlatform | null {
  return link.platform ?? inferPlatform(link.label);
}

function FooterDecorImage({ src, className }: { src: string; className: string }) {
  return (
  // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} aria-hidden />
  );
}

function SocialIcon({ platform }: { platform: FooterSocialPlatform }) {
  const Icon = SOCIAL_ICON_MAP[platform];
  return (
    <span className="flex size-[31px] items-center justify-center rounded-full border border-[#027235] text-[#027235]">
      <Icon className="size-3.5" aria-hidden />
    </span>
  );
}

function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function FooterNavLinkItem({ link }: { link: FooterNavLink }) {
  const className = "text-sm leading-[22.4px] text-[#027235] transition-opacity hover:opacity-75 sm:text-base";

  if (link.showChevron) {
    return (
      <span className="flex items-center gap-2">
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {link.label}
        </a>
        <ChevronDown size={9} className="shrink-0 text-[#027235]" aria-hidden />
      </span>
    );
  }

  if (isExternal(link.href)) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

function NavGroup({
  title,
  titleHref,
  links,
}: {
  title:     string;
  titleHref?: string;
  links:     FooterNavLink[];
}) {
  const titleClass = "pb-[1.41px] text-sm font-bold leading-[22.4px] text-[#027235] sm:text-base";

  return (
    <div className="flex flex-col gap-0 pt-[13px]">
      {titleHref ? (
        <a
          href={titleHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${titleClass} transition-opacity hover:opacity-75`}
        >
          {title}
        </a>
      ) : (
        <p className={titleClass}>{title}</p>
      )}
      {links.map((link) => (
        <div key={`${title}-${link.label}`} className="pb-[1.41px]">
          <FooterNavLinkItem link={link} />
        </div>
      ))}
    </div>
  );
}

function NavStandaloneLink({ label, href }: { label: string; href: string }) {
  const className = "pt-3 text-sm font-bold leading-[22.4px] text-[#027235] transition-opacity hover:opacity-75 sm:text-base";

  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function LandingFooter({
  logoUrl,
  logoHref         = "https://fundacaogrupoboticario.org.br/",
  waveTopUrl,
  patternUrl,
  socialLinks,
  navColumns,
  backToTopLabel   = "Voltar ao topo",
}: LandingFooterProps) {
  const logo    = logoUrl ?? DEFAULT_LOGO;
  const wave    = waveTopUrl ?? DEFAULT_WAVE_TOP;
  const pattern = patternUrl ?? DEFAULT_PATTERN;
  const socials = socialLinks?.length ? socialLinks : DEFAULT_SOCIAL_LINKS;
  const columns = navColumns?.length ? navColumns : DEFAULT_NAV_COLUMNS;

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="relative" aria-label="Rodapé">
      {/* Onda decorativa superior */}
      <div className="pointer-events-none absolute top-[-68px] left-0 right-0 z-20 h-[68px] overflow-hidden">
        <FooterDecorImage
          src={wave}
          className="h-full w-full object-cover object-bottom"
        />
      </div>

      {/* Padrão decorativo — ancorado ao layout do Figma (fora do container estreito) */}
      <div
        className="pointer-events-none absolute bottom-[0] z-0 hidden h-[520px] w-[765px] lg:block"
        style={{ left: "max(0px, calc((100% - 1230px) / 2 - 700px))" }}
        aria-hidden
      >
        <FooterDecorImage
          src={pattern}
          className="h-full w-full object-contain object-left-bottom"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1230px] px-6 md:px-[15px]">
        <div className="relative grid gap-12 pb-[100px] pt-20 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-[200px]">
          {/* Coluna esquerda — logo e redes */}
          <div className="flex flex-col gap-[50px]">
            <a
              href={logoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block max-w-[346px] pt-5 transition-opacity hover:opacity-90"
              aria-label="Fundação Grupo Boticário"
            >
              <LandingImage
                src={logo}
                alt="Fundação Grupo Boticário de proteção à natureza"
                width={346}
                height={101}
                className="h-auto w-full max-w-[346px] object-contain"
              />
            </a>

            <ul className="flex flex-wrap items-center gap-[15px]" role="list">
              {socials.map((social) => {
                const platform = resolvePlatform(social);
                return (
                  <li key={`${social.label}-${social.href}`}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="block transition-opacity hover:opacity-75"
                    >
                      {platform ? (
                        <SocialIcon platform={platform} />
                      ) : (
                        <span className="flex size-[31px] items-center justify-center rounded-full border border-[#027235] text-xs text-[#027235]">
                          {social.label.charAt(0)}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Coluna direita — navegação */}
          <div className="flex flex-col gap-[15px]">
            <div className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
              {columns.map((column, colIdx) => (
                <div key={colIdx} className="flex flex-col">
                  {column.items.map((item, itemIdx) => {
                    if (item.kind === "group" && item.title && item.links) {
                      return (
                        <NavGroup
                          key={`${colIdx}-group-${itemIdx}`}
                          title={item.title}
                          titleHref={item.titleHref}
                          links={item.links}
                        />
                      );
                    }
                    if (item.kind === "link" && item.label && item.href) {
                      return (
                        <NavStandaloneLink
                          key={`${colIdx}-link-${itemIdx}`}
                          label={item.label}
                          href={item.href}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
            </div>

            <div className="flex flex-col items-end gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <nav
                aria-label="Links legais"
                className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#027235]"
              >
                <a
                  href={GBG_PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-75"
                >
                  Política de Privacidade
                </a>
                <span className="hidden text-[#027235]/40 sm:inline" aria-hidden>
                  |
                </span>
                <OpenCookiePreferencesButton className="transition-opacity hover:opacity-75" />
              </nav>

              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2.5 rounded-pill bg-[#027235] px-4 py-2.5 text-[13.3px] text-white transition-colors hover:bg-verde-escuro-500"
              >
                <ChevronUp size={14} strokeWidth={2.5} aria-hidden />
                {backToTopLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
