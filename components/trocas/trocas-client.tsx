"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionTabs } from "./section-tabs";
import { SolicitarView } from "./solicitar-view";
import { NegociacaoView } from "./negociacao-view";
import { EstoqueView } from "./estoque-view";
import { TradeToastProvider, useTradeToast } from "./trade-toast";
import type { TrocasSection } from "./types";

function TrocasContent() {
  const { showToast } = useTradeToast();
  const [section, setSection] = useState<TrocasSection>("solicitar");
  const [pendingCount, setPendingCount] = useState(0);
  const [hasDuplicates, setHasDuplicates] = useState(true);

  const refreshTradeMeta = useCallback(async () => {
    const [sent, received, dupRes] = await Promise.all([
      fetch("/api/trades?tab=sent").then((r) => r.json()).catch(() => []),
      fetch("/api/trades?tab=received").then((r) => r.json()).catch(() => []),
      fetch("/api/trades/duplicates").then((r) => r.json()).catch(() => ({})),
    ]);
    const count =
      (Array.isArray(sent) ? sent.length : 0) + (Array.isArray(received) ? received.length : 0);
    setPendingCount(count);
    setHasDuplicates(Boolean(dupRes?.hasDuplicates));
  }, []);

  useEffect(() => {
    void refreshTradeMeta();
  }, [refreshTradeMeta]);

  const canOpenNegotiation = hasDuplicates || pendingCount > 0;

  useEffect(() => {
    if (section === "negociacao" && !canOpenNegotiation) {
      setSection("solicitar");
      showToast({
        message:
          "Você precisa de figurinhas repetidas para negociar trocas. Abra pacotinhos ou complete missões para conseguir mais cópias.",
        variant: "warning",
      });
    }
  }, [section, canOpenNegotiation, showToast]);

  function handleSectionChange(next: TrocasSection) {
    if (next === "negociacao" && !canOpenNegotiation) {
      showToast({
        message:
          "Você precisa de figurinhas repetidas para negociar trocas. Abra pacotinhos ou complete missões para conseguir mais cópias.",
        variant: "warning",
      });
      return;
    }
    setSection(next);
  }

  return (
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
        onChange={handleSectionChange}
        pendingCount={pendingCount}
        negotiationLocked={!canOpenNegotiation}
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
            <SolicitarView onTradeActivity={refreshTradeMeta} />
          )}
          {section === "negociacao" && (
            <NegociacaoView onTradeActivity={refreshTradeMeta} />
          )}
          {section === "estoque" && <EstoqueView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function TrocasClient() {
  return (
    <TradeToastProvider>
      <TrocasContent />
    </TradeToastProvider>
  );
}
