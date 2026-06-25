"use client";

import { useEffect, useRef, useState } from "react";
import { STICKER_CARD } from "@/lib/sticker-card";
import { cn } from "@/lib/utils";

interface FigurinhaCardScalerProps {
  children: React.ReactNode;
  className?: string;
}

/** Escala o card 352×503 para caber em telas estreitas sem quebrar posicionamento interno. */
export function FigurinhaCardScaler({ children, className }: FigurinhaCardScalerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setScale(Math.min(1, el.clientWidth / STICKER_CARD.width));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scaledHeight = STICKER_CARD.height * scale;

  return (
    <div ref={containerRef} className={cn("w-full max-w-[352px]", className)}>
      <div
        className="relative mx-auto"
        style={{
          width: STICKER_CARD.width * scale,
          height: scaledHeight,
        }}
      >
        <div
          style={{
            width: STICKER_CARD.width,
            height: STICKER_CARD.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
