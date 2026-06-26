"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LandingImage } from "@/components/landing/landing-image";

export interface LandingWelcomeProps {
  titleRegular?: string;
  titleBold?:    string;
  /** Uma linha por parágrafo. */
  body?:         string;
  ctaLabel?:     string;
  ctaHref?:      string;
  imageUrl?:     string | null;
  /** Campos legados — mantidos para settings antigos no admin. */
  title?:        string;
  paragraph1?:   string;
  paragraph2?:    string;
  posterUrl?:    string | null;
}

const DEFAULT_BODY = [
  "Ser fã não é só assistir. É suar cantar junto.",
  "É perder a voz na arquibancada, vestir a camisa e ir até o apito final.",
  "A gente sabe fazer barulho por aquilo que ama.",
  "E se tem uma coisa que está no nosso sangue, é a nossa própria natureza.",
  "Cada passo, cada voz, cada escolha muda o jogo e o futuro exige impacto real.",
  "É hora de transformar toda essa nossa paixão em movimento.",
  "Por isso, decidimos criar o maior fã-clube para a nossa natureza.",
  "Porque a biodiversidade brasileira é o nosso maior orgulho.",
  "E por ela, a gente entra em campo para vencer.",
].join("\n");

function resolveParagraphs({
  body,
  paragraph1,
  paragraph2,
}: Pick<LandingWelcomeProps, "body" | "paragraph1" | "paragraph2">): string[] {
  const source = body ?? [paragraph1, paragraph2].filter(Boolean).join("\n");
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function LandingWelcome({
  titleRegular = "Vista o orgulho e ",
  titleBold    = "vibre pela nossa natureza",
  body         = DEFAULT_BODY,
  ctaLabel     = "Faça parte do Fandom",
  ctaHref      = "#fandom",
  imageUrl,
  title,
  paragraph1,
  paragraph2,
  posterUrl,
}: LandingWelcomeProps) {
  const hasSplitTitle = Boolean(titleRegular || titleBold);
  const displayImageUrl = imageUrl ?? posterUrl ?? null;
  const paragraphs = resolveParagraphs({ body, paragraph1, paragraph2 });

  return (
    <section
      id="projeto"
      className="bg-surface py-16 md:py-20 lg:py-24"
      aria-label="Boas-vindas"
    >
      <div className="mx-auto max-w-[1680px] px-6 md:px-12 2xl:px-[120px]">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-12 xl:gap-[63px]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full min-w-0 flex-col items-start gap-8 lg:max-w-[720px] lg:gap-10"
          >
            <h2 className="max-w-[469px] font-display text-3xl leading-[1.14] text-verde-escuro-500 sm:text-4xl md:text-5xl lg:text-[58px] lg:leading-[66px]">
              {hasSplitTitle ? (
                <>
                  <span className="font-normal">{titleRegular}</span>
                  <span className="font-semibold">{titleBold}</span>
                </>
              ) : (
                <span className="font-bold">{title}</span>
              )}
            </h2>

            <div className="flex w-full max-w-[651px] gap-5 sm:gap-7">
              <div
                className="hidden w-px shrink-0 self-stretch bg-verde-escuro-500/30 sm:block"
                aria-hidden
              />
              <div className="min-w-0 space-y-0 text-base leading-7 text-black sm:text-lg lg:max-w-[624px] lg:text-[18px] lg:leading-[28px]">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className={index < paragraphs.length - 1 ? "mb-0" : undefined}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <Link
              href={ctaHref}
              className="inline-flex rounded-pill bg-verde-escuro-500 px-8 py-2.5 text-base font-bold text-verde-100 transition-colors hover:bg-verde-escuro-400 sm:px-[34px] sm:py-3 sm:text-xl lg:text-2xl lg:leading-[1.4]"
            >
              {ctaLabel}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="w-full shrink-0 lg:max-w-[677px]"
          >
            {displayImageUrl ? (
              <div className="relative aspect-[677/553] w-full overflow-hidden rounded-[16px]">
                <LandingImage
                  src={displayImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 92vw, 677px"
                />
              </div>
            ) : (
              <div className="flex aspect-[677/553] w-full items-center justify-center rounded-[16px] border border-dashed border-verde-300 bg-verde-100/50 text-sm text-verde-escuro-400">
                Imagem em breve
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
