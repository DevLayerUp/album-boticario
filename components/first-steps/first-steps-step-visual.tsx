"use client";

import Image from "next/image";
import {
  panelThemeClass,
  type FirstStepsStepConfig,
} from "@/lib/first-steps";
import { cn } from "@/lib/utils";

interface FirstStepsStepVisualProps {
  stepIndex: number;
  step: FirstStepsStepConfig;
  totalSteps: number;
}

function ProgressBars({
  activeIndex,
  totalSteps,
}: {
  activeIndex: number;
  totalSteps: number;
}) {
  return (
    <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-start gap-1 sm:bottom-4 sm:left-4 sm:gap-1.5 lg:bottom-5 2xl:bottom-[31px] 2xl:left-6 2xl:gap-[5.75px]">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 min-w-0 flex-1 rounded-pill sm:h-1.5 lg:h-2 2xl:h-[11px]",
            i === activeIndex ? "bg-white" : "bg-white/60",
          )}
          style={{ maxWidth: "70px" }}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function FirstStepsStepVisual({
  stepIndex,
  step,
  totalSteps,
}: FirstStepsStepVisualProps) {
  return (
    <div
      className={cn(
        "relative aspect-[5/3] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-full sm:min-h-0 sm:flex-[0_0_38%] sm:max-w-[380px] lg:max-w-[420px] 2xl:flex-[0_0_499px] 2xl:max-w-[499px]",
        panelThemeClass(step.panelTheme),
      )}
    >
      {step.backgroundImage ? (
        <Image
          src={step.backgroundImage}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 499px"
          priority={stepIndex === 0}
          unoptimized={step.backgroundImage.endsWith(".gif")}
        />
      ) : null}

      <div
        className="absolute left-3 top-3 z-10 rounded-pill border border-white bg-black/15 px-2.5 py-1 text-[9px] font-medium tracking-[0.08em] text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] backdrop-blur-[2px] sm:left-4 sm:top-4 sm:px-3.5 sm:py-1.5 sm:text-[10px] lg:px-4 lg:py-1.5 lg:text-[11px] 2xl:left-[19px] 2xl:top-[21px] 2xl:px-5 2xl:py-2 2xl:text-xs 2xl:tracking-[0.06em]"
        aria-label={`Passo ${stepIndex + 1} de ${totalSteps}`}
      >
        PASSO <span className="font-bold">{stepIndex + 1}</span> DE{" "}
        <span className="font-bold">{totalSteps}</span>
      </div>

      <ProgressBars activeIndex={stepIndex} totalSteps={totalSteps} />
    </div>
  );
}
