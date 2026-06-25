"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { EmptyState } from "./shared";
import { NegotiationSubTabs, TradeNegotiationCard } from "./trade-negotiation-card";
import { parseTradeApiError, useTradeToast } from "./trade-toast";
import type { Trade } from "./types";

interface NegociacaoViewProps {
  onTradeActivity?: () => void;
}

export function NegociacaoView({ onTradeActivity }: NegociacaoViewProps) {
  const { showToast } = useTradeToast();
  const [sent, setSent] = useState<Trade[]>([]);
  const [received, setReceived] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"recebidas" | "solicitadas">("recebidas");

  const load = useCallback(async () => {
    setLoading(true);
    const [s, r] = await Promise.all([
      fetch("/api/trades?tab=sent").then((res) => res.json()).catch(() => []),
      fetch("/api/trades?tab=received").then((res) => res.json()).catch(() => []),
    ]);
    setSent(Array.isArray(s) ? s : []);
    setReceived(Array.isArray(r) ? r : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function accept(id: number) {
    const res = await fetch(`/api/trades/${id}?action=accept`, { method: "POST" });
    if (!res.ok) {
      showToast({
        message: await parseTradeApiError(res, "Não foi possível aceitar a troca."),
        variant: "error",
      });
      return;
    }
    showToast({
      message: "Troca aceita! As figurinhas foram atualizadas no seu álbum.",
      variant: "success",
    });
    await load();
    onTradeActivity?.();
  }

  async function reject(id: number) {
    const res = await fetch(`/api/trades/${id}?action=reject`, { method: "POST" });
    if (!res.ok) {
      showToast({
        message: await parseTradeApiError(res, "Não foi possível recusar a oferta."),
        variant: "error",
      });
      return;
    }
    showToast({
      message: "Oferta recusada.",
      variant: "info",
    });
    await load();
    onTradeActivity?.();
  }

  async function cancel(id: number) {
    const res = await fetch(`/api/trades/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast({
        message: await parseTradeApiError(res, "Não foi possível cancelar a solicitação."),
        variant: "error",
      });
      return;
    }
    showToast({
      message: "Solicitação de troca cancelada.",
      variant: "info",
    });
    await load();
    onTradeActivity?.();
  }

  const activeTrades = subTab === "recebidas" ? received : sent;

  return (
    <section
      aria-labelledby="negociacao-heading"
      className="rounded-[20px] border border-verde-400 bg-verde-100 p-4 sm:rounded-[24px] sm:p-5 lg:p-6 2xl:rounded-[32px] 2xl:p-8"
    >
      <p
        id="negociacao-heading"
        className="max-w-4xl text-sm leading-relaxed text-verde-escuro-500 sm:text-base lg:text-base lg:leading-relaxed 2xl:text-xl 2xl:leading-[33px]"
      >
        Analise as ofertas recebidas de outros colecionadores e acompanhe a aprovação de suas
        ofertas enviadas.
      </p>

      <div className="mt-4 sm:mt-5 2xl:mt-6">
        <NegotiationSubTabs
          active={subTab}
          onChange={setSubTab}
          receivedCount={received.length}
          sentCount={sent.length}
        />
      </div>

      <div className="mt-4 max-h-[min(58vh,600px)] space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin] sm:mt-5 sm:space-y-4 lg:max-h-[min(62vh,680px)] 2xl:mt-6 2xl:max-h-[min(70vh,900px)] 2xl:space-y-5">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={28} className="animate-spin text-verde-300" />
          </div>
        ) : activeTrades.length === 0 ? (
          <EmptyState
            message={
              subTab === "recebidas"
                ? "Nenhuma oferta recebida no momento."
                : "Nenhuma oferta enviada aguardando resposta."
            }
          />
        ) : (
          <AnimatePresence>
            {activeTrades.map((trade) => (
              <TradeNegotiationCard
                key={trade.id}
                trade={trade}
                mode={subTab === "recebidas" ? "received" : "sent"}
                onAccept={subTab === "recebidas" ? accept : undefined}
                onReject={subTab === "recebidas" ? reject : undefined}
                onCancel={subTab === "solicitadas" ? cancel : undefined}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
