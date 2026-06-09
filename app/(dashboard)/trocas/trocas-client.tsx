"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight, Send, Inbox, Compass, History,
  CheckCircle2, XCircle, Loader2, RefreshCw,
  Search, Tags, User, PackageOpen, Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Rarity  { name: string; slug: string; color_hex: string }
interface Sticker { id: number; name: string; image_url: string; rarities: Rarity | null }
interface Profile { id: string; display_name: string; sticker_url: string | null }
interface Trade {
  id: number; status: "pending"|"accepted"|"rejected"|"cancelled";
  message: string|null; created_at: string; resolved_at: string|null;
  requester_id: string; receiver_id: string;
  offered_sticker: Sticker|null; requested_sticker: Sticker|null;
  requester: Profile|null; receiver: Profile|null;
}
interface TradeableEntry { sticker: Sticker|null; quantity: number; tradeable: number }
interface ExploreUser   { user: Profile|null; has_quantity: number; tradeable_stickers: { sticker: Sticker|null; quantity: number }[] }
interface SeekerUser    { user: Profile|null; tradeable_stickers: { sticker: Sticker|null; quantity: number }[] }

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "offer",    label: "Tenho para Trocar", Icon: Tags    },
  { id: "sent",     label: "Minhas Ofertas",    Icon: Send    },
  { id: "received", label: "Recebidas",          Icon: Inbox   },
  { id: "explore",  label: "Explorar",           Icon: Compass },
  { id: "history",  label: "Histórico",          Icon: History },
] as const;
type TabId = typeof TABS[number]["id"];

const STATUS: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: "Aguardando", bg: "bg-amber-100",  text: "text-amber-700" },
  accepted:  { label: "Aceita",     bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected:  { label: "Recusada",   bg: "bg-red-100",    text: "text-red-600" },
  cancelled: { label: "Cancelada",  bg: "bg-gray-100",   text: "text-gray-500" },
};

// ─── Shared atoms ─────────────────────────────────────────────────────────────
function Avatar({ profile, size = 36 }: { profile: Profile|null; size?: number }) {
  if (!profile) return <div className="rounded-full bg-gray-100" style={{ width: size, height: size }} />;
  return profile.sticker_url ? (
    <div className="relative shrink-0 overflow-hidden rounded-full ring-2 ring-gb-green/20"
         style={{ width: size, height: size }}>
      <Image src={profile.sticker_url} alt={profile.display_name} fill className="object-cover" sizes={`${size}px`} />
    </div>
  ) : (
    <div className="flex shrink-0 items-center justify-center rounded-full bg-gb-green/10"
         style={{ width: size, height: size }}>
      <User size={size * 0.44} className="text-gb-green" />
    </div>
  );
}

/** A sticker displayed as a physical trading card */
function StickerCard({
  sticker, size = 72, selected = false, badge,
}: { sticker: Sticker|null; size?: number; selected?: boolean; badge?: string | number }) {
  if (!sticker) return <div className="rounded-xl bg-gray-100" style={{ width: size, height: size }} />;
  const glow = sticker.rarities?.color_hex ?? "#00a859";
  return (
    <div
      className="relative overflow-hidden rounded-xl border-2 transition-all duration-200"
      style={{
        width: size, height: size,
        borderColor: selected ? "#00a859" : glow,
        boxShadow: selected
          ? `0 0 0 3px #00a85940, 0 4px 12px ${glow}40`
          : `0 2px 8px ${glow}30`,
      }}
    >
      <Image src={sticker.image_url} alt={sticker.name} fill className="object-cover" sizes={`${size}px`} />
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center bg-gb-green/25">
          <CheckCircle2 size={size * 0.3} className="text-white drop-shadow" />
        </div>
      )}
      {badge !== undefined && (
        <div className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gb-green px-1 text-[9px] font-black text-white shadow">
          {badge}×
        </div>
      )}
    </div>
  );
}

