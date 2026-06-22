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
    <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-start gap-1 sm:bottom-6 sm:left-6 sm:gap-1.5 lg:bottom-8 xl:bottom-[31px]">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 min-w-0 flex-1 rounded-pill sm:h-2 lg:h-[11px]",
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
  const badgeLight = step.badgeVariant === "light";

  return (
    <div
      className={cn(
        "relative aspect-[5/3] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-auto sm:min-h-0 sm:flex-[0_0_42%] sm:max-w-[499px]",
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
        className={cn(
          "absolute left-4 top-4 z-10 rounded-pill border px-3 py-1.5 text-[10px] font-medium tracking-[0.06em] sm:left-5 sm:top-5 sm:px-5 sm:py-2 sm:text-xs",
          badgeLight
            ? "border-verde-100 text-verde-100"
            : "border-verde-escuro-500 text-verde-escuro-500",
        )}
      >
        PASSO <span className="font-bold">{stepIndex + 1}</span> DE{" "}
        <span className="font-bold">{totalSteps}</span>
      </div>

      <ProgressBars activeIndex={stepIndex} totalSteps={totalSteps} />
    </div>
  );
}
