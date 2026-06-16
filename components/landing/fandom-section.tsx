"use client";

import { LandingImage } from "@/components/landing/landing-image";
import Link from "next/link";
import { motion } from "framer-motion";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export interface SocialLink {
  iconUrl: string | null;
  label:   string;
  href:    string;
}

export interface LandingFandomProps {
  /** GIF animado do card superior-direito */
  gifUrl?:             string | null;
  /** @deprecated use gifUrl */
  card1Url?:           string | null;
  card2Url?:           string | null;
  heading?:            string;
  paragraph1?:         string;
  paragraph2?:         string;
  paragraph2Highlight?: string;
  paragraph3?:         string;
  ctaLabel?:           string;
  ctaHref?:            string;
  socialLinks?:        SocialLink[];
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */
const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { iconUrl: null, label: "Instagram", href: "#" },
  { iconUrl: null, label: "TikTok",    href: "#" },
  { iconUrl: null, label: "LinkedIn",  href: "#" },
  { iconUrl: null, label: "YouTube",   href: "#" },
];

/* ─── Highlight helper ───────────────────────────────────────────────────── */
function renderWithHighlight(text: string, highlight: string) {
  if (!highlight || !text) return <>{text}</>;
  const idx = text.indexOf(highlight);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-semibold text-verde-500 not-italic">
        {highlight}
      </strong>
      {text.slice(idx + highlight.length)}
    </>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function LandingFandom({
  gifUrl,
  card1Url,
  card2Url,
  heading             = "Vista a camisa e VIBRE pela nossa natureza",
  paragraph1          = "Ser fã é acompanhar, vibrar, defender e entrar em campo por aquilo em que você acredita. E quando o assunto é a natureza brasileira, toda torcida faz diferença.",
  paragraph2          = "O Somos Fãs por Natureza é uma comunidade feita para quem acredita que proteger a natureza merece a mesma paixão de quem torce pelo seu time, acompanhar seu ídolo ou celebra cada conquista.",
  paragraph2Highlight = "Somos Fãs por Natureza",
  paragraph3          = "Aqui, cada pessoa pode fazer parte dessa torcida: aprendendo, compartilhando conhecimento e descobrindo histórias inspiradoras sobre a biodiversidade brasileira.",
  ctaLabel            = "Faça parte do Fandom",
  ctaHref             = "/register",
  socialLinks,
}: LandingFandomProps) {
  const links  = socialLinks?.length ? socialLinks : DEFAULT_SOCIAL_LINKS;
  const gifSrc = gifUrl ?? card1Url;

  return (
    <section
      id="fandom"
      className="overflow-hidden bg-white py-16 md:py-24"
      aria-label="Faça parte do Fandom"
    >
      <div className="mx-auto max-w-[1680px] px-6 md:px-12 2xl:px-[120px]">
        <div className="grid grid-cols-12 items-center gap-y-12 lg:gap-6">

          {/* ── Left: collage + social row ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 flex flex-col items-center gap-10 lg:col-span-6"
          >
            {/* Collage stage — aspect ratio from Figma (786×618) */}
            <div className="relative aspect-786/618 w-full max-w-[705px]">

              {/* ── Card 1 — GIF (top-right) ──────────────────────────── */}
              <div
                aria-hidden
                className="absolute right-0 top-[4%] w-[56%] rotate-[4deg] overflow-hidden rounded-[40px]"
                style={{ aspectRatio: "4 / 3" }}
              >
                {gifSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gifSrc}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-verde-100" />
                )}
              </div>

              {/* ── Card 2 — imagem estática (bottom-left) ─────────────── */}
              <div
                aria-hidden
                className="absolute bottom-0 left-0 w-[74%] rotate-[-1.9deg] overflow-hidden rounded-[40px]"
                style={{ aspectRatio: "3 / 2" }}
              >
                {card2Url ? (
                  <LandingImage
                    src={card2Url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 52vw, 32vw"
                  />
                ) : (
                  <div className="size-full bg-verde-escuro-500/10" />
                )}
              </div>
            </div>

            {/* ── Social icons — centered row below collage ───────────── */}
            <div
              className="flex items-center justify-center gap-4"
              aria-label="Redes sociais"
            >
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="relative size-[65px] shrink-0 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-500 focus-visible:ring-offset-2"
                >
                  {link.iconUrl ? (
                    <LandingImage
                      src={link.iconUrl}
                      alt={link.label}
                      fill
                      className="object-contain"
                      sizes="65px"
                    />
                  ) : (
                    <span
                      className="flex size-full items-center justify-center rounded-full bg-verde-500/20 text-xs font-bold text-verde-escuro-500"
                      aria-hidden
                    >
                      {link.label.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </motion.div>

          {/* ── Right: text ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 flex flex-col gap-10 lg:col-span-5 lg:col-start-8"
          >
            <h2 className="font-display text-[36px] font-bold leading-tight text-verde-escuro-500 md:text-[40px]">
              {heading}
            </h2>

            <div className="space-y-5 text-[18px] leading-[30px] text-foreground md:text-[22px]">
              {paragraph1 && <p>{paragraph1}</p>}
              {paragraph2 && (
                <p>
                  {renderWithHighlight(paragraph2, paragraph2Highlight ?? "")}
                </p>
              )}
              {paragraph3 && <p>{paragraph3}</p>}
            </div>

            <Link
              href={ctaHref ?? "/register"}
              className="inline-flex w-fit items-center rounded-pill bg-verde-escuro-500 px-8 py-3 text-[20px] font-medium leading-[1.4] text-verde-100 transition-opacity hover:opacity-90"
            >
              {ctaLabel}
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
