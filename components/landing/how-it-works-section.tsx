"use client";

import "swiper/css";

import { LandingImage } from "@/components/landing/landing-image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

export interface HowItWorksStep {
  iconUrl:     string | null;
  title:       string;
  description: string;
}

export interface LandingHowItWorksProps {
  title?: string;
  steps?: HowItWorksStep[];
}

const DEFAULT_STEPS: HowItWorksStep[] = [
  {
    iconUrl: null,
    title: "Faça seu cadastro",
    description:
      "Crie sua conta gratuitamente e receba acesso ao álbum digital dos Fãs por Natureza.",
  },
  {
    iconUrl: null,
    title: "Abra seus pacotinhos",
    description:
      "Ganhe novos pacotes de figurinhas para descobrir espécies, biomas e curiosidades sobre a natureza brasileira.",
  },
  {
    iconUrl: null,
    title: "Cole as figurinhas",
    description: "Explore o álbum e cole as figurinhas nas páginas do álbum.",
  },
];

export function LandingHowItWorks({
  title = "Como funciona?",
  steps,
}: LandingHowItWorksProps) {
  const items     = steps?.length ? steps : DEFAULT_STEPS;
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd,       setIsEnd]       = useState(false);
  /*
   * Render Swiper only on the client so it always measures real DOM dimensions.
   * The skeleton (same card shapes) avoids layout shift during hydration.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function handleSwiper(swiper: SwiperType) {
    swiperRef.current = swiper;
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }

  function handleSlideChange(swiper: SwiperType) {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }

  return (
    <section
      id="album"
      className="overflow-x-clip bg-surface py-12 sm:py-16 md:py-24"
      aria-label="Como funciona"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 md:px-12 2xl:px-[120px]">
        {/*
         * space-y instead of flex+flex-col avoids the Swiper CSS bug:
         * .swiper has margin-left:auto; margin-right:auto which in a flex
         * container switches the item to content-sizing (instead of stretch),
         * causing a circular dependency → slide width = 11 million px.
         */}
        <div className="space-y-8 sm:space-y-10 md:space-y-[50px]">

          {/* ── Header ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <h2 className="font-display text-[22px] font-bold leading-[1.3] text-verde-escuro-500 xs:text-2xl sm:text-[24px] md:text-[26px] lg:text-[26px] xl:text-[32px] xl:leading-[1.4]">
              {title}
            </h2>

            <div className="flex shrink-0 items-center gap-4 self-end sm:gap-6 sm:self-auto">
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                disabled={isBeginning}
                aria-label="Passo anterior"
                className="text-verde-escuro-500 transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="size-7 sm:size-8" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                disabled={isEnd}
                aria-label="Próximo passo"
                className="text-verde-escuro-500 transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="size-7 sm:size-8" strokeWidth={2} />
              </button>
            </div>
          </motion.div>

          {/* ── Carousel ────────────────────────────────────────────── */}
          {mounted ? (
            /*
             * w-full is critical: overrides .swiper { margin: auto } which
             * in a block/flex context can resolve to max-content sizing and
             * produce the circular-dependency width bug.
             */
            <Swiper
              className="how-it-works-swiper w-full overflow-visible!"
              onSwiper={handleSwiper}
              onSlideChange={handleSlideChange}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={{
                480:  { slidesPerView: 1.08, spaceBetween: 20 },
                640:  { slidesPerView: 1.2,  spaceBetween: 22 },
                768:  { slidesPerView: 1.35, spaceBetween: 24 },
                1024: { slidesPerView: 2.2,  spaceBetween: 20 },
                1280: { slidesPerView: 3,    spaceBetween: 24 },
              }}
            >
              {items.map((step, index) => (
                <SwiperSlide key={`${step.title}-${index}`} className="h-auto!">
                  <StepCard step={step} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            /* SSR placeholder — same visual shape as the real cards */
            <div className="flex gap-4 overflow-hidden sm:gap-6">
              {items.map((_, index) => (
                <div
                  key={index}
                  className="h-[200px] w-full min-w-full shrink-0 rounded-card bg-verde-100 shadow-[0_4px_20px_rgba(0,0,0,0.15)] xs:h-[220px] md:h-[240px] lg:h-[280px] xl:h-[320px] 2xl:h-[387px] lg:min-w-0"
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

function StepCard({ step }: { step: HowItWorksStep }) {
  return (
    <article
      className={[
        "flex h-full w-full flex-col items-center rounded-card bg-verde-100 px-4 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)]",
        "xs:px-5 xs:py-6",
        "md:px-6 md:py-7",
        /* Notebook / desktop: horizontal; escala até 2xl (Figma) */
        "lg:flex-row lg:items-center lg:justify-center lg:gap-5 lg:px-5 lg:py-6",
        "lg:min-h-[280px]",
        "xl:min-h-[320px] xl:gap-7 xl:px-6 xl:py-7",
        "2xl:min-h-[387px] 2xl:gap-[38px] 2xl:px-8 2xl:py-8",
      ].join(" ")}
    >
      {/* Icon */}
      <div
        className={[
          "relative shrink-0",
          "h-12 w-14 xs:h-14 xs:w-16 md:h-16 md:w-[72px]",
          "lg:h-[72px] lg:w-[80px]",
          "xl:h-[88px] xl:w-[96px]",
          "2xl:h-[115px] 2xl:w-[126px]",
        ].join(" ")}
      >
        {step.iconUrl ? (
          <LandingImage
            src={step.iconUrl}
            alt=""
            fill
            className="object-contain"
            sizes="(min-width: 1536px) 126px, (min-width: 1280px) 96px, (min-width: 1024px) 80px, (min-width: 768px) 72px, 56px"
          />
        ) : (
          <div
            className="size-full rounded-[40%_60%_70%_40%/50%_40%_60%_50%] bg-verde-escuro-500/20"
            aria-hidden
          />
        )}
      </div>

      {/* Text */}
      <div
        className={[
          "mt-3 flex w-full min-w-0 flex-1 flex-col gap-2 text-center",
          "xs:mt-3.5 xs:gap-2.5 md:mt-4 md:gap-3",
          "lg:mt-0 lg:gap-3 lg:text-left",
          "xl:gap-4",
          "2xl:gap-8",
        ].join(" ")}
      >
        <h3
          className={[
            "text-balance font-display font-bold leading-snug text-verde-escuro-500",
            "text-[15px] xs:text-base md:text-base",
            "lg:text-base lg:leading-tight",
            "xl:text-lg xl:leading-snug",
            "2xl:text-[32px] 2xl:leading-[40px]",
          ].join(" ")}
        >
          {step.title}
        </h3>
        <p
          className={[
            "text-pretty leading-relaxed text-[#444444]",
            "text-xs xs:text-[13px] md:text-sm",
            "lg:text-sm lg:leading-normal",
            "xl:text-sm xl:leading-relaxed",
            "2xl:text-[22px] 2xl:leading-[31px]",
          ].join(" ")}
        >
          {step.description}
        </p>
      </div>
    </article>
  );
}
