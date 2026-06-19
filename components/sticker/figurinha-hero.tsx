import Image from "next/image";
import { dashboardAssets } from "@/lib/dashboard-assets";

interface FigurinhaHeroProps {
  firstName: string;
  hasSticker: boolean;
}

export function FigurinhaHero({ firstName, hasSticker }: FigurinhaHeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-verde-500 2xl:min-h-[280px]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={dashboardAssets.quiz.background}
          alt=""
          fill
          className="object-cover opacity-20"
          unoptimized
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-2 px-6 py-8 sm:py-10 2xl:px-[120px] 2xl:py-14">
        <p className="text-[10px] uppercase tracking-[0.12em] text-verde-100 sm:text-xs">
          Minha figurinha
        </p>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl 2xl:text-[40px]">
          {hasSticker ? `Olá, ${firstName}!` : "Crie sua figurinha"}
        </h1>
        <p className="max-w-xl text-sm text-verde-100 sm:text-base">
          {hasSticker
            ? "Atualize sua foto ou veja como ficou sua figurinha personalizada."
            : "Envie uma foto com boa iluminação. O fundo será removido e aplicado ao card da coleção."}
        </p>
      </div>
    </section>
  );
}
