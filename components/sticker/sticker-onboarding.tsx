"use client";

import { useState } from "react";
import Link from "next/link";
import type { StickerPhotoTransform } from "@/lib/sticker-card";
import { PhotoUploader } from "./photo-uploader";
import { RevealStep } from "./reveal-step";
import { StickerCard } from "./sticker-card";

type Step = "existing" | "upload" | "reveal";

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
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (cutoutBlob: Blob, transform: StickerPhotoTransform) => {
    setApiError(null);
    setGenerating(true);

    const formData = new FormData();
    formData.append("cutout", cutoutBlob, "cutout.png");
    formData.append("offset_x", String(transform.offsetX));
    formData.append("offset_y", String(transform.offsetY));
    formData.append("scale", String(transform.scale));

    try {
      const res = await fetch("/api/sticker/generate", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type") ?? "";
      const json = contentType.includes("application/json")
        ? ((await res.json()) as { sticker_url?: string; error?: string })
        : null;

      if (!res.ok) {
        setApiError(json?.error ?? "Algo deu errado. Tente novamente.");
        return;
      }

      if (!json?.sticker_url) {
        setApiError("Resposta inválida do servidor.");
        return;
      }

      setStickerUrl(json.sticker_url);
      setStep("reveal");
    } catch {
      setApiError("Falha de conexão ao gerar a figurinha. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  if (step === "existing" && stickerUrl) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
        <div className="w-full space-y-2 text-center sm:text-left">
          <h2 className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-[34px]">
            Sua figurinha atual
          </h2>
          <p className="text-sm text-verde-escuro-500/80 sm:text-base">
            Olá, {firstName}! Esta é a figurinha que aparece no seu perfil e no álbum.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-6 rounded-block bg-verde-100 p-6 sm:p-10">
          <StickerCard stickerSrc={stickerUrl} photoAlt="Sua figurinha" />

          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-pill bg-amarelo px-6 font-medium text-verde-escuro-500 transition-all hover:brightness-95 active:scale-[0.98]"
            >
              Ir para o álbum
            </Link>
            <button
              type="button"
              onClick={() => setStep("upload")}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-pill border border-verde-500 px-6 font-medium text-verde-500 transition-colors hover:bg-verde-500/10 active:scale-[0.98]"
            >
              Recriar figurinha
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "upload") {
    return (
      <PhotoUploader
        onGenerate={handleGenerate}
        generating={generating}
        error={apiError}
      />
    );
  }

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
