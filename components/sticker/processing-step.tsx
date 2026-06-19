"use client";

import { useEffect, useState } from "react";
import { StickerCard } from "./sticker-card";

const STEPS = [
  "Analisando a foto…",
  "Removendo o fundo…",
  "Aplicando ao card…",
  "Salvando sua figurinha…",
];

const STEP_DURATIONS = [1400, 2000, 1800, Infinity];

export function ProcessingStep() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= STEPS.length - 1) return;
    const duration = STEP_DURATIONS[currentStep];
    if (duration === Infinity) return;

    const t = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, duration);

    return () => clearTimeout(t);
  }, [currentStep]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
      <div className="w-full space-y-2 text-center sm:text-left">
        <h2 className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-[34px]">
          Gerando figurinha
        </h2>
        <p className="text-sm text-verde-escuro-500/80 sm:text-base">
          Aguarde enquanto preparamos sua figurinha personalizada.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-8 rounded-block bg-verde-100 p-6 sm:p-10">
        <div className="relative">
          <div className="absolute -inset-3 animate-pulse rounded-2xl bg-verde-500/15 blur-lg" />
          <StickerCard>
            <div className="pointer-events-none absolute inset-0 z-20 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </StickerCard>
        </div>

        <div className="flex w-full max-w-md flex-col gap-3">
          {STEPS.map((label, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;

            return (
              <div
                key={label}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  i > currentStep ? "opacity-30" : "opacity-100"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                    isDone
                      ? "bg-verde-500 text-white"
                      : isActive
                        ? "border border-verde-500 bg-white text-verde-500"
                        : "border border-verde-200 bg-white text-verde-200"
                  }`}
                >
                  {isDone ? (
                    <CheckIcon />
                  ) : isActive ? (
                    <SpinnerDot />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-verde-200" />
                  )}
                </span>

                <span
                  className={`text-sm font-medium ${
                    isDone
                      ? "text-verde-500"
                      : isActive
                        ? "text-verde-escuro-500"
                        : "text-verde-escuro-500/40"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-verde-escuro-500/60">
          Isso pode levar alguns segundos…
        </p>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}

function SpinnerDot() {
  return (
    <span
      className="h-2.5 w-2.5 animate-spin rounded-full border border-verde-500 border-t-transparent"
      aria-label="Processando"
    />
  );
}
