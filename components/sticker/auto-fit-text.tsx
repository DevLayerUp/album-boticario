"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AutoFitTextProps {
  children: React.ReactNode;
  /** Chave que muda quando o conteúdo muda (ex.: o texto cru), para re-ajustar. */
  contentKey?: string;
  minFontSize?: number;
  maxFontSize?: number;
  lineHeight?: number;
  className?: string;
  textClassName?: string;
}

/**
 * Ajusta o tamanho da fonte para o texto caber na altura/largura disponíveis,
 * evitando scroll. Faz busca binária entre min e maxFontSize e reobserva
 * mudanças de tamanho do container.
 */
export function AutoFitText({
  children,
  contentKey,
  minFontSize = 9,
  maxFontSize = 16,
  lineHeight = 1.4,
  className,
  textClassName,
}: AutoFitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fits = (size: number) => {
      text.style.fontSize = `${size}px`;
      return (
        text.scrollHeight <= container.clientHeight &&
        text.scrollWidth <= container.clientWidth
      );
    };

    const fit = () => {
      if (container.clientHeight === 0) return;

      if (fits(maxFontSize)) {
        text.style.fontSize = "";
        setFontSize(maxFontSize);
        return;
      }

      let lo = minFontSize;
      let hi = maxFontSize;
      let best = minFontSize;
      while (hi - lo >= 0.5) {
        const mid = (lo + hi) / 2;
        if (fits(mid)) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
      text.style.fontSize = "";
      setFontSize(Math.floor(best * 2) / 2);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    return () => ro.disconnect();
  }, [contentKey, minFontSize, maxFontSize]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center justify-center overflow-hidden",
        className,
      )}
    >
      <p
        ref={textRef}
        className={cn("wrap-break-word text-center", textClassName)}
        style={{ fontSize, lineHeight }}
      >
        {children}
      </p>
    </div>
  );
}
