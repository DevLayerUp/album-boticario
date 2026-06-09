"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Analisando a foto…",
  "Removendo o fundo…",
  "Aplicando a moldura…",
  "Salvando sua figurinha…",
];

// Duração de cada passo (ms) — o último espera a API responder
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
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      {/* Card animado da figurinha sendo gerada */}
      <div className="relative flex h-56 w-40 items-center justify-center">
        {/* Brilho pulsante atrás */}
        <div className="absolute inset-0 animate-pulse rounded-2xl bg-gb-gold/20 blur-xl" />

        {/* Card da figurinha */}
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gb-gold/30 bg-gb-green shadow-xl shadow-black/40">
          {/* Padrão de fundo do verso */}
          <BackPattern />

          {/* Logo central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <GBDiamond />
              <span className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-gb-gold">
                Grupo Boticário
              </span>
            </div>
          </div>

          {/* Shimmer sweep */}
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      {/* Steps com checkmarks */}
      <div className="flex w-full flex-col gap-3">
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
                    ? "bg-gb-gold text-gb-green-deep"
                    : isActive
                      ? "border border-gb-gold/60 bg-gb-gold/10"
                      : "border border-white/20 bg-white/5"
                }`}
              >
                {isDone ? (
                  <CheckIcon />
                ) : isActive ? (
                  <SpinnerDot />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                )}
              </span>

              <span
                className={`text-sm font-medium ${
                  isDone
                    ? "text-gb-gold"
                    : isActive
                      ? "text-white"
                      : "text-white/40"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-white/40">
        Isso pode levar alguns segundos…
      </p>
    </div>
  );
}

/* ─── Subcomponentes visuais ──────────────────────────────────────── */

function BackPattern() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-15"
      viewBox="0 0 160 220"
      aria-hidden
    >
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 6 }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * 28 + 10}
            cy={row * 30 + 12}
            r="3"
            fill="#D9A441"
          />
        )),
      )}
    </svg>
  );
}

function GBDiamond() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <polygon
        points="18,3 33,18 18,33 3,18"
        fill="none"
        stroke="#D9A441"
        strokeWidth="1.5"
      />
      <polygon
        points="18,8 28,18 18,28 8,18"
        fill="#D9A441"
        fillOpacity="0.25"
        stroke="#D9A441"
        strokeWidth="1"
      />
    </svg>
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
      className="h-2.5 w-2.5 animate-spin rounded-full border border-gb-gold border-t-transparent"
      aria-label="Processando"
    />
  );
}
