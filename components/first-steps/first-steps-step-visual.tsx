"use client";

import Image from "next/image";
import {
  FIRST_STEPS_TOTAL,
  panelThemeClass,
  type FirstStepsStepConfig,
} from "@/lib/first-steps";
import { cn } from "@/lib/utils";

interface FirstStepsStepVisualProps {
  stepIndex: number;
  step: FirstStepsStepConfig;
}

function ProgressBars({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center gap-3 px-8 sm:bottom-10 sm:gap-4">
      {Array.from({ length: FIRST_STEPS_TOTAL }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-[7px] max-w-[142px] flex-1 rounded-pill sm:h-[11px]",
            i === activeIndex ? "bg-white" : "bg-white/60",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function FirstStepsStepVisual({ stepIndex, step }: FirstStepsStepVisualProps) {
  const badgeLight = step.badgeVariant === "light";

  return (
    <div
      className={cn(
        "relative min-h-[220px] w-full overflow-hidden sm:min-h-0 sm:w-[44%] sm:shrink-0",
        panelThemeClass(step.panelTheme),
      )}
    >
      {step.backgroundImage ? (
        <Image
          src={step.backgroundImage}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 530px"
          priority={stepIndex === 0}
          unoptimized={step.backgroundImage.endsWith(".gif")}
        />
      ) : null}

      <div
        className={cn(
          "absolute left-4 top-4 z-10 rounded-pill border px-4 py-1.5 text-xs font-medium tracking-[0.06em]",
          badgeLight
            ? "border-verde-100 text-verde-100"
            : "border-verde-escuro-500 text-verde-escuro-500",
        )}
      >
        PASSO <span className="font-bold">{stepIndex + 1}</span> DE{" "}
        <span className="font-bold">{FIRST_STEPS_TOTAL}</span>
      </div>

      <div className="relative min-h-[220px] w-full sm:min-h-[600px]">
        <ProgressBars activeIndex={stepIndex} />
      </div>
    </div>
  );
}
