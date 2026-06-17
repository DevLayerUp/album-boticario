"use client";

import "swiper/css";

import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import { useMediaQuery } from "@/lib/use-media-query";
import { AvailablePackCard } from "./available-pack-card";
import type { Pack } from "./types";

interface AvailablePacksCarouselProps {
  packs: Pack[];
  packImageUrl: string;
  onOpen: (pack: Pack) => void;
}

const DESKTOP_CAROUSEL_MIN = 4;

export function AvailablePacksCarousel({
  packs,
  packImageUrl,
  onOpen,
}: AvailablePacksCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  const isLgUp = useMediaQuery("(min-width: 1024px)");

  const useCarousel = !isLgUp || packs.length >= DESKTOP_CAROUSEL_MIN;

  useEffect(() => setMounted(true), []);

  function syncSwiper(swiper: SwiperType) {
    swiperRef.current = swiper;
    setCanAdvance(!swiper.isEnd);
  }

  function handleProgress(swiper: SwiperType, value: number) {
    setProgress(value);
    setCanAdvance(!swiper.isEnd);
  }

  if (!mounted) {
    return (
      <div className="h-[min(48vh,560px)] w-full max-w-[484px] animate-pulse rounded-[32px] bg-verde-100 lg:max-w-none" />
    );
  }

  if (!useCarousel) {
    return (
      <div className="hidden gap-[25px] lg:grid lg:grid-cols-3">
        {packs.map((pack, i) => (
          <AvailablePackCard
            key={pack.id}
            pack={pack}
            packImageUrl={packImageUrl}
            index={i}
            onOpen={() => onOpen(pack)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="relative overflow-hidden">
        <div className="-mx-6 px-6 lg:mx-0 lg:px-0">
          <Swiper
            className="packs-swiper w-full!"
            onSwiper={syncSwiper}
            onSlideChange={syncSwiper}
            onResize={syncSwiper}
            onProgress={handleProgress}
            spaceBetween={16}
            slidesPerView={1.05}
            breakpoints={{
              480: { slidesPerView: 1.12, spaceBetween: 16 },
              640: { slidesPerView: 1.25, spaceBetween: 20 },
              768: { slidesPerView: 1.4, spaceBetween: 20 },
              1024: { slidesPerView: 2.1, spaceBetween: 22 },
              1280: { slidesPerView: 2.65, spaceBetween: 25 },
              1536: { slidesPerView: 3, spaceBetween: 25 },
            }}
          >
            {packs.map((pack, i) => (
              <SwiperSlide key={pack.id} className="h-auto!">
                <AvailablePackCard
                  pack={pack}
                  packImageUrl={packImageUrl}
                  index={i}
                  onOpen={() => onOpen(pack)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-surface via-surface/80 to-transparent sm:w-20 lg:w-28"
          aria-hidden
        />

        {packs.length > 1 && (
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            disabled={!canAdvance}
            aria-label="Próximo pacotinho"
            className="absolute right-0 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center text-verde-escuro-500 transition-opacity disabled:cursor-not-allowed disabled:opacity-30 sm:right-1 sm:size-11"
          >
            <ChevronRight className="size-7 sm:size-8" strokeWidth={2} />
          </button>
        )}
      </div>

      {packs.length > 1 && (
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-verde-100">
          <div
            className="h-full rounded-full bg-verde-500 transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
