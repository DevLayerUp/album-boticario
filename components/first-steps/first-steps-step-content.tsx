"use client";

import { ArrowLeft } from "lucide-react";
import {
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
  const isLast = stepIndex === config.steps.length - 1;

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:min-h-0 sm:flex-1 sm:justify-between sm:gap-4 sm:p-6 md:p-8 lg:px-10 lg:py-10 lg:pl-12 xl:px-[54px] xl:py-[99px] xl:pl-[69px]">
      <div className="max-w-[519px] space-y-2 sm:min-h-0 sm:space-y-3 sm:overflow-y-auto lg:space-y-5">
        <h2 className="font-display text-xl font-bold leading-[1.3] text-verde-escuro-500 sm:text-2xl md:text-3xl lg:text-4xl xl:text-[48px] xl:leading-[1.4]">
          {step.title}
        </h2>
        <p className="text-sm leading-[1.4] text-black sm:text-base md:text-lg lg:text-xl xl:text-2xl">
          {step.description}
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst || completing}
          className={cn(
            "inline-flex items-center gap-2 rounded-pill py-1.5 text-sm font-medium transition-opacity sm:gap-2.5 sm:py-2 sm:text-base lg:text-lg xl:text-xl",
            isFirst
              ? "cursor-not-allowed text-verde-300 opacity-50"
              : "text-verde-300 hover:text-verde-400",
          )}
        >
          <ArrowLeft className="size-4 sm:size-5 lg:size-6" aria-hidden />
          {config.backLabel}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={completing}
          className={cn(
            "inline-flex min-h-10 w-full max-w-[180px] items-center justify-center rounded-pill bg-verde-escuro-500 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-verde-escuro-600 active:scale-[0.98] disabled:opacity-60 sm:min-h-11 sm:max-w-[200px] sm:px-8 sm:text-base lg:max-w-[220px] lg:text-lg xl:text-xl",
            isLast && "sm:max-w-[240px] xl:max-w-[283px] xl:shadow-[0_0_7.4px_rgba(66,165,42,0.44)]",
          )}
        >
          {completing ? "Salvando..." : isLast ? config.finishLabel : config.nextLabel}
        </button>
      </div>
    </div>
  );
}
