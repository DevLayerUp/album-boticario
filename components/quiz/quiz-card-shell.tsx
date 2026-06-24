import Image from "next/image";
import { dashboardAssets } from "@/lib/dashboard-assets";

interface QuizCardShellProps {
  rewardLabel: string;
  children: React.ReactNode;
}

export function QuizCardShell({ rewardLabel, children }: QuizCardShellProps) {
  return (
    <div className="relative mx-auto w-full max-w-[828px] overflow-hidden rounded-[20px] bg-verde-escuro-500 px-3 pb-4 pt-3 sm:rounded-[24px] sm:px-4 sm:pb-5 sm:pt-4 lg:px-5 lg:pb-6 lg:pt-5 2xl:px-6 2xl:pb-10 2xl:pt-8">
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

      <div className="relative z-10 flex flex-col gap-3 sm:gap-4 lg:gap-5 2xl:gap-10">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <span className="text-xs text-verde-200 sm:text-sm lg:text-base 2xl:text-2xl">
            Pergunta do dia
          </span>
          <span className="w-fit rounded-pill border border-amarelo px-3 py-1 text-[11px] font-medium text-amarelo sm:px-4 sm:text-xs lg:text-sm 2xl:px-10 2xl:py-2 2xl:text-base">
            {rewardLabel}
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}
