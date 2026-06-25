"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LandingImage } from "@/components/landing/landing-image";

export interface LandingJourneyProps {
  titleRegular?: string;
  titleBold?:    string;
  paragraph1?:   string;
  paragraph2?:   string;
  ctaLabel?:     string;
  ctaHref?:      string;
  imageUrl?:     string | null;
}

export function LandingJourney({
  titleRegular = "Uma jornada pela",
  titleBold    = "nossa biodiversidade",
  paragraph1   = "Se você ama descobrir curiosidades, completar coleções e explorar o mundo ao seu redor, este álbum foi feito para você.",
  paragraph2   = "Ao longo das páginas, você vai conhecer espécies fascinantes, biomas brasileiros, projetos de conservação e histórias que ajudam a proteger a natureza há mais de 35 anos.",
  ctaLabel     = "Comece a colecionar agora!",
  ctaHref      = "/register",
  imageUrl,
}: LandingJourneyProps) {
  return (
    <section
      id="jornada"
      className="bg-surface py-16 md:py-20 lg:py-24"
      aria-label="Jornada pela biodiversidade"
    >
      <div className="mx-auto max-w-[1680px] px-6 md:px-12 2xl:px-[120px]">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-[88px]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full shrink-0 lg:max-w-[550px]"
          >
            {imageUrl ? (
              <div className="relative aspect-[550/568] w-full overflow-hidden rounded-[24px] sm:rounded-[30px]">
                <LandingImage
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 92vw, 550px"
                />
              </div>
            ) : (
              <div className="flex aspect-[550/568] w-full items-center justify-center rounded-[24px] border border-dashed border-verde-300 bg-verde-100/50 text-sm text-verde-escuro-400 sm:rounded-[30px]">
                Imagem em breve
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full min-w-0 flex-col items-start gap-7 lg:max-w-[633px] lg:gap-9"
          >
            <h2 className="max-w-[429px] font-display text-3xl leading-[1.14] text-verde-500 sm:text-4xl md:text-5xl lg:text-[58px] lg:leading-[66px]">
              <span className="font-normal">{titleRegular}</span>
              <span className="font-bold"> {titleBold}</span>
            </h2>

            <div className="max-w-[476px] space-y-4 text-base leading-[1.36] text-black sm:text-lg md:text-xl lg:text-[22px] lg:leading-[30px]">
              {paragraph1 ? <p>{paragraph1}</p> : null}
              {paragraph2 ? <p>{paragraph2}</p> : null}
            </div>

            <Link
              href={ctaHref}
              className="inline-flex rounded-pill bg-verde-500 px-8 py-3 text-base font-bold text-verde-100 transition-colors hover:bg-verde-400 sm:px-[34px] sm:py-3.5 sm:text-lg lg:text-2xl lg:leading-[1.4]"
            >
              {ctaLabel}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
