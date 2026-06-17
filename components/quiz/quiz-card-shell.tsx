import Image from "next/image";
import { dashboardAssets } from "@/lib/dashboard-assets";

interface QuizCardShellProps {
  rewardLabel: string;
  children: React.ReactNode;
}

export function QuizCardShell({ rewardLabel, children }: QuizCardShellProps) {
  return (
    <div className="relative mx-auto w-full max-w-[828px] overflow-hidden rounded-[24px] bg-verde-escuro-500 px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={dashboardAssets.quiz.background}
          alt=""
          fill
          sizes="828px"
          className="object-cover opacity-60"
          unoptimized
        />
      </div>

      <div className="relative z-10 flex flex-col gap-8 sm:gap-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="text-base text-verde-200 sm:text-2xl">Pergunta do dia</span>
          <span className="w-fit rounded-pill border border-amarelo px-5 py-1.5 text-sm font-medium text-amarelo sm:px-10 sm:py-2 sm:text-base">
            {rewardLabel}
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}
