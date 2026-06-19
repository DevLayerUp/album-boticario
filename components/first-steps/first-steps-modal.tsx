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
      className="fixed inset-0 z-[70] flex flex-col bg-[#f9f8f7]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-steps-title"
    >
      <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between px-6 py-4 sm:px-12 sm:py-5 2xl:px-[120px]">
        <Wordmark tone="dark" className="text-left" />
        <button
          type="button"
          onClick={() => void markComplete()}
          disabled={completing}
          className="text-base font-medium text-verde-escuro-500 transition-opacity hover:opacity-80 disabled:opacity-50 sm:text-2xl"
        >
          {config.skipLabel}
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="flex w-full max-w-[1200px] flex-col overflow-hidden rounded-card bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:min-h-[600px] sm:flex-row"
          >
            <FirstStepsStepVisual stepIndex={stepIndex} step={step} />
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

      <p className="pb-6 text-center text-sm font-medium text-verde-escuro-500 sm:text-lg">
        {config.footerText}
      </p>

      <span id="first-steps-title" className="sr-only">
        {step.title}
      </span>
    </div>
  );
}
