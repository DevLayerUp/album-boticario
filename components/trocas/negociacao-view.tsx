"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { EmptyState } from "./shared";
import { NegotiationSubTabs, TradeNegotiationCard } from "./trade-negotiation-card";
import type { Trade } from "./types";

interface NegociacaoViewProps {
  onTradeActivity?: () => void;
}

export function NegociacaoView({ onTradeActivity }: NegociacaoViewProps) {
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
    onTradeActivity?.();
  }, [onTradeActivity]);

  useEffect(() => {
    load();
  }, [load]);

  async function accept(id: number) {
    await fetch(`/api/trades/${id}?action=accept`, { method: "POST" });
    load();
  }

  async function reject(id: number) {
    await fetch(`/api/trades/${id}?action=reject`, { method: "POST" });
    load();
  }

  async function cancel(id: number) {
    await fetch(`/api/trades/${id}`, { method: "DELETE" });
    load();
  }

  const activeTrades = subTab === "recebidas" ? received : sent;

  return (
    <section
      aria-labelledby="negociacao-heading"
      className="rounded-[32px] border border-verde-400 bg-verde-100 p-5 sm:p-6 lg:p-8"
    >
      <p
        id="negociacao-heading"
        className="max-w-4xl text-sm leading-relaxed text-verde-escuro-500 sm:text-base lg:text-xl lg:leading-[33px]"
      >
        Analise as ofertas recebidas de outros colecionadores e acompanhe a aprovação de suas
        ofertas enviadas.
      </p>

      <div className="mt-6">
        <NegotiationSubTabs
          active={subTab}
          onChange={setSubTab}
          receivedCount={received.length}
          sentCount={sent.length}
        />
      </div>

      <div className="mt-6 max-h-[min(70vh,900px)] space-y-5 overflow-y-auto pr-1 [scrollbar-width:thin]">
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
