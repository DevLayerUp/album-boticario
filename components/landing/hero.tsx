"use client";

import Link from "next/link";
import { LandingImage } from "@/components/landing/landing-image";
import { motion } from "framer-motion";

export interface LandingHeroProps {
  logoUrl?:       string | null;
  backgroundUrl?: string | null;
  headingWhite?:  string;
  headingYellow?: string;
  subtitle?:      string;
  ctaLabel?:      string;
  ctaHref?:       string;
}

export function LandingHero({
  logoUrl,
  backgroundUrl,
  headingWhite  = "Colecione a natureza.",
  headingYellow = "Descubra o Brasil.",
  subtitle      = "O álbum oficial dos Fãs por Natureza chegou! Complete sua coleção, conheça espécies incríveis, descubra curiosidades sobre os biomas brasileiros e explore a história da Fundação Grupo Boticário.",
  ctaLabel      = "Quero meu álbum",
  ctaHref       = "/register",
}: LandingHeroProps) {
  return (
    <section
      id="album"
      className="relative min-h-[560px] overflow-hidden md:min-h-[680px] lg:min-h-[780px]"
      style={{ backgroundColor: "#0d6632" }}
      aria-label="Seção principal"
    >
      {/* Background image */}
      {backgroundUrl && (
        <>
          <LandingImage
            src={backgroundUrl}
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        </>
      )}

      {/* Center content */}
      <div className="relative z-10 mx-auto flex max-w-[828px] flex-col items-center gap-6 px-6 pb-20 pt-16 text-center md:gap-7 md:pt-24 lg:pt-32">

        {/* Logo */}
        {logoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LandingImage
              src={logoUrl}
              alt="Fãs por Natureza"
              width={205}
              height={103}
              className="h-16 w-auto object-contain sm:h-20 md:h-24 lg:h-[103px]"
              priority
            />
          </motion.div>
        )}

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-3xl font-bold leading-[1.2] text-white sm:text-4xl md:text-[38px] lg:text-[44px] xl:text-[56px]"
        >
          <span className="font-medium">{headingWhite} </span>
          <br />
          <span className="text-amarelo">{headingYellow}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-[605px] text-sm leading-relaxed text-white/85 sm:text-base md:text-lg lg:text-xl"
        >
          {subtitle}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href={ctaHref}
            className="inline-flex rounded-pill bg-verde-500 px-8 py-3 text-base font-medium text-verde-100 transition-colors hover:bg-verde-400 sm:text-lg"
          >
            {ctaLabel}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
