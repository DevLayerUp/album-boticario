"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClipboardList, Medal, Trophy, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ConcursoPageConfig } from "@/lib/concurso-page";
import { CONCURSO_INELEGIBILIDADE_GRUPO } from "@/lib/concurso-regulamento";
import { dashboardAssets } from "@/lib/dashboard-assets";
import { cn } from "@/lib/utils";
import { ConcursoRegulamentoLink } from "./concurso-regulamento-modal";

const assets = dashboardAssets.concurso;

function formatBrDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof Trophy;
  children: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-verde-escuro-500">
      <Icon aria-hidden className="size-7 shrink-0" strokeWidth={2.2} />
      <h3 className="font-display text-xl font-bold leading-8 sm:text-2xl sm:leading-[30px]">
        {children}
      </h3>
    </div>
  );
}

export function ConcursoPromoModal({ config }: { config: ConcursoPageConfig }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dismiss = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, dismiss]);

  if (!mounted || !open) return null;

  const prazo = `Prazo final para envio: de ${formatBrDate(config.startIso)} até ${formatBrDate(config.deadlineIso)}, às 23h59.`;
  const medals = [assets.medal1, assets.medal2, assets.medal3];
  const prizes = [
    { place: "1º Lugar", copy: "01 Camisa exclusiva da campanha autografada pelo Kaká!", strong: true },
    { place: "2º Lugar", copy: "01 Camisa exclusiva da campanha autografada pelo Kaká!", strong: true },
    { place: "3º Lugar", copy: "01 Kit Exclusivo da Fundação Grupo Boticário!", strong: false },
  ];

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="concurso-promo-title"
    >
      <button
        type="button"
        aria-label="Fechar aviso do concurso"
        className="absolute inset-0 cursor-pointer bg-black/60"
        onClick={dismiss}
      />

      <motion.article
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 320, damping: 28 }
        }
        className="relative flex max-h-[min(94dvh,1120px)] w-full max-w-[1120px] flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_20px_48px_-16px_rgba(13,102,50,0.18)] sm:rounded-[40px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <header className="relative isolate overflow-hidden bg-verde-escuro-500 px-5 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-8 lg:px-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assets.promoGlow}
              alt=""
              width={420}
              height={420}
              className="pointer-events-none absolute -top-[180px] right-[-40px] hidden size-[320px] lg:block lg:size-[420px]"
            />

            <div className="relative z-10 flex items-start justify-between gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assets.promoMarca}
                alt="Fãs por Natureza"
                width={160}
                height={80}
                className="h-12 w-auto object-contain sm:h-[72px]"
              />
              <button
                type="button"
                onClick={dismiss}
                className="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-full sm:size-14"
                aria-label="Fechar"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assets.promoClose}
                  alt=""
                  width={56}
                  height={56}
                  className="absolute inset-0 size-full"
                />
                <X aria-hidden className="relative size-6 text-verde-escuro-500" strokeWidth={3} />
              </button>
            </div>

            <div className="relative z-10 mt-5 max-w-[760px] pr-4 lg:pr-[280px]">
              <h2
                id="concurso-promo-title"
                className="font-display text-[1.65rem] font-bold leading-tight text-white sm:text-4xl sm:leading-[44px]"
              >
                {config.heroTitle}
              </h2>
              <p className="mt-3 max-w-[574px] text-base leading-[26px] text-white sm:text-xl">
                O maior fã-clube da biodiversidade brasileira está escalando seus craques.
                Quer ganhar uma das duas camisas autografadas pelo{" "}
                <strong className="font-semibold text-amarelo">Kaká</strong> ou um Kit
                Exclusivo da Fundação?
              </p>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assets.promoJersey}
              alt=""
              width={408}
              height={475}
              className="pointer-events-none absolute -bottom-24 right-6 hidden h-[300px] w-auto object-contain lg:right-16 lg:block lg:h-[420px] xl:h-[460px]"
            />
          </header>

          <div className="bg-white px-4 py-5 sm:px-8 sm:py-8 lg:px-14 lg:py-10">
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="flex flex-col gap-5 rounded-card border border-verde-400 bg-[#f3fff0] p-5 sm:p-6">
                <SectionTitle icon={Trophy}>O Desafio Criativo</SectionTitle>
                <p className="text-[17px] leading-6 text-verde-escuro-500">
                  Para participar, responda com toda a sua inspiração e autenticidade à pergunta:
                </p>
                <p className="rounded-[18px] bg-verde-escuro-500 px-5 py-4 font-semibold leading-6 text-amarelo sm:min-h-[130px] sm:py-6">
                  {config.formQuestion}
                </p>
                <a
                  href="#formulario"
                  onClick={dismiss}
                  className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-pill bg-amarelo px-8 py-3 text-center text-lg font-bold leading-[30px] text-verde-escuro-500 transition-[filter,transform] duration-200 hover:brightness-95 motion-safe:hover:-translate-y-px sm:text-[21px]"
                >
                  PARTICIPAR!
                </a>
              </section>

              <section className="rounded-card border border-verde-400 bg-white p-5 sm:p-6">
                <SectionTitle icon={Medal}>Premiação</SectionTitle>
                <p className="mt-5 text-[17px] leading-6 text-verde-escuro-500">
                  Nossa comissão interna vai avaliar as respostas mais criativas e originais para
                  definir o pódio de uma só vez:
                </p>
                <ul className="mt-5 flex flex-col gap-2">
                  {prizes.map((prize, index) => (
                    <li
                      key={prize.place}
                      className="flex items-center gap-3 rounded-2xl bg-[#f3fff0] px-3 py-3 sm:px-4"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={medals[index]}
                        alt=""
                        width={32}
                        height={48}
                        className="h-10 w-auto shrink-0 object-contain"
                      />
                      <p
                        className={cn(
                          "text-[15.5px] leading-[21px] text-verde-escuro-500",
                          prize.strong ? "font-semibold" : "font-normal",
                        )}
                      >
                        {prize.place}: {prize.copy}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="mt-5 rounded-card border border-verde-400 bg-[#f3fff0] p-5 sm:p-6">
              <SectionTitle icon={ClipboardList}>Regras Básicas do Jogo:</SectionTitle>
              <ul className="mt-5 flex flex-col gap-4 text-[17px] leading-6 text-verde-escuro-500">
                <li className="flex gap-3">
                  <span className="mt-1.5 size-3 shrink-0 rounded-full bg-verde-500" aria-hidden />
                  <span>
                    Quem pode participar? Todos os colecionadores com 18 anos ou mais cadastrados
                    no faspornatureza.com.br
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 size-3 shrink-0 rounded-full bg-amarelo" aria-hidden />
                  <span className="font-semibold">{CONCURSO_INELEGIBILIDADE_GRUPO}</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 size-3 shrink-0 rounded-full bg-amarelo" aria-hidden />
                  <span>{prazo}</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 size-3 shrink-0 rounded-full bg-verde-500" aria-hidden />
                  <span>Limite: Apenas 01 inscrição por CPF.</span>
                </li>
              </ul>
              <div className="mt-5 h-0.5 w-full bg-verde-escuro-500" />
              <p className="mt-4 text-[17px] font-semibold leading-6 text-verde-escuro-500">
                Regulamento completo:{" "}
                <ConcursoRegulamentoLink className="inline underline underline-offset-2">
                  clique aqui
                </ConcursoRegulamentoLink>
                .
              </p>
            </section>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
