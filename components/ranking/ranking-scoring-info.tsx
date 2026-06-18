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
    <section className="rounded-card border border-verde-200 bg-surface-green py-6 pl-4 pr-3 sm:py-8 sm:pl-[26px] sm:pr-3">
      <div className="space-y-1 text-verde-escuro-500">
        <p className="text-sm font-medium sm:text-base">Quer subir no ranking dos Fãs por Natureza?</p>
        <p className="font-display text-lg font-bold sm:text-xl lg:text-2xl">
          Olha como funciona a pontuação:
        </p>
      </div>

      <ul className="mt-4 space-y-4">
        {RULES.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex gap-3 sm:gap-4">
            <Icon
              className="mt-0.5 size-6 shrink-0 text-verde-escuro-500 sm:size-7"
              strokeWidth={1.8}
              aria-hidden
            />
            <div className="min-w-0 text-verde-escuro-500">
              <p className="text-base font-semibold sm:text-lg">{title}</p>
              <p className="text-sm leading-relaxed sm:text-sm">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
