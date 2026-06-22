"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { dashboardAssets } from "@/lib/dashboard-assets";

interface WordmarkProps {
  className?: string;
  subtitle?: string;
  /** Classes extras no logotipo (ex.: tamanho na página de login). */
  logoClassName?: string;
  /** "light" = texto claro (fundo escuro) · "dark" = texto escuro (fundo claro). */
  tone?: "light" | "dark";
  /** Tenta exibir o logotipo; cai para o texto se a imagem não existir. */
  showLogo?: boolean;
}

/**
 * Marca "Fãs da Natureza".
 *
 * Renderiza o logotipo (`lib/dashboard-assets.ts → logo`) quando disponível e,
 * enquanto a imagem não for importada, exibe um fallback textual on-brand.
 */
export function Wordmark({
  className,
  subtitle,
  logoClassName,
  tone = "light",
  showLogo = true,
}: WordmarkProps) {
  const [logoOk, setLogoOk] = useState(true);

  const titleColor = tone === "light" ? "text-white" : "text-verde-escuro-500";
  const kickerColor = tone === "light" ? "text-amarelo" : "text-verde-500";
  const subtitleColor =
    tone === "light" ? "text-white/80" : "text-verde-escuro-500/70";

  return (
    <div className={cn("text-center", className)}>
      {showLogo && logoOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dashboardAssets.logo}
          alt="Fãs da Natureza"
          className={cn("h-10 w-auto", logoClassName)}
          onError={() => setLogoOk(false)}
        />
      ) : (
        <span className="block leading-none">
          <span
            className={cn(
              "block font-display text-3xl font-extrabold uppercase tracking-tight",
              titleColor,
            )}
          >
            Fãs da Natureza
          </span>
          <span
            className={cn(
              "mt-1 block text-[11px] font-bold uppercase tracking-[0.25em]",
              kickerColor,
            )}
          >
            Grupo Boticário
          </span>
        </span>
      )}

      {subtitle && (
        <p className={cn("mt-4 text-base", subtitleColor)}>{subtitle}</p>
      )}
    </div>
  );
}
