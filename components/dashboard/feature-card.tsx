import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureTheme = "green" | "blue" | "gold";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  /** Texto do botão (ex.: "Criar", "Visualizar"). */
  cta: string;
  theme: FeatureTheme;
  /**
   * Caminho da imagem do header (ver `lib/dashboard-assets.ts`).
   * Renderizada via CSS `background-image`: se o arquivo não existir, apenas a
   * cor sólida do tema aparece — sem ícone de imagem quebrada.
   */
  backgroundImage?: string;
}

const themeConfig: Record<
  FeatureTheme,
  { headerFallback: string; body: string; title: string; button: string }
> = {
  green: {
    headerFallback: "bg-verde-500",
    body: "bg-surface-green",
    title: "text-verde-escuro-500",
    button: "bg-verde-500 text-white group-hover:bg-verde-escuro-500",
  },
  blue: {
    headerFallback: "bg-azul-500",
    body: "bg-surface-blue",
    title: "text-azul-escuro-500",
    button: "bg-azul-500 text-white group-hover:bg-azul-escuro-500",
  },
  gold: {
    headerFallback: "bg-gold-500",
    body: "bg-surface-gold",
    title: "text-gold-700",
    button: "bg-gold-500 text-white group-hover:bg-gold-700",
  },
};

/** Card da seção "Explorar" — header com imagem + corpo temático. */
export function FeatureCard({
  title,
  description,
  href,
  cta,
  theme,
  backgroundImage,
}: FeatureCardProps) {
  const t = themeConfig[theme];

  return (
    <Link
      href={href}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-card shadow-card transition-transform duration-300 hover:-translate-y-1"
    >
      {/* Header — slot de imagem com fallback colorido pelo tema */}
      <div className={cn("relative h-[228px] w-full overflow-hidden", t.headerFallback)}>
        {backgroundImage && (
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
      </div>

      {/* Corpo */}
      <div className={cn("flex flex-1 flex-col gap-6 p-6", t.body)}>
        <div>
          <h3 className={cn("font-display text-2xl font-bold", t.title)}>
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-verde-escuro-capa/70">
            {description}
          </p>
        </div>

        <span
          className={cn(
            "inline-flex h-11 w-full items-center justify-center gap-2 rounded-pill font-medium transition-colors duration-200",
            t.button,
          )}
        >
          {cta}
          <ArrowUpRight aria-hidden className="size-4" strokeWidth={2.2} />
        </span>
      </div>
    </Link>
  );
}