// ─── Trade Card ───────────────────────────────────────────────────────────────
function TradeCard({
  trade, perspective, onAccept, onReject, onCancel,
}: {
  trade: Trade; perspective: "sent"|"received";
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel?: (id: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  const s = STATUS[trade.status];
  const other = perspective === "sent" ? trade.receiver : trade.requester;

  async function act(fn?: (id: number) => void) {
    if (!fn) return;
    setBusy(true);
    try { fn(trade.id); } finally { setBusy(false); }
  }

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <Avatar profile={other} size={32} />
          <div>
            <p className="text-sm font-semibold text-gb-ink leading-none">
              {perspective === "sent" ? "Para" : "De"}{" "}
              <span className="text-gb-green">{other?.display_name ?? "Usuário"}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              {new Date(trade.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
          {s.label}
        </span>
      </div>

      {/* Exchange visual */}
      <div className="flex items-center justify-center gap-4 px-6 py-5">
        {/* Offered */}
        <div className="flex flex-col items-center gap-1.5">
          <StickerCard sticker={trade.offered_sticker} size={80} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gb-green">Oferece</span>
          <span className="max-w-[80px] truncate text-center text-[11px] text-gray-600 leading-tight">
            {trade.offered_sticker?.name ?? "—"}
          </span>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gb-ink text-white shadow-md">
            <ArrowLeftRight size={18} />
          </div>
          {trade.message && (
            <p className="max-w-[90px] text-center text-[10px] italic text-gray-400 leading-tight">
              &ldquo;{trade.message}&rdquo;
            </p>
          )}
        </div>

        {/* Requested */}
        <div className="flex flex-col items-center gap-1.5">
          <StickerCard sticker={trade.requested_sticker} size={80} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Quer</span>
          <span className="max-w-[80px] truncate text-center text-[11px] text-gray-600 leading-tight">
            {trade.requested_sticker?.name ?? "—"}
          </span>
        </div>
      </div>

      {/* Actions */}
      {trade.status === "pending" && (
        <div className="flex gap-2 border-t border-border px-4 py-3">
          {perspective === "received" ? (
            <>
              <button disabled={busy} onClick={() => act(onAccept)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gb-green py-2.5 text-sm font-semibold text-white hover:bg-gb-green-dark disabled:opacity-60 transition-colors">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Aceitar troca
              </button>
              <button disabled={busy} onClick={() => act(onReject)}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-60 transition-colors">
                <XCircle size={14} />
              </button>
            </>
          ) : (
            <button disabled={busy} onClick={() => act(onCancel)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60 transition-colors">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Cancelar oferta
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Modal base ───────────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 48 }} transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        {children}
      </motion.div>
    </div>
  );
}

/** Grid picker for selecting a sticker */
function StickerGridPicker({
  items, selected, onSelect,
}: { items: { sticker: Sticker|null; quantity: number; tradeable?: number }[]; selected: number|null; onSelect: (id: number) => void }) {
  if (items.length === 0) return (
    <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-amber-700 bg-amber-50 rounded-2xl">
      <PackageOpen size={28} className="text-amber-400" />
      Nenhuma figurinha disponível.
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
      {items.map(({ sticker, quantity }) => {
        if (!sticker) return null;
        return (
          <button key={sticker.id} onClick={() => onSelect(sticker.id)}
            className="group flex flex-col items-center gap-1 rounded-2xl p-1.5 transition-all hover:bg-gb-green/5">
            <StickerCard sticker={sticker} size={56} selected={selected === sticker.id} badge={quantity} />
            <p className="line-clamp-1 w-full text-center text-[9px] font-medium text-gb-ink leading-tight">
              {sticker.name}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ─── ProposeModal: pick "what I offer" → send to target ──────────────────────
function ProposeModal({ targetUser, wantedSticker, onClose, onSuccess }: {
  targetUser: Profile; wantedSticker: Sticker; onClose: () => void; onSuccess: () => void;
}) {
  const [myStickers, setMyStickers] = useState<TradeableEntry[]>([]);
  const [selected, setSelected]     = useState<number|null>(null);
  const [message, setMessage]       = useState("");
  const [loading, setLoading]       = useState(true);
  const [sending, setSending]       = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    fetch("/api/trades/available").then((r) => r.json()).then(setMyStickers).finally(() => setLoading(false));
  }, []);

  async function send() {
    if (!selected) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/trades", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: targetUser.id, offered_sticker_id: selected, requested_sticker_id: wantedSticker.id, message: message || undefined }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Erro ao enviar"); return; }
      onSuccess(); onClose();
    } finally { setSending(false); }
  }

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gb-green/10 text-gb-green">
          <ArrowLeftRight size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-gb-ink">Propor Troca</p>
          <p className="text-xs text-muted">Com {targetUser.display_name}</p>
        </div>
        <StickerCard sticker={wantedSticker} size={36} />
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* What I want */}
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-3 py-2.5">
          <StickerCard sticker={wantedSticker} size={44} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Você quer</p>
            <p className="text-sm font-semibold text-gb-ink">{wantedSticker.name}</p>
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Escolha o que vai oferecer</p>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-gb-green/40" />
          </div>
        ) : (
          <StickerGridPicker items={myStickers} selected={selected} onSelect={setSelected} />
        )}

        <input type="text" placeholder="Mensagem opcional…" value={message} onChange={(e) => setMessage(e.target.value)}
          maxLength={120} className="w-full rounded-xl border border-border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gb-green focus:bg-white transition-colors" />

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex gap-3 border-t border-border px-5 py-4">
        <button onClick={onClose} className="flex-1 rounded-2xl border border-border py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button disabled={!selected || sending} onClick={send}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gb-green py-2.5 text-sm font-bold text-white hover:bg-gb-green-dark disabled:opacity-50 transition-colors">
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Enviar proposta
        </button>
      </div>
    </Modal>
  );
}

// ─── ProposeFromOfferModal: offered is pre-selected, pick "what I want" ───────
function ProposeFromOfferModal({ targetUser, offeredSticker, targetTradeable, onClose, onSuccess }: {
  targetUser: Profile; offeredSticker: Sticker;
  targetTradeable: { sticker: Sticker|null; quantity: number }[];
  onClose: () => void; onSuccess: () => void;
}) {
  const [selected, setSelected] = useState<number|null>(null);
  const [message, setMessage]   = useState("");
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState("");

  async function send() {
    if (!selected) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/trades", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: targetUser.id, offered_sticker_id: offeredSticker.id, requested_sticker_id: selected, message: message || undefined }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Erro ao enviar"); return; }
      onSuccess(); onClose();
    } finally { setSending(false); }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gb-green/10 text-gb-green">
          <ArrowLeftRight size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-gb-ink">Propor Troca</p>
          <p className="text-xs text-muted">Com {targetUser.display_name}</p>
        </div>
        <Avatar profile={targetUser} size={36} />
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* What I offer */}
        <div className="flex items-center gap-3 rounded-2xl bg-gb-green/5 px-3 py-2.5 border border-gb-green/20">
          <StickerCard sticker={offeredSticker} size={44} />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gb-green">Você oferece</p>
            <p className="text-sm font-semibold text-gb-ink">{offeredSticker.name}</p>
          </div>
          <ArrowLeftRight size={16} className="text-gb-green shrink-0" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          O que você quer de {targetUser.display_name}?
        </p>
        <StickerGridPicker items={targetTradeable} selected={selected} onSelect={setSelected} />

        <input type="text" placeholder="Mensagem opcional…" value={message} onChange={(e) => setMessage(e.target.value)}
          maxLength={120} className="w-full rounded-xl border border-border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gb-green focus:bg-white transition-colors" />

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex gap-3 border-t border-border px-5 py-4">
        <button onClick={onClose} className="flex-1 rounded-2xl border border-border py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button disabled={!selected || sending || targetTradeable.length === 0} onClick={send}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gb-green py-2.5 text-sm font-bold text-white hover:bg-gb-green-dark disabled:opacity-50 transition-colors">
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Enviar proposta
        </button>
      </div>
    </Modal>
  );
}

