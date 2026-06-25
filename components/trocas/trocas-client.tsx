"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionTabs } from "./section-tabs";
import { SolicitarView } from "./solicitar-view";
import { NegociacaoView } from "./negociacao-view";
import { EstoqueView } from "./estoque-view";
import { TradeToastProvider } from "./trade-toast";
import type { TrocasSection } from "./types";

export default function TrocasClient() {
  const [section, setSection] = useState<TrocasSection>("solicitar");
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    const [sent, received] = await Promise.all([
      fetch("/api/trades?tab=sent").then((r) => r.json()).catch(() => []),
      fetch("/api/trades?tab=received").then((r) => r.json()).catch(() => []),
    ]);
    const count =
      (Array.isArray(sent) ? sent.length : 0) + (Array.isArray(received) ? received.length : 0);
    setPendingCount(count);
  }, []);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  return (
    <TradeToastProvider>
      <div className="w-full space-y-5 sm:space-y-6 lg:space-y-8 2xl:space-y-10">
        <header>
          <h1 className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-3xl lg:text-4xl 2xl:text-5xl">
            Trocas
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-verde-escuro-400 sm:mt-2 sm:text-base 2xl:text-lg">
            Solicite figurinhas e troque por suas figurinhas duplicadas com outros colecionadores.
          </p>
        </header>

        <SectionTabs
          active={section}
          onChange={setSection}
          pendingCount={pendingCount}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {section === "solicitar" && (
              <SolicitarView onTradeActivity={refreshPendingCount} />
            )}
            {section === "negociacao" && (
              <NegociacaoView onTradeActivity={refreshPendingCount} />
            )}
            {section === "estoque" && <EstoqueView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </TradeToastProvider>
  );
}
