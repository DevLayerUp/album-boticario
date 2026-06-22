"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wordmark } from "@/components/brand/wordmark";
import type { FirstStepsConfig } from "@/lib/first-steps";
import { FirstStepsStepContent } from "./first-steps-step-content";
import { FirstStepsStepVisual } from "./first-steps-step-visual";

interface FirstStepsModalProps {
  config: FirstStepsConfig;
  onComplete: () => void;
}

export function FirstStepsModal({ config, onComplete }: FirstStepsModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [completing, setCompleting] = useState(false);

  const step = config.steps[stepIndex];

  const markComplete = useCallback(async () => {
    setCompleting(true);
    try {
      const res = await fetch("/api/first-steps/complete", { method: "POST" });
      if (!res.ok) {
        throw new Error("Não foi possível salvar o progresso");
      }
      onComplete();
    } catch {
      setCompleting(false);
    }
  }, [onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !completing) {
        void markComplete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [completing, markComplete]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function handleNext() {
    if (stepIndex < config.steps.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    void markComplete();
  }

  function handleBack() {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex h-dvh flex-col overflow-hidden bg-[#f9f8f7]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-steps-title"
    >
      <header className="mx-auto flex w-full max-w-[1680px] shrink-0 items-center justify-between px-4 py-3 sm:px-8 sm:py-4 lg:px-12 xl:px-[120px] xl:py-5">
        <Wordmark
          tone="dark"
          className="text-left"
          logoClassName="h-9 sm:h-11 lg:h-16 xl:h-20"
        />
        <button
          type="button"
          onClick={() => void markComplete()}
          disabled={completing}
          className="shrink-0 text-sm font-medium text-verde-escuro-500 transition-opacity hover:opacity-80 disabled:opacity-50 sm:text-base lg:text-xl xl:text-2xl"
        >
          {config.skipLabel}
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-3 py-2 sm:overflow-hidden sm:px-6 sm:py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="flex w-full max-w-[1200px] shrink-0 flex-col overflow-hidden rounded-card bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:h-full sm:max-h-[min(600px,calc(100dvh-7.5rem))] sm:flex-row"
          >
            <FirstStepsStepVisual
              stepIndex={stepIndex}
              step={step}
              totalSteps={config.steps.length}
            />
            <FirstStepsStepContent
              stepIndex={stepIndex}
              step={step}
              config={config}
              onBack={handleBack}
              onNext={handleNext}
              completing={completing}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="shrink-0 px-4 pb-3 pt-1 text-center text-xs font-medium text-verde-escuro-500 sm:pb-4 sm:text-sm lg:pb-5 lg:text-base xl:pb-6 xl:text-[18px]">
        {config.footerText}
      </p>

      <span id="first-steps-title" className="sr-only">
        {step.title}
      </span>
    </div>
  );
}