// ─── Tab: Tenho para Trocar ───────────────────────────────────────────────────
function OfferTab({ onSuccess }: { onSuccess: () => void }) {
  const [dupes, setDupes]       = useState<TradeableEntry[]>([]);
  const [active, setActive]     = useState<Sticker|null>(null);
  const [seekers, setSeekers]   = useState<SeekerUser[]>([]);
  const [loadD, setLoadD]       = useState(true);
  const [loadS, setLoadS]       = useState(false);
  const [propose, setPropose]   = useState<{ user: Profile; tradeable: { sticker: Sticker|null; quantity: number }[] }|null>(null);
  const [toast, setToast]       = useState("");

  useEffect(() => {
    fetch("/api/trades/available").then((r) => r.json()).then(setDupes).finally(() => setLoadD(false));
  }, []);

  async function pick(sticker: Sticker) {
    setActive(sticker); setSeekers([]); setLoadS(true);
    try {
      const r = await fetch(`/api/trades/seekers?sticker_id=${sticker.id}`);
      setSeekers((await r.json()) ?? []);
    } finally { setLoadS(false); }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl bg-gb-green px-4 py-3 text-sm font-semibold text-white shadow-lg flex items-center gap-2">
            <Sparkles size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide */}
      <div className="rounded-2xl border border-gb-green/20 bg-gb-green/5 p-4">
        <p className="text-sm font-semibold text-gb-ink">Suas figurinhas duplicadas</p>
        <p className="mt-0.5 text-xs text-muted">Clique em uma figurinha com 2+ cópias para ver quem quer recebê-la.</p>
      </div>

      {loadD ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-gb-green/30" />
        </div>
      ) : dupes.length === 0 ? (
        <EmptyState tab="offer" />
      ) : (
        /* Sticker card grid */
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {dupes.map(({ sticker, quantity, tradeable }) => {
            if (!sticker) return null;
            const isActive = active?.id === sticker.id;
            return (
              <motion.button key={sticker.id} whileTap={{ scale: 0.96 }} onClick={() => pick(sticker)}
                className={`group relative flex flex-col items-center gap-2 rounded-2xl p-2 transition-all ${
                  isActive ? "bg-gb-green/10 ring-2 ring-gb-green/40 shadow-sm" : "bg-white border border-border hover:border-gb-green/30 hover:bg-gray-50"
                }`}>
                <div className="relative">
                  <StickerCard sticker={sticker} size={64} selected={isActive} badge={quantity} />
                </div>
                <p className="line-clamp-2 text-center text-[10px] font-semibold text-gb-ink leading-tight">{sticker.name}</p>
                <p className="text-[9px] text-muted">{tradeable} para troca</p>
                {isActive && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gb-green whitespace-nowrap">
                    ▼ quem quer?
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Seekers section */}
      <AnimatePresence>
        {active && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-3">
            <div className="flex items-center gap-2 rounded-2xl bg-gb-ink px-4 py-3">
              <StickerCard sticker={active} size={32} />
              <p className="text-sm font-semibold text-white">
                Quem quer <span className="text-gb-green">{active.name}</span>?
              </p>
            </div>

            {loadS ? (
              <div className="flex h-20 items-center justify-center">
                <Loader2 size={20} className="animate-spin text-gb-green/40" />
              </div>
            ) : seekers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-8 text-center">
                <Search size={24} className="text-gray-300" />
                <p className="text-sm text-gray-400">Nenhum usuário procurando esta figurinha agora.</p>
              </div>
            ) : (
              seekers.map((s) => {
                if (!s.user) return null;
                return (
                  <motion.div key={s.user.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                    {/* User header */}
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-border">
                      <Avatar profile={s.user} size={36} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gb-ink">{s.user.display_name}</p>
                        <p className="text-xs text-muted">Não tem esta figurinha</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                        Interessado
                      </span>
                    </div>
                    {/* Their tradeables */}
                    {s.tradeable_stickers.length > 0 && (
                      <div className="px-4 py-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Pode oferecer em troca:</p>
                        <div className="flex flex-wrap gap-2">
                          {s.tradeable_stickers.map(({ sticker: st }) => st && (
                            <div key={st.id} className="flex items-center gap-1.5 rounded-xl border border-border bg-gray-50 px-2 py-1">
                              <StickerCard sticker={st} size={20} />
                              <span className="text-xs font-medium text-gb-ink">{st.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* CTA */}
                    <div className="px-4 pb-3">
                      <button onClick={() => setPropose({ user: s.user!, tradeable: s.tradeable_stickers })}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gb-green py-2.5 text-sm font-bold text-white hover:bg-gb-green-dark transition-colors">
                        <ArrowLeftRight size={14} />
                        Propor troca com {s.user.display_name}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {propose && active && (
          <ProposeFromOfferModal targetUser={propose.user} offeredSticker={active}
            targetTradeable={propose.tradeable} onClose={() => setPropose(null)}
            onSuccess={() => {
              setToast("Proposta enviada! 🎉");
              setTimeout(() => setToast(""), 3000);
              onSuccess();
            }} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab: Explorar ────────────────────────────────────────────────────────────
function ExploreTab({ onSuccess }: { onSuccess: () => void }) {
  const [myStickers, setMyStickers]   = useState<TradeableEntry[]>([]);
  const [allStickers, setAllStickers] = useState<Sticker[]>([]);
  const [wantId, setWantId]           = useState<number|null>(null);
  const [results, setResults]         = useState<ExploreUser[]>([]);
  const [loading, setLoading]         = useState(false);
  const [propose, setPropose]         = useState<{ user: Profile; sticker: Sticker }|null>(null);
  const [toast, setToast]             = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/trades/available").then((r) => r.json()),
      fetch("/api/admin/figurinhas?active=true").then((r) => r.json()).catch(() => []),
    ]).then(([a, s]) => { setMyStickers(a); setAllStickers(s); });
  }, []);

  async function search() {
    if (!wantId) return;
    setLoading(true);
    try { setResults((await (await fetch(`/api/trades/explore?want_sticker_id=${wantId}`)).json()) ?? []); }
    finally { setLoading(false); }
  }

  const wanted = allStickers.find((s) => s.id === wantId) ?? null;

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl bg-gb-green px-4 py-3 text-sm font-semibold text-white shadow-lg flex items-center gap-2">
            <Sparkles size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-sm text-muted">Escolha uma figurinha que você quer e veja quem tem ela para trocar.</p>

      <div className="flex gap-2">
        <select value={wantId ?? ""} onChange={(e) => setWantId(e.target.value ? Number(e.target.value) : null)}
          className="flex-1 rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-gb-green transition-colors">
          <option value="">Estou procurando…</option>
          {allStickers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}{s.rarities ? ` (${s.rarities.name})` : ""}</option>
          ))}
        </select>
        <button onClick={search} disabled={!wantId || loading}
          className="flex items-center gap-2 rounded-2xl bg-gb-green px-5 py-2.5 text-sm font-bold text-white hover:bg-gb-green-dark disabled:opacity-50 transition-colors">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Buscar
        </button>
      </div>

      {myStickers.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <PackageOpen size={18} className="shrink-0 text-amber-500" />
          Você não tem duplicatas para oferecer. Abra mais pacotinhos!
        </div>
      )}

      {results.length === 0 && !loading && wantId && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Search size={32} className="text-gray-200" />
          <p className="text-sm text-gray-400">Nenhum usuário com essa figurinha disponível.</p>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {results.map((r) => {
            if (!r.user) return null;
            return (
              <motion.div key={r.user.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-border">
                  <Avatar profile={r.user} size={36} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gb-ink">{r.user.display_name}</p>
                    <p className="text-xs text-muted">{r.has_quantity}× {wanted?.name ?? ""}</p>
                  </div>
                </div>
                {r.tradeable_stickers.length > 0 && (
                  <div className="px-4 py-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Tem para trocar:</p>
                    <div className="flex flex-wrap gap-2">
                      {r.tradeable_stickers.map(({ sticker: st }) => st && (
                        <div key={st.id} className="flex items-center gap-1.5 rounded-xl border border-border bg-gray-50 px-2 py-1">
                          <StickerCard sticker={st} size={20} />
                          <span className="text-xs font-medium text-gb-ink">{st.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {wanted && myStickers.length > 0 && (
                  <div className="px-4 pb-3">
                    <button onClick={() => setPropose({ user: r.user!, sticker: wanted })}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gb-green py-2.5 text-sm font-bold text-white hover:bg-gb-green-dark transition-colors">
                      <ArrowLeftRight size={14} /> Propor troca
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {propose && (
          <ProposeModal targetUser={propose.user} wantedSticker={propose.sticker} onClose={() => setPropose(null)}
            onSuccess={() => { setToast("Proposta enviada!"); setTimeout(() => setToast(""), 3000); onSuccess(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: TabId }) {
  const C: Record<TabId, { Icon: React.ElementType; title: string; sub: string }> = {
    offer:    { Icon: PackageOpen, title: "Sem duplicatas ainda",      sub: "Abra mais pacotinhos para ter figurinhas repetidas para trocar." },
    sent:     { Icon: Send,        title: "Nenhuma oferta enviada",    sub: "Use Tenho para Trocar ou Explorar para propor uma troca." },
    received: { Icon: Inbox,       title: "Nenhuma proposta recebida", sub: "Quando alguém quiser trocar com você, aparecerá aqui." },
    explore:  { Icon: Compass,     title: "", sub: "" },
    history:  { Icon: History,     title: "Histórico vazio",           sub: "Suas trocas concluídas, recusadas e canceladas ficam aqui." },
  };
  const { Icon, title, sub } = C[tab];
  if (!title) return null;
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100">
        <Icon size={28} className="text-gray-400" />
      </div>
      <div>
        <p className="font-semibold text-gray-600">{title}</p>
        <p className="mt-1 max-w-xs text-sm text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function TrocasClient() {
  const [tab, setTab]           = useState<TabId>("offer");
  const [trades, setTrades]     = useState<Trade[]>([]);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState("");
  const [refresh, setRefresh]   = useState(0);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const loadTrades = useCallback(async () => {
    if (tab === "explore" || tab === "offer") return;
    setLoading(true);
    try {
      const r = await fetch(`/api/trades?tab=${tab}`);
      const d = await r.json();
      setTrades(Array.isArray(d) ? d : []);
    } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { loadTrades(); }, [loadTrades, refresh]);

  const accept = async (id: number) => {
    const r = await fetch(`/api/trades/${id}?action=accept`, { method: "POST" });
    const d = await r.json();
    if (!r.ok) { showToast(d.error ?? "Erro ao aceitar"); return; }
    showToast("Troca realizada! 🎉"); setRefresh((k) => k + 1);
  };
  const reject = async (id: number) => {
    await fetch(`/api/trades/${id}?action=reject`, { method: "POST" });
    showToast("Troca recusada."); setRefresh((k) => k + 1);
  };
  const cancel = async (id: number) => {
    await fetch(`/api/trades/${id}`, { method: "DELETE" });
    showToast("Oferta cancelada."); setRefresh((k) => k + 1);
  };

  const isListTab = tab !== "explore" && tab !== "offer";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* ── Hero header ─────────────────────────────────────────── */}
      <div className="relative bg-gb-ink px-6 pb-8 pt-8" style={{ clipPath: "inset(0 0 -40px 0)" }}>
        {/* Dot-grid texture — contained within hero bounds */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-none">
          <svg className="h-full w-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="trocas-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#trocas-dots)" />
          </svg>
          {/* Glow blob — clipped inside this wrapper */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gb-green/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gb-green/20">
              <ArrowLeftRight size={26} className="text-gb-green" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold leading-none text-white">Trocas</h1>
              <p className="mt-1.5 text-sm text-white/50">
                Encontre parceiros · Complete seu álbum
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-4 pb-12 pt-6">
        {/* Tabs card */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
          <div className="flex overflow-x-auto p-1.5 gap-1 scrollbar-hide">
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex shrink-0 items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    tab === id
                      ? "bg-gb-ink text-white shadow-sm"
                      : "text-muted hover:bg-gray-50 hover:text-gb-ink"
                  }`}>
                <Icon size={13} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Global toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex items-center gap-2 rounded-2xl bg-gb-green px-4 py-3 text-sm font-semibold text-white shadow-lg">
              <Sparkles size={15} /> {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
            {tab === "offer" ? (
              <OfferTab onSuccess={() => setRefresh((k) => k + 1)} />
            ) : tab === "explore" ? (
              <ExploreTab onSuccess={() => setRefresh((k) => k + 1)} />
            ) : loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 size={28} className="animate-spin text-gb-green/30" />
              </div>
            ) : trades.length === 0 ? (
              <EmptyState tab={tab} />
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {trades.map((t) => (
                    <TradeCard key={t.id} trade={t}
                      perspective={tab === "sent" ? "sent" : "received"}
                      onAccept={tab === "received" ? accept : undefined}
                      onReject={tab === "received" ? reject : undefined}
                      onCancel={tab === "sent" ? cancel : undefined}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Refresh */}
        {isListTab && !loading && (
          <div className="mt-6 flex justify-center">
            <button onClick={() => setRefresh((k) => k + 1)}
              className="flex items-center gap-2 rounded-2xl border border-border bg-white px-5 py-2.5 text-sm text-muted hover:bg-gray-50 shadow-sm transition-colors">
              <RefreshCw size={13} />
              Atualizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
