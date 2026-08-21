"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dashboardAssets } from "@/lib/dashboard-assets";
import { parseApiError } from "@/components/ui/feedback-toast";

const assets = dashboardAssets.bonus10k;

export function Bonus10kPopup() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    if (claiming) return;
    setOpen(false);
  }, [claiming]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function handleClaim() {
    if (claiming) return;
    setClaiming(true);
    setError(null);
    try {
      const res = await fetch("/api/bonus-10k/claim", { method: "POST" });
      if (!res.ok) {
        throw new Error(await parseApiError(res, "Não foi possível resgatar o pacote."));
      }
      setOpen(false);
      router.push("/pacotinhos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível resgatar o pacote.");
      setClaiming(false);
    }
  }

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[65] flex items-stretch justify-center p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4 lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bonus-10k-title"
    >
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 cursor-pointer bg-verde-escuro-capa/55 backdrop-blur-[8px] disabled:cursor-not-allowed"
        onClick={close}
        disabled={claiming}
      />

      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 320, damping: 28 }
        }
        className="relative flex h-full max-h-[min(100dvh-1.5rem,760px)] w-full max-w-[1176px] flex-col overflow-hidden rounded-card border-2 border-verde-500 bg-[#efffeb] shadow-[0_16px_32px_rgba(0,0,0,0.25)] sm:max-h-[min(90dvh,730px)] lg:h-auto lg:flex-row"
      >
        <button
          type="button"
          onClick={close}
          disabled={claiming}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-20 size-10 shrink-0 cursor-pointer rounded-full shadow-[0_0_0_2px_#fff] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 sm:right-4 sm:top-4 sm:size-11 lg:right-7 lg:top-9 lg:size-[46px] lg:shadow-none"
        >
          <img
            src={assets.close}
            alt=""
            width={46}
            height={46}
            className="size-full"
          />
        </button>

        <div className="relative isolate h-[min(28dvh,200px)] shrink-0 overflow-hidden bg-verde-escuro-500 min-[400px]:h-[min(32dvh,240px)] sm:h-[280px] lg:h-auto lg:w-[48%] lg:min-h-0 lg:self-stretch landscape:max-lg:h-[min(38dvh,168px)]">
          <div className="absolute inset-0 bg-verde-escuro-500" />
          <div className="absolute inset-0 overflow-hidden opacity-[0.26]">
            <img
              src={assets.grid}
              alt=""
              className="absolute left-[-3.41%] top-[-26.05%] h-[148.27%] w-[117.34%] max-w-none object-cover"
            />
          </div>

          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-pill bg-amarelo px-3 py-1 shadow-[0_4px_4px_rgba(0,0,0,0.15)] min-[400px]:top-3.5 min-[400px]:px-3.5 min-[400px]:py-1.5 sm:top-5 sm:px-4 sm:py-2 lg:top-10">
            <p className="whitespace-nowrap font-display text-[11px] font-bold uppercase text-verde-escuro-capa min-[400px]:text-xs sm:text-lg lg:text-2xl">
              Pacote Bônus
            </p>
          </div>

          <div className="absolute inset-0 overflow-hidden">
            <img
              src={assets.jiboia}
              alt=""
              width={255}
              height={359}
              className="absolute left-[-14%] top-[22%] w-[38%] max-w-[180px] -rotate-[13.29deg] object-cover min-[400px]:left-[-10%] min-[400px]:w-[40%] sm:left-[-8%] sm:top-[18%] sm:max-w-[220px] lg:left-[-6%] lg:top-[17%] lg:w-[44%] lg:max-w-[255px]"
            />
            <img
              src={assets.papagaio}
              alt=""
              width={255}
              height={359}
              className="absolute right-[-16%] top-[12%] w-[36%] max-w-[170px] rotate-[9.13deg] object-cover min-[400px]:right-[-10%] min-[400px]:w-[38%] sm:right-[-6%] sm:top-[8%] sm:max-w-[220px] lg:right-[-4%] lg:top-[14%] lg:w-[44%] lg:max-w-[255px]"
            />
            <img
              src={assets.onca}
              alt=""
              width={254}
              height={358}
              className="absolute bottom-[-28%] right-[-18%] w-[40%] max-w-[170px] rotate-[16.05deg] object-cover min-[400px]:bottom-[-22%] min-[400px]:right-[-14%] sm:bottom-[-18%] sm:right-[-10%] sm:max-w-[220px] lg:bottom-[-4%] lg:right-[-8%] lg:w-[48%] lg:max-w-[254px]"
            />
            <div className="absolute left-1/2 top-[26%] w-[42%] max-w-[168px] -translate-x-1/2 -rotate-[5.12deg] min-[400px]:top-[24%] min-[400px]:w-[46%] min-[400px]:max-w-[196px] sm:top-[26%] sm:w-[48%] sm:max-w-[240px] lg:top-[27%] lg:w-[55%] lg:max-w-[316px]">
              <div className="overflow-hidden rounded-[10px] border-2 border-white shadow-[0_-8px_24px_12px_rgba(0,0,0,0.22)] sm:rounded-block sm:border-[2.5px] sm:shadow-[0_-14px_40px_26px_rgba(0,0,0,0.22)]">
                <img
                  src={assets.pacote}
                  alt="Pacotinho bônus Fundação Grupo Boticário"
                  width={316}
                  height={391}
                  className="block h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:max-w-[520px] lg:justify-center">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-5 pb-3 sm:px-8 sm:pt-6 sm:pb-4 lg:flex-none lg:overflow-visible lg:px-10 lg:py-16 lg:pr-14">
            <div className="flex flex-col gap-5 sm:gap-6 lg:gap-7">
              <h2
                id="bonus-10k-title"
                className="flex flex-col items-start gap-1 sm:gap-1.5 lg:gap-2"
              >
                <span className="font-display text-[28px] font-extrabold leading-[1.1] text-verde-400 sm:text-4xl lg:text-[44px] lg:leading-[1.2]">
                  Somos
                </span>
                <span className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  <span className="font-display text-[48px] font-black leading-[0.82] tracking-[-0.04em] text-verde-escuro-500 sm:text-7xl sm:tracking-[-0.03em] lg:text-[100px] lg:leading-[0.9] lg:tracking-normal">
                    10 MIL
                  </span>
                  <span className="relative size-8 shrink-0 sm:size-10 lg:size-12">
                    <img
                      src={assets.leaf}
                      alt=""
                      width={48}
                      height={48}
                      className="size-full"
                    />
                  </span>
                </span>
                <span className="font-display text-[28px] font-extrabold leading-[1.1] text-verde-400 sm:text-4xl lg:text-[44px] lg:leading-[1.2]">
                  Fãs por Natureza!
                </span>
              </h2>

              <div className="flex max-w-[40ch] flex-col gap-3.5 text-verde-escuro-capa sm:gap-4 lg:max-w-[402px]">
                <p className="text-base font-medium leading-[1.55] lg:text-lg lg:leading-[1.5]">
                  Que orgulho gigante do nosso time! Chegamos a 10 mil colecionadores
                  juntos, trocando figurinhas, descobrindo curiosidades sobre a nossa
                  biodiversidade e cuidando da natureza!
                </p>
                <p className="text-base font-bold leading-[1.5]">
                  Para comemorar essa conquista, preparamos um pacote bônus especial
                  para você continuar completando seu álbum!
                </p>
              </div>

              <div className="hidden flex-col items-start gap-2 lg:flex">
                <ClaimButton claiming={claiming} onClaim={handleClaim} />
                <ClaimError message={error} />
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-[#efffeb] px-6 pb-5 pt-1 sm:px-8 sm:pb-6 lg:hidden">
            <ClaimButton
              claiming={claiming}
              onClaim={handleClaim}
              className="h-12 w-full px-6 text-[17px] font-medium sm:h-12"
            />
            <ClaimError message={error} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ClaimButton({
  claiming,
  onClaim,
  className,
}: {
  claiming: boolean;
  onClaim: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      loading={claiming}
      onClick={onClaim}
      className={cn(
        "h-auto px-8 py-2.5 text-lg font-medium text-white shadow-none hover:bg-verde-escuro-400 sm:px-10 sm:text-xl lg:text-2xl",
        className,
      )}
    >
      Resgate seu pacote!
    </Button>
  );
}

function ClaimError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-2 text-sm font-medium text-red-700" role="alert">
      {message}
    </p>
  );
}
