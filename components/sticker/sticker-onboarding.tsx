"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhotoUploader } from "./photo-uploader";
import { ProcessingStep } from "./processing-step";
import { RevealStep } from "./reveal-step";

type Step = "existing" | "upload" | "processing" | "reveal";

interface StickerOnboardingProps {
  existingSticker: string | null;
  firstName: string;
}

export function StickerOnboarding({
  existingSticker,
  firstName,
}: StickerOnboardingProps) {
  const [step, setStep] = useState<Step>(
    existingSticker ? "existing" : "upload",
  );
  const [stickerUrl, setStickerUrl] = useState<string | null>(existingSticker);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setApiError(null);
    setStep("processing");

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch("/api/sticker/generate", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setApiError(json.error ?? "Algo deu errado. Tente novamente.");
        setStep("upload");
        return;
      }

      setStickerUrl(json.sticker_url);
      setStep("reveal");
    } catch {
      setApiError("Erro de conexão. Verifique sua internet e tente novamente.");
      setStep("upload");
    }
  };

  /* ── Tela: figurinha já existe ────────────────────────────────────── */
  if (step === "existing" && stickerUrl) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-gb-gold">
            Sua figurinha
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-white">
            Olá, {firstName}!
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Você já criou sua figurinha. Veja como ficou!
          </p>
        </div>

        {/* Figurinha existente */}
        <div className="relative h-[275px] w-[200px] overflow-hidden rounded-2xl border-2 border-gb-gold/50 shadow-2xl shadow-gb-gold/20">
          <Image
            src={stickerUrl}
            alt="Sua figurinha"
            fill
            className="object-cover"
            sizes="200px"
            priority
          />
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full rounded-full bg-gb-gold px-6 py-3.5 text-center font-semibold text-gb-green-deep shadow-lg shadow-gb-gold/25 transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            Ir para o álbum 🚀
          </Link>
          <button
            type="button"
            onClick={() => setStep("upload")}
            className="w-full rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/60 transition-all duration-200 hover:border-white/40 hover:text-white"
          >
            Recriar figurinha
          </button>
        </div>
      </div>
    );
  }

  /* ── Tela: upload ─────────────────────────────────────────────────── */
  if (step === "upload") {
    return (
      <PhotoUploader
        onUpload={handleUpload}
        error={apiError}
      />
    );
  }

  /* ── Tela: processando ────────────────────────────────────────────── */
  if (step === "processing") {
    return <ProcessingStep />;
  }

  /* ── Tela: reveal ─────────────────────────────────────────────────── */
  if (step === "reveal" && stickerUrl) {
    return (
      <RevealStep
        stickerUrl={stickerUrl}
        onRecreate={() => {
          setStickerUrl(null);
          setStep("upload");
        }}
      />
    );
  }

  return null;
}
