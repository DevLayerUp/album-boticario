"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionTabs } from "./section-tabs";
import { SolicitarView } from "./solicitar-view";
import { NegociacaoView } from "./negociacao-view";
import { EstoqueView } from "./estoque-view";
import { TradeToastProvider, useTradeToast } from "./trade-toast";
import { NO_DUPLICATES_TRADE_MESSAGE } from "@/lib/trade-duplicates";
import type { NegociacaoSubTab } from "@/lib/trade-history";
import type { TrocasSection } from "./types";

interface TrocasClientProps {
  initialSection?: TrocasSection;
  initialSubTab?: NegociacaoSubTab;
  currentUserId?: string | null;
}

function TrocasContent({
  initialSection,
  initialSubTab,
  currentUserId,
}: TrocasClientProps) {
  const { showToast } = useTradeToast();
  const [section, setSection] = useState<TrocasSection>(initialSection ?? "solicitar");
  const [pendingCount, setPendingCount] = useState(0);
  const [hasDuplicates, setHasDuplicates] = useState(false);
  const [metaLoaded, setMetaLoaded] = useState(false);

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
    setMetaLoaded(true);
  }, []);

  useEffect(() => {
    void refreshTradeMeta();
  }, [refreshTradeMeta]);

  function handleSectionChange(next: TrocasSection) {
    if (next === "solicitar" && metaLoaded && !hasDuplicates) {
      showToast({
        message: NO_DUPLICATES_TRADE_MESSAGE,
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
        negotiationLocked={false}
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
            <SolicitarView
              hasDuplicates={hasDuplicates}
              metaLoaded={metaLoaded}
              onTradeActivity={refreshTradeMeta}
            />
          )}
          {section === "negociacao" && (
            <NegociacaoView
              onTradeActivity={refreshTradeMeta}
              initialSubTab={initialSubTab}
              currentUserId={currentUserId}
            />
          )}
          {section === "estoque" && (
            <EstoqueView onTradeActivity={refreshTradeMeta} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function TrocasClient({
  initialSection,
  initialSubTab,
  currentUserId,
}: TrocasClientProps) {
  return (
    <TradeToastProvider>
      <TrocasContent
        initialSection={initialSection}
        initialSubTab={initialSubTab}
        currentUserId={currentUserId}
      />
    </TradeToastProvider>
  );
}
