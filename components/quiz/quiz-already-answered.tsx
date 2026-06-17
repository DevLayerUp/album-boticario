"use client";

import Link from "next/link";
import { ArrowLeftRight, Flag, Loader2, Package } from "lucide-react";

interface QuizAlreadyAnsweredProps {
  countdown: { hours: number; minutes: number; seconds: number };
}

export function QuizAlreadyAnswered({ countdown }: QuizAlreadyAnsweredProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1112px] flex-col items-center gap-12 sm:gap-20">
      <div className="space-y-4 text-center">
        <p className="text-5xl sm:text-[80px]" aria-hidden>
          ⏳
        </p>
        <h2 className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-5xl">
          Você já respondeu a pergunta de hoje
        </h2>
        <p className="text-lg text-black sm:text-[26px]">
          Aguarde o próximo Quiz para ganhar mais pacotinhos.
        </p>
      </div>

      <div className="w-full rounded-[24px] bg-verde-100 px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-16">
          <p className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-[40px]">
            Próximo Quiz em:
          </p>
          <div className="flex items-center gap-3 font-display text-4xl font-bold text-verde-escuro-500 sm:gap-6 sm:text-[60px]">
            <span>{countdown.hours}h</span>
            <span aria-hidden>:</span>
            <span>{countdown.minutes.toString().padStart(2, "0")}m</span>
            <span aria-hidden>:</span>
            <span>{countdown.seconds.toString().padStart(2, "0")}s</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row sm:gap-[30px]">
        <Link
          href="/pacotinhos"
          className="inline-flex items-center gap-2.5 rounded-pill bg-verde-500 px-8 py-2 text-base font-medium text-white shadow-paper transition-all duration-200 hover:bg-verde-600 active:scale-[0.98] sm:px-10 sm:text-2xl"
        >
          <Package className="size-5 sm:size-6" aria-hidden />
          Ir para meus Pacotinhos
        </Link>
        <Link
          href="/missoes"
          className="inline-flex items-center gap-2.5 rounded-pill border border-verde-500 px-8 py-2 text-base font-medium text-verde-500 transition-all duration-200 hover:bg-verde-500/10 active:scale-[0.98] sm:px-10 sm:text-2xl"
        >
          <Flag className="size-5 sm:size-6" aria-hidden />
          Completar Missões
        </Link>
        <Link
          href="/trocas"
          className="inline-flex items-center gap-2.5 rounded-pill border border-verde-500 px-8 py-2 text-base font-medium text-verde-500 transition-all duration-200 hover:bg-verde-500/10 active:scale-[0.98] sm:px-10 sm:text-2xl"
        >
          <ArrowLeftRight className="size-5 sm:size-6" aria-hidden />
          Ir para Trocas
        </Link>
      </div>
    </div>
  );
}

export function QuizLoadingState() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="size-10 animate-spin text-verde-500" aria-label="Carregando quiz" />
    </div>
  );
}

export function QuizEmptyState() {
  return (
    <div className="mx-auto max-w-lg rounded-[24px] border border-dashed border-verde-400/50 bg-verde-100/50 px-8 py-16 text-center">
      <p className="font-display text-xl font-bold text-verde-escuro-500">
        Nenhum quiz disponível
      </p>
      <p className="mt-2 text-base text-verde-escuro-300">
        Volte em breve!
      </p>
    </div>
  );
}
