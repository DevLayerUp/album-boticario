"use client";

import { useState } from "react";
import Link from "next/link";
import type { StickerPhotoTransform } from "@/lib/sticker-card";
import {
  FigurinhaOutlineButton,
} from "./figurinha-actions";
import { FigurinhaCardScaler } from "./figurinha-card-scaler";
import { PhotoUploader } from "./photo-uploader";
import { RevealStep } from "./reveal-step";
import { FigurinhaNameTag } from "./figurinha-name-tag";
import { StickerCard } from "./sticker-card";

type Step = "existing" | "upload" | "reveal";

interface StickerOnboardingProps {
  existingSticker: string | null;
  displayName: string;
}

export function StickerOnboarding({
  existingSticker,
  displayName,
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
      <div className="flex w-full flex-col items-center gap-8">
        <div className="flex w-full flex-col items-center">
          <FigurinhaCardScaler>
            <StickerCard
              stickerSrc={stickerUrl}
              photoAlt={`Figurinha de ${displayName}`}
            >
              <FigurinhaNameTag name={displayName} overlay />
            </StickerCard>
          </FigurinhaCardScaler>
        </div>

        <div className="flex w-full max-w-sm flex-col items-center gap-3">
          <Link
            href="/album"
            className="inline-flex h-11 w-full min-w-[200px] cursor-pointer items-center justify-center rounded-pill bg-amarelo px-8 text-sm font-semibold text-verde-escuro-500 transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
          >
            Ver no álbum
          </Link>
          <FigurinhaOutlineButton onClick={() => setStep("upload")}>
            Criar nova figurinha
          </FigurinhaOutlineButton>
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
        hasExistingSticker={Boolean(existingSticker)}
        onCancelRecreate={
          existingSticker
            ? () => {
                setStickerUrl(existingSticker);
                setStep("existing");
              }
            : undefined
        }
      />
    );
  }

  if (step === "reveal" && stickerUrl) {
    return (
      <RevealStep
        stickerUrl={stickerUrl}
        displayName={displayName}
        onRecreate={() => {
          setStickerUrl(null);
          setStep("upload");
        }}
      />
    );
  }

  return null;
}
