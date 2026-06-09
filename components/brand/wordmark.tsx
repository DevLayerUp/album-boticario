import { cn } from "@/lib/utils";

/** Marca textual do projeto — usa a fonte display (Fraunces). */
export function Wordmark({
  className,
  subtitle,
}: {
  className?: string;
  subtitle?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <p className="font-display text-3xl font-semibold leading-none text-white">
        Álbum
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-gb-gold">
        Grupo Boticário
      </p>
      {subtitle && (
        <p className="mt-3 text-sm text-gb-cream/80">{subtitle}</p>
      )}
    </div>
  );
}
