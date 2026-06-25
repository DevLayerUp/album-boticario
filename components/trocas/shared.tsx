"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  CheckCircle2,
  Loader2,
  PackageOpen,
  Send,
  User,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileAvatarImage } from "@/components/profile/profile-avatar-image";
import { StickerAutocomplete } from "./sticker-autocomplete";
import { StickerThumb } from "./sticker-thumb";
import { parseTradeApiError, useTradeToast } from "./trade-toast";
import type { Profile, Sticker, Trade, TradeableEntry, Wish } from "./types";

export { StickerThumb } from "./sticker-thumb";

export const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Aguardando", bg: "bg-verde-100", text: "text-verde-escuro-500" },
  accepted: { label: "Aceita", bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { label: "Recusada", bg: "bg-red-100", text: "text-red-600" },
  cancelled: { label: "Cancelada", bg: "bg-gray-100", text: "text-gray-500" },
};

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

export function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 48 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className="relative flex max-h-[min(92dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-card bg-surface shadow-2xl sm:max-h-[min(90dvh,720px)] 2xl:max-h-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </motion.div>
    </div>
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
            <p className="mt-0.5 text-[11px] text-verde-escuro-300">
              {new Date(trade.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </p>
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
            {trade.offered_sticker?.name ?? "—"}
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
            {trade.requested_sticker?.name ?? "—"}
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
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { showToast } = useTradeToast();
  const [selected, setSelected] = useState<Sticker | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    <Modal onClose={onClose}>
      <div className="relative shrink-0 overflow-hidden border-b border-verde-100 px-4 py-4 sm:px-5 sm:py-5">
        <div
          className="pointer-events-none absolute -right-6 -top-8 size-32 rounded-full bg-verde-300/25 blur-2xl"
          aria-hidden
        />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-verde-escuro-500 text-white shadow-md shadow-verde-escuro-500/25 sm:h-11 sm:w-11">
            <ArrowLeftRight size={18} aria-hidden />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="font-display text-base font-bold text-verde-escuro-capa sm:text-lg">
              Criar evento de troca
            </p>
            <p className="mt-1 text-sm leading-relaxed text-verde-escuro-400">
              Busque a figurinha que falta no seu álbum. Outros colecionadores verão seu pedido em
              Explorar.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-visible px-4 py-4 sm:px-5 sm:py-5">
        <div className="space-y-2">
          <label
            htmlFor="trade-event-sticker-search"
            className="text-xs font-semibold uppercase tracking-wider text-verde-escuro-500"
          >
            Qual figurinha você precisa?
          </label>
          <StickerAutocomplete
            inputId="trade-event-sticker-search"
            value={selected}
            onChange={setSelected}
            placeholder="Digite o nome da figurinha…"
            disabled={saving}
          />
          <p className="text-xs leading-relaxed text-verde-escuro-300">
            As sugestões aparecem enquanto você digita. Selecione uma figurinha para publicar o
            pedido.
          </p>
        </div>
        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-2 border-t border-verde-100 px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="flex-1 cursor-pointer rounded-pill border border-verde-200 py-2.5 text-sm font-medium text-verde-escuro-400 transition-colors hover:bg-verde-100/50 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={!selected || saving}
          onClick={save}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-pill bg-verde-escuro-500 py-2.5 text-sm font-bold text-white shadow-sm shadow-verde-escuro-500/20 transition-colors hover:bg-verde-escuro-400 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : (
            <ArrowLeftRight size={14} aria-hidden />
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
  const canOffer = myEntry != null;
  const isLastCopy = myEntry != null && myEntry.quantity === 1;

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
      <div className="flex shrink-0 items-center gap-2.5 border-b border-verde-100 px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
        <Avatar profile={wish.user} size={32} className="sm:!w-9 sm:!h-9" />
        <div>
          <p className="text-sm font-bold text-verde-escuro-capa">Oferecer figurinha</p>
          <p className="text-xs text-verde-escuro-300">para {wish.user?.display_name}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 sm:space-y-4 sm:px-5 sm:py-4">
        <div className="flex items-center gap-3 rounded-card border border-verde-200 bg-verde-100/50 px-3 py-2.5">
          <StickerThumb sticker={wish.sticker} width={48} height={69} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-verde-escuro-500">
              Você vai oferecer
            </p>
            <p className="text-sm font-semibold text-verde-escuro-capa">{wish.sticker?.name}</p>
            {!canOffer ? (
              <p className="mt-1 text-xs text-red-500">Você não possui esta figurinha</p>
            ) : isLastCopy ? (
              <p className="mt-1 text-xs text-amber-600">
                Você só tem 1 cópia — ela será enviada na troca
              </p>
            ) : (
              <p className="mt-1 text-xs text-verde-escuro-500">
                Você tem {myEntry!.quantity} cópias
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
            Este usuário não tem repetidas disponíveis para trocar no momento.
          </div>
        ) : (
          <div className="grid max-h-36 grid-cols-4 gap-1.5 overflow-y-auto pr-1 sm:max-h-44 sm:gap-2">
            {wish.user_stickers.map(({ sticker: st, quantity }) => {
              if (!st) return null;
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
                    badge={quantity > 1 ? quantity : undefined}
                  />
                  <p className="line-clamp-2 text-center text-[9px] font-medium leading-tight text-verde-escuro-capa">
                    {st.name}
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

      <div className="flex shrink-0 gap-2 border-t border-verde-100 px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
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
