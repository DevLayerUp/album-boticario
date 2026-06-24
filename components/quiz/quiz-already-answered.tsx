"use client";

import Link from "next/link";
import { ArrowLeftRight, Flag, Loader2, Package } from "lucide-react";

interface QuizAlreadyAnsweredProps {
  countdown: { hours: number; minutes: number; seconds: number };
}

export function QuizAlreadyAnswered({ countdown }: QuizAlreadyAnsweredProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1112px] flex-col items-center gap-6 sm:gap-8 lg:gap-10 2xl:gap-20">
      <div className="space-y-2 text-center sm:space-y-3 2xl:space-y-4">
        <p className="text-4xl sm:text-5xl lg:text-6xl 2xl:text-[80px]" aria-hidden>
          ⏳
        </p>
        <h2 className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-3xl 2xl:text-5xl">
          Você já respondeu a pergunta de hoje
        </h2>
        <p className="text-sm text-black sm:text-base lg:text-lg 2xl:text-[26px]">
          Aguarde o próximo Quiz para ganhar mais pacotinhos.
        </p>
      </div>

      <div className="w-full rounded-[20px] bg-verde-100 px-4 py-4 sm:rounded-[24px] sm:px-6 sm:py-5 lg:px-8 lg:py-6 2xl:py-8">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6 lg:gap-8 2xl:gap-16">
          <p className="font-display text-lg font-bold text-verde-escuro-500 sm:text-xl lg:text-2xl 2xl:text-[40px]">
            Próximo Quiz em:
          </p>
          <div className="flex items-center gap-2 font-display text-2xl font-bold text-verde-escuro-500 sm:gap-3 sm:text-3xl lg:text-4xl 2xl:gap-6 2xl:text-[60px]">
            <span>{countdown.hours}h</span>
            <span aria-hidden>:</span>
            <span>{countdown.minutes.toString().padStart(2, "0")}m</span>
            <span aria-hidden>:</span>
            <span>{countdown.seconds.toString().padStart(2, "0")}s</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-wrap items-center justify-center gap-2 sm:flex-row sm:gap-3 lg:gap-4 2xl:gap-[30px]">
        <Link
          href="/pacotinhos"
          className="inline-flex items-center gap-2 rounded-pill bg-verde-500 px-5 py-1.5 text-xs font-medium text-white shadow-paper transition-all duration-200 hover:bg-verde-600 active:scale-[0.98] sm:px-6 sm:py-2 sm:text-sm lg:text-base 2xl:px-10 2xl:text-2xl"
        >
          <Package className="size-4 sm:size-5 2xl:size-6" aria-hidden />
          Ir para meus Pacotinhos
        </Link>
        <Link
          href="/missoes"
          className="inline-flex items-center gap-2 rounded-pill border border-verde-500 px-5 py-1.5 text-xs font-medium text-verde-500 transition-all duration-200 hover:bg-verde-500/10 active:scale-[0.98] sm:px-6 sm:py-2 sm:text-sm lg:text-base 2xl:px-10 2xl:text-2xl"
        >
          <Flag className="size-4 sm:size-5 2xl:size-6" aria-hidden />
          Completar Missões
        </Link>
        <Link
          href="/trocas"
          className="inline-flex items-center gap-2 rounded-pill border border-verde-500 px-5 py-1.5 text-xs font-medium text-verde-500 transition-all duration-200 hover:bg-verde-500/10 active:scale-[0.98] sm:px-6 sm:py-2 sm:text-sm lg:text-base 2xl:px-10 2xl:text-2xl"
        >
          <ArrowLeftRight className="size-4 sm:size-5 2xl:size-6" aria-hidden />
          Ir para Trocas
        </Link>
      </div>
    </div>
  );
}

export function QuizLoadingState() {
  return (
    <div className="flex justify-center py-12 2xl:py-20">
      <Loader2 className="size-8 animate-spin text-verde-500 2xl:size-10" aria-label="Carregando quiz" />
    </div>
  );
}

export function QuizEmptyState() {
  return (
    <div className="mx-auto max-w-lg rounded-[20px] border border-dashed border-verde-400/50 bg-verde-100/50 px-6 py-10 text-center sm:rounded-[24px] sm:px-8 sm:py-12 2xl:py-16">
      <p className="font-display text-lg font-bold text-verde-escuro-500 sm:text-xl 2xl:text-xl">
        Nenhum quiz disponível
      </p>
      <p className="mt-2 text-sm text-verde-escuro-300 sm:text-base">
        Volte em breve!
      </p>
    </div>
  );
}
