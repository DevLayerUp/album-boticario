"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  FIRST_STEPS_TOTAL,
  type FirstStepsConfig,
  type FirstStepsStepConfig,
} from "@/lib/first-steps";
import { cn } from "@/lib/utils";

interface FirstStepsStepContentProps {
  stepIndex: number;
  step: FirstStepsStepConfig;
  config: FirstStepsConfig;
  onBack: () => void;
  onNext: () => void;
  completing: boolean;
}

export function FirstStepsStepContent({
  stepIndex,
  step,
  config,
  onBack,
  onNext,
  completing,
}: FirstStepsStepContentProps) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === FIRST_STEPS_TOTAL - 1;

  return (
    <div className="flex w-full flex-1 flex-col justify-between gap-8 p-6 sm:gap-10 sm:p-10 lg:p-12">
      <div className="space-y-6 sm:space-y-10">
        <div className="space-y-4 sm:space-y-5">
          <h2 className="font-display text-2xl font-bold leading-tight text-verde-escuro-500 sm:text-4xl lg:text-[48px]">
            {step.title}
          </h2>
          <p className="text-base leading-relaxed text-black sm:text-xl lg:text-2xl">
            {step.description}
          </p>
        </div>

        <ul className="space-y-3 sm:space-y-3.5">
          {[step.bullet1, step.bullet2].map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 sm:gap-4">
              <CheckCircle2
                className="mt-0.5 size-5 shrink-0 text-verde-500 sm:size-6"
                aria-hidden
              />
              <span className="text-sm leading-relaxed text-[#636363] sm:text-lg">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst || completing}
          className={cn(
            "inline-flex items-center gap-2 rounded-pill py-2 text-base font-medium transition-opacity sm:text-xl",
            isFirst
              ? "cursor-not-allowed text-verde-300 opacity-50"
              : "text-verde-300 hover:text-verde-400",
          )}
        >
          <ArrowLeft className="size-5 sm:size-6" aria-hidden />
          {config.backLabel}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={completing}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-verde-escuro-500 px-8 py-2 text-base font-medium text-white transition-all hover:bg-verde-escuro-600 active:scale-[0.98] disabled:opacity-60 sm:min-w-[220px] sm:text-xl",
            isLast && "min-w-[220px] shadow-[0_0_7.4px_rgba(66,165,42,0.44)] sm:min-w-[283px]",
          )}
        >
          {completing ? "Salvando..." : isLast ? config.finishLabel : config.nextLabel}
          {isLast ? <ArrowRight className="size-4 sm:size-5" aria-hidden /> : null}
        </button>
      </div>
    </div>
  );
}
