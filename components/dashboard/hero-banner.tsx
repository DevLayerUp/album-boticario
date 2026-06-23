import { cn } from "@/lib/utils";

interface HeroBannerProps {
  /** Texto pequeno acima do título. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /**
   * Caminho da imagem de fundo (ver `lib/dashboard-assets.ts`).
   * Renderizada via CSS `background-image`: se o arquivo não existir, apenas o
   * fundo verde-escuro aparece — sem ícone de imagem quebrada.
   */
  backgroundImage?: string;
  /** Botões de ação (CTAs). */
  children?: React.ReactNode;
  className?: string;
}

/** Banner principal da dashboard — fundo verde-escuro com slot de imagem. */
export function HeroBanner({
  eyebrow,
  title,
  subtitle,
  backgroundImage,
  children,
  className,
}: HeroBannerProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-card bg-verde-escuro-500 px-7 py-10 md:px-12 md:py-14",
        className,
      )}
    >
      {backgroundImage && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat md:bg-contain md:bg-right"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          {/* Legibilidade do texto quando a arte invade a área esquerda (< 1200px). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] hidden bg-gradient-to-r from-verde-escuro-500 from-45% via-verde-escuro-500/75 via-70% to-transparent max-[1399px]:block"
          />
        </>
      )}

      <div className="relative z-10 max-w-xl">
        {eyebrow && (
          <p className="text-lg leading-snug text-verde-200 md:text-2xl">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-4xl font-bold leading-tight text-white md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-md text-base leading-relaxed text-white md:text-lg">
            {subtitle}
          </p>
        )}
        {children && (
          <div className="mt-7 flex flex-wrap gap-3">{children}</div>
        )}
      </div>
    </section>
  );
}
