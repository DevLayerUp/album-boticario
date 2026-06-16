"use client";

import { useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { rarityColor } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import { StickerThumb } from "./shared";
import type { Profile, Trade } from "./types";

function formatHandle(profile: Profile | null) {
  if (!profile) return "@usuario";
  const clean = profile.display_name.trim().replace(/\s+/g, "").toLowerCase();
  return clean.startsWith("@") ? clean : `@${clean}`;
}

interface TradeNegotiationCardProps {
  trade: Trade;
  mode: "received" | "sent";
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel?: (id: number) => void;
}

export function TradeNegotiationCard({
  trade,
  mode,
  onAccept,
  onReject,
  onCancel,
}: TradeNegotiationCardProps) {
  const [busy, setBusy] = useState<"accept" | "reject" | "cancel" | null>(null);

  const other = mode === "received" ? trade.requester : trade.receiver;
  const gainSticker = mode === "received" ? trade.offered_sticker : trade.requested_sticker;
  const giveSticker = mode === "received" ? trade.requested_sticker : trade.offered_sticker;

  const gainLabel = mode === "received" ? "Você ganha" : "Você quer";
  const giveLabel = mode === "received" ? "Você está oferecendo" : "Você está oferecendo";

  async function run(action: "accept" | "reject" | "cancel") {
    const fn =
      action === "accept" ? onAccept : action === "reject" ? onReject : onCancel;
    if (!fn) return;
    setBusy(action);
    try {
      await fn(trade.id);
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="rounded-[32px] border border-verde-300 bg-[#f7f9f7] p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
        {/* Stickers + swap */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <StickerThumb sticker={gainSticker} width={72} height={103} className="sm:w-[95px] sm:h-[136px]" />
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-verde-500 sm:text-xs">
                {gainLabel}
              </p>
              <p
                className="mt-1 font-display text-lg font-bold leading-tight text-verde-escuro-500 sm:text-2xl lg:text-[32px]"
                style={{
                  color: rarityColor(
                    gainSticker?.rarities?.slug,
                    gainSticker?.rarities?.color_hex,
                  ),
                }}
              >
                {gainSticker?.name ?? "—"}
              </p>
            </div>
          </div>

          <div
            className="mx-auto flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm sm:mx-0 sm:size-12"
            aria-hidden
          >
            <img src="/images/trocas/vector-trade.png" alt="Arrow left right" className="w-full h-full object-contain" />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 sm:justify-end">
            <div className="min-w-0 sm:text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-verde-500 sm:text-xs">
                {giveLabel}
              </p>
              <p
                className="mt-1 font-display text-lg font-bold leading-tight text-verde-escuro-500 sm:text-2xl lg:text-[32px]"
                style={{
                  color: rarityColor(
                    giveSticker?.rarities?.slug,
                    giveSticker?.rarities?.color_hex,
                  ),
                }}
              >
                {giveSticker?.name ?? "—"}
              </p>
            </div>
            <StickerThumb sticker={giveSticker} width={72} height={103} className="sm:w-[94px] sm:h-[134px]" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full shrink-0 flex-col gap-2 border-t border-verde-200 pt-4 lg:w-[236px] lg:border-t-0 lg:pt-0">
          <p className="text-center text-sm text-verde-escuro-500 lg:text-left">
            {mode === "received" ? (
              <>
                Oferta recebida de{" "}
                <span className="font-bold text-verde-500">{formatHandle(other)}</span>
              </>
            ) : (
              <>
                Aguardando resposta de{" "}
                <span className="font-bold text-verde-500">{formatHandle(other)}</span>
              </>
            )}
          </p>

          {mode === "received" ? (
            <>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("accept")}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-pill bg-verde-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-verde-400 disabled:opacity-60"
              >
                {busy === "accept" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                Aceitar e resgatar
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("reject")}
                className="flex w-full cursor-pointer items-center justify-center rounded-pill border border-verde-300 px-6 py-2.5 text-sm font-medium text-verde-300 transition-colors hover:border-verde-400 hover:text-verde-400 disabled:opacity-60"
              >
                {busy === "reject" ? <Loader2 size={16} className="animate-spin" /> : null}
                Recusar
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => run("cancel")}
              className={cn(
                "flex w-full cursor-pointer items-center justify-center rounded-pill border border-verde-300 px-6 py-2.5 text-sm font-medium text-verde-escuro-400 transition-colors hover:bg-verde-100/80 disabled:opacity-60",
              )}
            >
              {busy === "cancel" ? <Loader2 size={16} className="animate-spin" /> : null}
              Cancelar oferta
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

interface NegotiationSubTabsProps {
  active: "recebidas" | "solicitadas";
  onChange: (tab: "recebidas" | "solicitadas") => void;
  receivedCount: number;
  sentCount: number;
}

export function NegotiationSubTabs({
  active,
  onChange,
  receivedCount,
  sentCount,
}: NegotiationSubTabsProps) {
  return (
    <div
      className="inline-flex max-w-full flex-wrap gap-2 rounded-pill bg-white p-1.5 sm:gap-3 sm:p-2"
      role="tablist"
      aria-label="Tipo de negociação"
    >
      <SubTabPill
        active={active === "recebidas"}
        label="Trocas recebidas"
        count={receivedCount}
        onClick={() => onChange("recebidas")}
      />
      <SubTabPill
        active={active === "solicitadas"}
        label="Trocas solicitadas"
        count={sentCount}
        onClick={() => onChange("solicitadas")}
      />
    </div>
  );
}

function SubTabPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-pill py-2 pl-6 pr-3 text-sm font-medium transition-colors sm:pl-10 sm:text-base",
        active
          ? "bg-verde-escuro-500 text-white"
          : "border border-verde-200 text-verde-200 hover:border-verde-300 hover:text-verde-300",
      )}
    >
      {label}
      <span
        className={cn(
          "flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-bold",
          active ? "bg-amarelo text-verde-escuro-500" : "bg-verde-100 text-verde-escuro-500",
        )}
      >
        {count}
      </span>
    </button>
  );
}
