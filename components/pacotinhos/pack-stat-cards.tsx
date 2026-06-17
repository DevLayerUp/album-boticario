"use client";

import "swiper/css";

import { useEffect, useState } from "react";
import { ArrowLeftRight, BookOpen, Package } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/use-media-query";

interface PackStatCardsProps {
  available: number;
  opened: number;
  totalStickers: number;
}

const STATS = [
  { key: "available", label: "Disponíveis", icon: Package },
  { key: "opened", label: "Abertas", icon: BookOpen },
  { key: "stickers", label: "Figurinhas", icon: ArrowLeftRight },
] as const;

type StatKey = (typeof STATS)[number]["key"];

function StatCard({
  label,
  icon: Icon,
  value,
  className,
}: {
  label: string;
  icon: typeof Package;
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-36 min-w-0 flex-col justify-between rounded-block bg-verde-100 p-4 text-verde-escuro-500 sm:h-40 lg:min-w-[272px]",
        className,
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <Icon aria-hidden className="size-7 shrink-0 sm:size-[30px]" strokeWidth={1.8} />
        <span className="text-sm font-medium uppercase tracking-wide lg:text-xl lg:leading-7">
          {label}
        </span>
      </div>
      <p className="font-display text-4xl font-bold leading-none lg:text-[48px]">{value}</p>
    </div>
  );
}

export function PackStatCards({ available, opened, totalStickers }: PackStatCardsProps) {
  const values: Record<StatKey, number> = {
    available,
    opened,
    stickers: totalStickers,
  };

  const isSmUp = useMediaQuery("(min-width: 640px)");
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-full min-w-0 lg:max-w-[848px] lg:justify-self-end">
        <div className="h-36 animate-pulse rounded-block bg-verde-100 sm:hidden" />
        <div className="hidden gap-3 sm:grid sm:grid-cols-3 sm:gap-4">
          {STATS.map(({ key }) => (
            <div key={key} className="h-40 animate-pulse rounded-block bg-verde-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isSmUp) {
    return (
      <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:max-w-[848px] lg:justify-self-end">
        {STATS.map(({ key, label, icon }) => (
          <StatCard key={key} label={label} icon={icon} value={values[key]} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-3 lg:max-w-[848px] lg:justify-self-end">
      <div className="-mx-6 px-6 sm:mx-0 sm:px-0">
        <Swiper
          className="pack-stats-swiper w-full!"
          onProgress={(_, value) => setProgress(value)}
          spaceBetween={12}
          slidesPerView={1.12}
        >
          {STATS.map(({ key, label, icon }) => (
            <SwiperSlide key={key} className="h-auto!">
              <StatCard label={label} icon={icon} value={values[key]} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="relative h-1 overflow-hidden rounded-full bg-verde-100">
        <div
          className="h-full rounded-full bg-verde-500 transition-[width] duration-300 ease-out"
          style={{ width: `${Math.max(12, progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
