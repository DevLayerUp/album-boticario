"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { TRADE_HISTORY_PAGE_SIZE, type TradeHistoryFilter, type NegociacaoSubTab } from "@/lib/trade-history";
import { cn } from "@/lib/utils";
import { EmptyState, TradeCard } from "./shared";
import { NegotiationSubTabs, TradeNegotiationCard } from "./trade-negotiation-card";
import { parseTradeApiError, useTradeToast } from "./trade-toast";
import type { Trade } from "./types";

interface NegociacaoViewProps {
  onTradeActivity?: () => void;
  initialSubTab?: NegociacaoSubTab;
  currentUserId?: string | null;
}

const HISTORY_FILTERS: { id: TradeHistoryFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "accepted", label: "Concluídas" },
  { id: "rejected", label: "Recusadas" },
  { id: "cancelled", label: "Canceladas" },
];

function tradePerspective(trade: Trade, userId: string | null | undefined): "sent" | "received" {
  if (userId && trade.requester_id === userId) return "sent";
  return "received";
}

export function NegociacaoView({
  onTradeActivity,
  initialSubTab = "recebidas",
  currentUserId = null,
}: NegociacaoViewProps) {
  const { showToast } = useTradeToast();
  const [sent, setSent] = useState<Trade[]>([]);
  const [received, setReceived] = useState<Trade[]>([]);
  const [history, setHistory] = useState<Trade[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<TradeHistoryFilter>("all");
  const [loading, setLoading] = useState(true);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
  const [subTab, setSubTab] = useState<NegociacaoSubTab>(initialSubTab);

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  const loadPending = useCallback(async () => {
    const [s, r] = await Promise.all([
      fetch("/api/trades?tab=sent").then((res) => res.json()).catch(() => []),
      fetch("/api/trades?tab=received").then((res) => res.json()).catch(() => []),
    ]);
    setSent(Array.isArray(s) ? s : []);
    setReceived(Array.isArray(r) ? r : []);
  }, []);

  const loadHistory = useCallback(async (filter: TradeHistoryFilter, offset: number) => {
    const params = new URLSearchParams({
      tab: "history",
      offset: String(offset),
      limit: String(TRADE_HISTORY_PAGE_SIZE),
    });
    if (filter !== "all") params.set("status", filter);

    const res = await fetch(`/api/trades?${params.toString()}`);
    const data = await res.json().catch(() => ({}));

    const trades = Array.isArray(data?.trades) ? (data.trades as Trade[]) : [];
    setHistory((prev) => (offset === 0 ? trades : [...prev, ...trades]));
    setHistoryTotal(typeof data?.total === "number" ? data.total : trades.length);
    setHistoryHasMore(Boolean(data?.has_more));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadPending(), loadHistory(historyFilter, 0)]);
    } finally {
      setLoading(false);
    }
  }, [loadPending, loadHistory, historyFilter]);

  useEffect(() => {
    void load();
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
    showToast({ message: "Oferta recusada.", variant: "info" });
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
    showToast({ message: "Solicitação de troca cancelada.", variant: "info" });
    await load();
    onTradeActivity?.();
  }

  async function changeHistoryFilter(next: TradeHistoryFilter) {
    setHistoryFilter(next);
    setLoading(true);
    try {
      await loadHistory(next, 0);
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreHistory() {
    setLoadingMoreHistory(true);
    try {
      await loadHistory(historyFilter, history.length);
    } finally {
      setLoadingMoreHistory(false);
    }
  }

  const introText =
    subTab === "historico"
      ? "Consulte negociações concluídas, recusadas ou canceladas. O histórico fica salvo para você acompanhar o que aconteceu."
      : "Analise as ofertas recebidas de outros colecionadores e acompanhe a aprovação de suas ofertas enviadas.";

  return (
    <section
      aria-labelledby="negociacao-heading"
      className="rounded-[20px] border border-verde-400 bg-verde-100 p-4 sm:rounded-[24px] sm:p-5 lg:p-6 2xl:rounded-[32px] 2xl:p-8"
    >
      <p
        id="negociacao-heading"
        className="max-w-4xl text-sm leading-relaxed text-verde-escuro-500 sm:text-base lg:text-base lg:leading-relaxed 2xl:text-xl 2xl:leading-[33px]"
      >
        {introText}
      </p>

      <div className="mt-4 sm:mt-5 2xl:mt-6">
        <NegotiationSubTabs
          active={subTab}
          onChange={setSubTab}
          receivedCount={received.length}
          sentCount={sent.length}
          historyCount={historyTotal}
        />
      </div>

      {subTab === "historico" ? (
        <div
          className="mt-4 flex flex-wrap gap-2 sm:mt-5"
          role="tablist"
          aria-label="Filtrar histórico"
        >
          {HISTORY_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={historyFilter === id}
              onClick={() => void changeHistoryFilter(id)}
              className={cn(
                "rounded-pill px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                historyFilter === id
                  ? "bg-verde-escuro-500 text-white"
                  : "border border-verde-200 bg-white text-verde-escuro-400 hover:border-verde-300",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 max-h-[min(58vh,600px)] space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin] sm:mt-5 sm:space-y-4 lg:max-h-[min(62vh,680px)] 2xl:mt-6 2xl:max-h-[min(70vh,900px)] 2xl:space-y-5">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={28} className="animate-spin text-verde-300" />
          </div>
        ) : subTab === "historico" ? (
          history.length === 0 ? (
            <EmptyState message="Nenhuma negociação encerrada neste filtro." />
          ) : (
            <>
              <AnimatePresence>
                {history.map((trade) => (
                  <TradeCard
                    key={trade.id}
                    trade={trade}
                    perspective={tradePerspective(trade, currentUserId)}
                  />
                ))}
              </AnimatePresence>
              {historyHasMore ? (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => void loadMoreHistory()}
                    disabled={loadingMoreHistory}
                    className="rounded-pill border border-verde-400 px-5 py-2 text-sm font-medium text-verde-escuro-500 transition-colors hover:border-verde-500 hover:bg-verde-500/10 disabled:opacity-60"
                  >
                    {loadingMoreHistory ? "Carregando…" : "Carregar mais"}
                  </button>
                </div>
              ) : null}
            </>
          )
        ) : (subTab === "recebidas" ? received : sent).length === 0 ? (
          <EmptyState
            message={
              subTab === "recebidas"
                ? "Nenhuma oferta recebida no momento."
                : "Nenhuma oferta enviada aguardando resposta."
            }
          />
        ) : (
          <AnimatePresence>
            {(subTab === "recebidas" ? received : sent).map((trade) => (
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
