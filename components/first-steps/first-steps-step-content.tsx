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
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-start pt-[10%] pb-[11%] pl-4 pr-3 sm:pt-[12%] sm:pb-[12%] sm:pl-5 sm:pr-4 md:pl-6 lg:pt-[14%] lg:pb-[13%] lg:pl-8 lg:pr-6 2xl:pt-[99px] 2xl:pb-[86px] 2xl:pl-[69px] 2xl:pr-[54px]">
      <div className="flex min-h-0 w-full max-w-[519px] flex-1 flex-col justify-between 2xl:h-[415px] 2xl:flex-none">
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto sm:gap-3.5 lg:gap-4 2xl:gap-[19px]">
          <h2 className="font-display text-lg font-bold leading-[1.3] text-verde-escuro-500 sm:text-xl md:text-2xl lg:text-3xl 2xl:text-[48px] 2xl:leading-[1.4]">
            {step.title}
          </h2>
          <p className="text-xs leading-[1.4] text-black sm:text-sm md:text-base lg:text-lg 2xl:text-2xl">
            {step.description}
          </p>
        </div>

        <div className="mt-4 flex w-full shrink-0 items-center justify-between gap-2.5 sm:mt-0 sm:gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst || completing}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-pill py-1 text-xs font-medium transition-opacity sm:gap-2 sm:py-1.5 sm:text-sm lg:text-base 2xl:text-xl",
            isFirst
              ? "cursor-not-allowed text-verde-300 opacity-50"
              : "text-verde-300 hover:text-verde-400",
          )}
        >
          <ArrowLeft className="size-3.5 sm:size-4 lg:size-5 2xl:size-6" aria-hidden />
          {config.backLabel}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={completing}
          className={cn(
            "inline-flex min-h-9 w-full max-w-[150px] items-center justify-center rounded-pill bg-verde-escuro-500 px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-verde-escuro-600 active:scale-[0.98] disabled:opacity-60 sm:min-h-10 sm:max-w-[170px] sm:px-5 sm:py-2 sm:text-sm lg:max-w-[190px] lg:text-base 2xl:min-h-11 2xl:max-w-[283px] 2xl:px-8 2xl:text-xl",
            isLast && "2xl:shadow-[0_0_7.4px_rgba(66,165,42,0.44)]",
          )}
        >
          {completing ? "Salvando..." : isLast ? config.finishLabel : config.nextLabel}
        </button>
        </div>
      </div>
    </div>
  );
}
