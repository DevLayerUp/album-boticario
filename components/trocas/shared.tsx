"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  CheckCircle2,
  Loader2,
  PackageOpen,
  Send,
  User,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StickerFormattedText } from "@/components/sticker/sticker-formatted-text";
import { ProfileAvatarImage } from "@/components/profile/profile-avatar-image";
import { StickerAutocomplete } from "./sticker-autocomplete";
import { StickerThumb } from "./sticker-thumb";
import { parseTradeApiError, useTradeToast } from "./trade-toast";
import type { Profile, Sticker, Trade, TradeableEntry, Wish } from "./types";

export { StickerThumb } from "./sticker-thumb";

export const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Aguardando", bg: "bg-verde-100", text: "text-verde-escuro-500" },
  accepted: { label: "Concluída", bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { label: "Recusada", bg: "bg-red-100", text: "text-red-600" },
  cancelled: { label: "Cancelada", bg: "bg-gray-100", text: "text-gray-500" },
};

function formatTradeDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function Avatar({
  profile,
  size = 36,
  className,
}: {
  profile: Profile | null;
  size?: number;
  className?: string;
}) {
  if (!profile) {
    return (
      <div
        className={cn("shrink-0 rounded-full bg-verde-100", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return profile.sticker_url ? (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full ring-2 ring-verde-500/25",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <ProfileAvatarImage
        src={profile.sticker_url}
        variant="sticker"
        alt={profile.display_name}
        sizes={`${size}px`}
      />
    </div>
  ) : (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-verde-100",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <User size={size * 0.44} className="text-verde-escuro-400" />
    </div>
  );
}

export function EmptyState({
  message,
  icon: Icon = PackageOpen,
}: {
  message: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center sm:gap-3 sm:py-12 2xl:py-16">
      <Icon size={32} className="text-verde-200 sm:size-9 2xl:size-[36px]" aria-hidden />
      <p className="max-w-sm text-sm text-verde-escuro-300">{message}</p>
    </div>
  );
}

export function Modal({
  children,
  onClose,
  size = "md",
}: {
  children: React.ReactNode;
  onClose: () => void;
  size?: "md" | "lg";
}) {
  const [mounted, setMounted] = useState(false);

  const handleClose = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      window.setTimeout(() => onClose(), 0);
    },
    [onClose],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-2 sm:items-center sm:p-3 lg:p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-verde-escuro-capa/45 backdrop-blur-[6px] sm:backdrop-blur-[8px]"
        onClick={handleClose}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className={cn(
          "relative z-10 flex w-full max-h-[min(88dvh,600px)] flex-col overflow-hidden rounded-block bg-surface shadow-[0_16px_48px_rgba(13,102,50,0.16)] sm:max-h-[min(90dvh,680px)] sm:rounded-card sm:shadow-[0_24px_64px_rgba(13,102,50,0.18)] lg:max-h-[min(90dvh,720px)] 2xl:max-h-none",
          size === "lg"
            ? "max-w-[min(100%,400px)] sm:max-w-md lg:max-w-lg 2xl:max-w-xl"
            : "max-w-[min(100%,360px)] sm:max-w-sm lg:max-w-md 2xl:max-w-lg",
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </motion.div>
    </div>,
    document.body,
  );
}

export function TradeCard({
  trade,
  perspective,
  onAccept,
  onReject,
  onCancel,
}: {
  trade: Trade;
  perspective: "sent" | "received";
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel?: (id: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  const s = STATUS_META[trade.status] ?? STATUS_META.cancelled;
  const other = perspective === "sent" ? trade.receiver : trade.requester;
  const eventDate = trade.resolved_at ?? trade.created_at;
  const dateLabel =
    trade.status === "pending"
      ? `Enviada em ${formatTradeDate(trade.created_at)}`
      : `Encerrada em ${formatTradeDate(eventDate)}`;

  async function act(fn?: (id: number) => void) {
    if (!fn) return;
    setBusy(true);
    try {
      fn(trade.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="overflow-hidden rounded-card border border-verde-200 bg-surface shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-verde-100 bg-verde-100/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar profile={other} size={32} />
          <div>
            <p className="text-sm font-semibold leading-none text-verde-escuro-capa">
              {perspective === "sent" ? "Para" : "De"}{" "}
              <span className="text-verde-escuro-500">{other?.display_name ?? "Usuário"}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-verde-escuro-300">{dateLabel}</p>
          </div>
        </div>
        <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
          {s.label}
        </span>
      </div>

      <div className="flex items-center justify-center gap-4 px-6 py-5">
        <div className="flex flex-col items-center gap-1.5">
          <StickerThumb sticker={trade.offered_sticker} width={80} height={115} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-verde-500">
            Oferece
          </span>
          <span className="max-w-[90px] truncate text-center text-[11px] leading-tight text-verde-escuro-400">
            {trade.offered_sticker?.name ? (
              <StickerFormattedText text={trade.offered_sticker.name} />
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-escuro-500 text-white shadow-md">
          <ArrowLeftRight size={18} aria-hidden />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <StickerThumb sticker={trade.requested_sticker} width={80} height={115} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold-700">
            Quer
          </span>
          <span className="max-w-[90px] truncate text-center text-[11px] leading-tight text-verde-escuro-400">
            {trade.requested_sticker?.name ? (
              <StickerFormattedText text={trade.requested_sticker.name} />
            ) : (
              "—"
            )}
          </span>
        </div>
      </div>

      {trade.status === "pending" && (
        <div className="flex gap-2 border-t border-verde-100 px-4 py-3">
          {perspective === "received" ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => act(onAccept)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-verde-escuro-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-verde-escuro-400 disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Aceitar
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => act(onReject)}
                className="flex items-center justify-center gap-1.5 rounded-pill border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                <XCircle size={14} />
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => act(onCancel)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-pill border border-verde-200 py-2.5 text-sm font-medium text-verde-escuro-400 transition-colors hover:bg-verde-100/60 disabled:opacity-60"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Cancelar oferta
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function CreateTradeEventModal({
  onClose,
  onSuccess,
  initialSticker = null,
}: {
  onClose: () => void;
  onSuccess: () => void;
  initialSticker?: Sticker | null;
}) {
  const { showToast } = useTradeToast();
  const [selected, setSelected] = useState<Sticker | null>(initialSticker);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelected(initialSticker);
    setError("");
  }, [initialSticker]);

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/trades/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sticker_id: selected.id }),
      });
      if (!res.ok) {
        const message = await parseTradeApiError(res, "Erro ao criar evento de troca");
        setError(message);
        showToast({ message, variant: "error" });
        return;
      }
      onSuccess();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} size="lg">
      <div className="relative shrink-0 border-b border-verde-100 bg-gradient-to-br from-verde-100 via-verde-100/60 to-surface px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div
          className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-verde-300/30 blur-3xl sm:size-40"
          aria-hidden
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.setTimeout(() => onClose(), 0);
          }}
          disabled={saving}
          className="absolute right-3 top-3 z-30 flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface/80 text-verde-escuro-400 ring-1 ring-verde-200 transition-colors hover:bg-surface hover:text-verde-escuro-capa disabled:opacity-60 sm:right-4 sm:top-4 sm:size-9"
          aria-label="Fechar"
        >
          <X size={16} className="sm:size-[18px]" aria-hidden />
        </button>
        <div className="relative flex items-start gap-3 pr-9 sm:gap-4 sm:pr-10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-verde-escuro-500 text-white shadow-lg shadow-verde-escuro-500/25 sm:h-11 sm:w-11 2xl:h-12 2xl:w-12">
            <ArrowLeftRight size={18} className="sm:size-5" aria-hidden />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="font-display text-lg font-bold text-verde-escuro-capa sm:text-xl lg:text-2xl">
              Criar evento de troca
            </h2>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-verde-escuro-400 sm:mt-1.5 sm:text-sm">
              Busque a figurinha que falta no seu álbum. Seu pedido aparecerá em Explorar para outros
              colecionadores.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-visible bg-[#f8fbf7] px-4 py-4 sm:space-y-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div className="space-y-3">
          <label
            htmlFor="trade-event-sticker-search"
            className="block text-xs font-bold uppercase tracking-[0.12em] text-verde-escuro-500"
          >
            Qual figurinha você precisa?
          </label>
          <StickerAutocomplete
            inputId="trade-event-sticker-search"
            value={selected}
            onChange={setSelected}
            selectionLayout="hero"
            placeholder="Digite o nome da figurinha…"
            disabled={saving}
          />
          {!selected ? (
            <p className="text-xs leading-relaxed text-verde-escuro-300">
              Digite para ver sugestões com miniatura e raridade. Selecione uma figurinha para
              publicar o pedido.
            </p>
          ) : null}
        </div>
        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600 ring-1 ring-red-100" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-2 border-t border-verde-100 bg-surface px-4 py-3 sm:gap-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="flex-1 cursor-pointer rounded-pill border border-verde-200 py-2.5 text-sm font-semibold text-verde-escuro-400 transition-colors hover:bg-verde-100/50 disabled:opacity-60 sm:py-3"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={!selected || saving}
          onClick={save}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-pill bg-verde-escuro-500 py-2.5 text-sm font-bold text-white shadow-md shadow-verde-escuro-500/20 transition-colors hover:bg-verde-escuro-400 disabled:opacity-50 sm:py-3"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <ArrowLeftRight size={16} aria-hidden />
          )}
          Publicar pedido
        </button>
      </div>
    </Modal>
  );
}

/** @deprecated Use CreateTradeEventModal */
export const AddWishModal = CreateTradeEventModal;

export function FulfillWishModal({
  wish,
  myAvailable,
  onClose,
  onSuccess,
}: {
  wish: Wish;
  myAvailable: TradeableEntry[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { showToast } = useTradeToast();
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const myEntry =
    wish.sticker != null
      ? myAvailable.find((m) => m.sticker?.id === wish.sticker!.id)
      : undefined;
  const spareQuantity = myEntry?.spareQuantity ?? myEntry?.tradeable ?? 0;
  const canOffer = spareQuantity > 0;

  async function send() {
    if (!selected || !wish.sticker || !wish.user) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: wish.user.id,
          offered_sticker_id: wish.sticker.id,
          requested_sticker_id: selected,
          message: message || undefined,
        }),
      });
      if (!res.ok) {
        const errMessage = await parseTradeApiError(res, "Erro ao enviar oferta");
        setError(errMessage);
        showToast({ message: errMessage, variant: "error" });
        return;
      }
      onSuccess();
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex shrink-0 items-center gap-2 border-b border-verde-100 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:px-5 lg:py-4">
        <Avatar profile={wish.user} size={28} className="sm:!w-8 sm:!h-8" />
        <div>
          <p className="text-sm font-bold text-verde-escuro-capa">Oferecer figurinha</p>
          <p className="text-[11px] text-verde-escuro-300 sm:text-xs">para {wish.user?.display_name}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-2.5 sm:space-y-3 sm:px-4 sm:py-3 lg:space-y-4 lg:px-5 lg:py-4">
        <div className="flex items-center gap-3 rounded-card border border-verde-200 bg-verde-100/50 px-3 py-2.5">
          <StickerThumb sticker={wish.sticker} width={48} height={69} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-verde-escuro-500">
              Você vai oferecer
            </p>
            <p className="text-sm font-semibold text-verde-escuro-capa">
              {wish.sticker?.name ? (
                <StickerFormattedText text={wish.sticker.name} />
              ) : null}
            </p>
            {!canOffer ? (
              <p className="mt-1 text-xs text-red-500">
                {myEntry
                  ? "Só é possível oferecer repetidas que não estão reservadas no álbum"
                  : "Você não possui esta figurinha"}
              </p>
            ) : (
              <p className="mt-1 text-xs text-verde-escuro-500">
                {spareQuantity === 1
                  ? "1 repetida disponível para troca"
                  : `${spareQuantity} repetidas disponíveis para troca`}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-verde-escuro-300">
          Qual repetida você quer de {wish.user?.display_name}?
        </p>
        <p className="text-[11px] leading-snug text-verde-escuro-300">
          Não precisa ser uma figurinha que você esteja buscando — escolha qualquer repetida que
          essa pessoa tenha.
        </p>

        {wish.user_stickers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-card bg-amber-50 py-6 text-center text-sm text-amber-700">
            <PackageOpen size={24} className="text-amber-400" />
            Este usuário não possui figurinhas repetidas ou você já possui todas as figurinhas que ele pode te oferecer.
          </div>
        ) : (
          <div className="grid max-h-32 grid-cols-4 gap-1 overflow-y-auto pr-1 sm:max-h-40 sm:gap-1.5 lg:max-h-44 lg:gap-2">
            {wish.user_stickers.map(({ sticker: st, spareQuantity, quantity }) => {
              if (!st) return null;
              const spare = spareQuantity ?? 0;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelected(st.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-1.5 transition-all ${
                    selected === st.id
                      ? "bg-verde-100 ring-2 ring-verde-500/40"
                      : "hover:bg-verde-100/50"
                  }`}
                >
                  <StickerThumb
                    sticker={st}
                    width={52}
                    height={74}
                    selected={selected === st.id}
                    badge={spare > 1 ? spare : quantity > 1 ? quantity : undefined}
                  />
                  <p className="line-clamp-2 text-center text-[9px] font-medium leading-tight text-verde-escuro-capa">
                    <StickerFormattedText text={st.name} />
                  </p>
                </button>
              );
            })}
          </div>
        )}

        <input
          type="text"
          placeholder="Mensagem opcional…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={120}
          className="w-full rounded-pill border border-verde-200 bg-verde-100/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-verde-500 focus:bg-surface"
        />

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="flex shrink-0 gap-2 border-t border-verde-100 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:px-5 lg:py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-pill border border-verde-200 py-2.5 text-sm font-medium text-verde-escuro-400 transition-colors hover:bg-verde-100/50"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={!selected || !canOffer || sending}
          onClick={send}
          className="flex flex-1 items-center justify-center gap-2 rounded-pill bg-verde-escuro-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-verde-escuro-400 disabled:opacity-50"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Enviar oferta
        </button>
      </div>
    </Modal>
  );
}
