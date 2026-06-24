import { BookOpen, Package, Trophy } from "lucide-react";

const RULES = [
  {
    icon: BookOpen,
    title: "Colecione e pontue",
    description: "Cada figurinha colada no álbum aumenta o seu placar.",
  },
  {
    icon: Trophy,
    title: "Missões e trocas",
    description:
      "Concluir missões, responder corretamente o quiz e trocar figurinhas repetidas multiplica seus pontos.",
  },
  {
    icon: Package,
    title: "Abra menos pacotes",
    description:
      "Quanto menos pacotinhos precisar para completar seu álbum, maior será sua pontuação.",
  },
] as const;

export function RankingScoringInfo() {
  return (
    <section className="rounded-card border border-verde-200 bg-surface-green py-4 pl-3 pr-2 sm:py-5 sm:pl-4 sm:pr-3 lg:pl-5 2xl:py-8 2xl:pl-[26px]">
      <div className="space-y-0.5 text-verde-escuro-500 sm:space-y-1">
        <p className="text-xs font-medium sm:text-sm 2xl:text-base">Quer subir no ranking dos Fãs por Natureza?</p>
        <p className="font-display text-base font-bold sm:text-lg lg:text-xl 2xl:text-2xl">
          Olha como funciona a pontuação:
        </p>
      </div>

      <ul className="mt-3 space-y-3 sm:mt-4 2xl:space-y-4">
        {RULES.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex gap-2.5 sm:gap-3 2xl:gap-4">
            <Icon
              className="mt-0.5 size-5 shrink-0 text-verde-escuro-500 sm:size-6 2xl:size-7"
              strokeWidth={1.8}
              aria-hidden
            />
            <div className="min-w-0 text-verde-escuro-500">
              <p className="text-sm font-semibold sm:text-base 2xl:text-lg">{title}</p>
              <p className="text-xs leading-relaxed sm:text-sm">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
