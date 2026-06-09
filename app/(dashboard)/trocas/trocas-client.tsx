"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight, Compass, History, BookmarkPlus, Bookmark,
  CheckCircle2, XCircle, Loader2, Plus, PackageOpen,
  User, Sparkles, Send, Inbox, Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Rarity  { name: string; slug: string; color_hex: string }
interface Sticker { id: number; name: string; image_url: string; rarities: Rarity | null }
interface Profile { id: string; display_name: string; sticker_url: string | null }

interface Trade {
  id: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message: string | null;
  created_at: string;
  resolved_at: string | null;
  requester_id: string;
  receiver_id: string;
  offered_sticker: Sticker | null;
  requested_sticker: Sticker | null;
  requester: Profile | null;
  receiver: Profile | null;
}

interface Wish {
  id: number;
  created_at: string;
  sticker: Sticker | null;
  user: Profile | null;
  user_stickers: { sticker: Sticker | null; quantity: number }[];
}

interface MyWish {
  id: number;
  status: string;
  created_at: string;
  stickers: Sticker | null;
}

interface TradeableEntry { sticker: Sticker | null; quantity: number }

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "wishlist", label: "Qual Preciso",  Icon: Bookmark       },
  { id: "explore",  label: "Explorar",      Icon: Compass        },
  { id: "offers",   label: "Ofertas",       Icon: ArrowLeftRight },
  { id: "history",  label: "Histórico",     Icon: History        },
] as const;
type TabId = typeof TABS[number]["id"];

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: "Aguardando", bg: "bg-amber-100",   text: "text-amber-700"   },
  accepted:  { label: "Aceita",     bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected:  { label: "Recusada",   bg: "bg-red-100",     text: "text-red-600"     },
  cancelled: { label: "Cancelada",  bg: "bg-gray-100",    text: "text-gray-500"    },
};

// ─── Shared atoms ─────────────────────────────────────────────────────────────
function Avatar({ profile, size = 36 }: { profile: Profile | null; size?: number }) {
  if (!profile) {
    return (
      <div
        className="shrink-0 rounded-full bg-gray-100"
        style={{ width: size, height: size }}
      />
    );
  }
  return profile.sticker_url ? (
    <div
      className="relative shrink-0 overflow-hidden rounded-full ring-2 ring-gb-green/20"
      style={{ width: size, height: size }}
    >
      <Image
        src={profile.sticker_url}
        alt={profile.display_name}
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </div>
  ) : (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-gb-green/10"
      style={{ width: size, height: size }}
    >
      <User size={size * 0.44} className="text-gb-green" />
    </div>
  );
}

function StickerCard({
  sticker,
  size = 72,
  selected = false,
  badge,
}: {
  sticker: Sticker | null;
  size?: number;
  selected?: boolean;
  badge?: string | number;
}) {
  if (!sticker) {
    return (
      <div
        className="shrink-0 rounded-xl bg-gray-100"
        style={{ width: size, height: size }}
      />
    );
  }
  const glow = sticker.rarities?.color_hex ?? "#00a859";
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200"
      style={{
        width: size,
        height: size,
        borderColor: selected ? "#00a859" : glow,
        boxShadow: selected
          ? `0 0 0 3px #00a85940, 0 4px 12px ${glow}40`
          : `0 2px 8px ${glow}30`,
      }}
    >
      <Image
        src={sticker.image_url}
        alt={sticker.name}
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
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

function EmptyState({
  message,
  icon: Icon = PackageOpen,
}: {
  message: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Icon size={36} className="text-gray-200" />
      <p className="max-w-xs text-sm text-gray-400">{message}</p>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 rounded-2xl bg-gb-green px-4 py-3 text-sm font-semibold text-white shadow-lg"
    >
      <Sparkles size={16} />
      {message}
    </motion.div>
  );
}

// ─── Trade Card ───────────────────────────────────────────────────────────────
function TradeCard({
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
    try { fn(trade.id); } finally { setBusy(false); }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar profile={other} size={32} />
          <div>
            <p className="text-sm font-semibold leading-none text-gb-ink">
              {perspective === "sent" ? "Para" : "De"}{" "}
              <span className="text-gb-green">{other?.display_name ?? "Usuário"}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              {new Date(trade.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
          {s.label}
        </span>
      </div>

      {/* Exchange visual */}
      <div className="flex items-center justify-center gap-4 px-6 py-5">
        <div className="flex flex-col items-center gap-1.5">
          <StickerCard sticker={trade.offered_sticker} size={80} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gb-green">
            Oferece
          </span>
          <span className="max-w-[80px] truncate text-center text-[11px] leading-tight text-gray-600">
            {trade.offered_sticker?.name ?? "—"}
          </span>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gb-ink text-white shadow-md">
          <ArrowLeftRight size={18} />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <StickerCard sticker={trade.requested_sticker} size={80} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
            Quer
          </span>
          <span className="max-w-[80px] truncate text-center text-[11px] leading-tight text-gray-600">
            {trade.requested_sticker?.name ?? "—"}
          </span>
        </div>
      </div>

      {/* Actions */}
      {trade.status === "pending" && (
        <div className="flex gap-2 border-t border-border px-4 py-3">
          {perspective === "received" ? (
            <>
              <button
                disabled={busy}
                onClick={() => act(onAccept)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gb-green py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gb-green-dark disabled:opacity-60"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Aceitar
              </button>
              <button
                disabled={busy}
                onClick={() => act(onReject)}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                <XCircle size={14} />
              </button>
            </>
          ) : (
            <button
              disabled={busy}
              onClick={() => act(onCancel)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-60"
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

// ─── Modal base ───────────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 48 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── AddWishModal ─────────────────────────────────────────────────────────────
function AddWishModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    fetch("/api/admin/figurinhas?active=true")
      .then((r) => r.json())
      .then((d) => setStickers(Array.isArray(d) ? d : []))
      .catch(() => setStickers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = stickers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/trades/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sticker_id: selected }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Erro ao criar pedido"); return; }
      onSuccess();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gb-green/10 text-gb-green">
          <BookmarkPlus size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-gb-ink">Nova busca</p>
          <p className="text-xs text-muted">Qual figurinha você precisa?</p>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <input
          placeholder="Buscar figurinha…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-gb-green focus:bg-white"
        />
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-gb-green/40" />
          </div>
        ) : (
          <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto pr-1">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl p-1.5 transition-all ${
                  selected === s.id ? "bg-gb-green/10 ring-2 ring-gb-green/40" : "hover:bg-gray-50"
                }`}
              >
                <StickerCard sticker={s} size={52} selected={selected === s.id} />
                <p className="line-clamp-2 text-center text-[9px] font-medium leading-tight text-gb-ink">
                  {s.name}
                </p>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-4 py-6 text-center text-sm text-muted">
                Nenhuma figurinha encontrada.
              </p>
            )}
          </div>
        )}
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="flex gap-3 border-t border-border px-5 py-4">
        <button
          onClick={onClose}
          className="flex-1 rounded-2xl border border-border py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          disabled={!selected || saving}
          onClick={save}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gb-green py-2.5 text-sm font-bold text-white transition-colors hover:bg-gb-green-dark disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <BookmarkPlus size={14} />}
          Criar pedido
        </button>
      </div>
    </Modal>
  );
}

// ─── FulfillWishModal ─────────────────────────────────────────────────────────
function FulfillWishModal({
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
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage]   = useState("");
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState("");

  const canOffer = wish.sticker != null &&
    myAvailable.some((m) => m.sticker?.id === wish.sticker!.id);

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
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Erro ao enviar"); return; }
      onSuccess();
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <Avatar profile={wish.user} size={36} />
        <div>
          <p className="text-sm font-bold text-gb-ink">Oferecer figurinha</p>
          <p className="text-xs text-muted">para {wish.user?.display_name}</p>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        {/* O que você vai dar */}
        <div className="flex items-center gap-3 rounded-2xl border border-gb-green/20 bg-gb-green/5 px-3 py-2.5">
          <StickerCard sticker={wish.sticker} size={48} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gb-green">
              Você vai oferecer
            </p>
            <p className="text-sm font-semibold text-gb-ink">{wish.sticker?.name}</p>
            {!canOffer && (
              <p className="mt-1 text-xs text-red-500">
                Você não tem duplicatas desta figurinha
              </p>
            )}
          </div>
        </div>

        {/* O que você quer */}
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          O que você quer de {wish.user?.display_name}?
        </p>

        {wish.user_stickers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-amber-50 py-6 text-center text-sm text-amber-700">
            <PackageOpen size={24} className="text-amber-400" />
            Esse usuário não tem figurinhas disponíveis.
          </div>
        ) : (
          <div className="grid max-h-44 grid-cols-4 gap-2 overflow-y-auto pr-1">
            {wish.user_stickers.map(({ sticker: st, quantity }) => {
              if (!st) return null;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelected(st.id)}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-1.5 transition-all ${
                    selected === st.id
                      ? "bg-gb-green/10 ring-2 ring-gb-green/40"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <StickerCard
                    sticker={st}
                    size={52}
                    selected={selected === st.id}
                    badge={quantity > 1 ? quantity : undefined}
                  />
                  <p className="line-clamp-2 text-center text-[9px] font-medium leading-tight text-gb-ink">
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
          className="w-full rounded-xl border border-border bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-gb-green focus:bg-white"
        />

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="flex gap-3 border-t border-border px-5 py-4">
        <button
          onClick={onClose}
          className="flex-1 rounded-2xl border border-border py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          disabled={!selected || !canOffer || sending}
          onClick={send}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gb-green py-2.5 text-sm font-bold text-white transition-colors hover:bg-gb-green-dark disabled:opacity-50"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Enviar oferta
        </button>
      </div>
    </Modal>
  );
}

// ─── Tab: Qual Preciso ────────────────────────────────────────────────────────
function WishlistTab() {
  const [wishes, setWishes]   = useState<MyWish[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [busy, setBusy]       = useState<number | null>(null);
  const [toast, setToast]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetch("/api/trades/wishes/mine").then((r) => r.json());
      setWishes(Array.isArray(d) ? d : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function cancel(id: number) {
    setBusy(id);
    try {
      await fetch(`/api/trades/wishes/${id}`, { method: "DELETE" });
      setWishes((prev) => prev.filter((w) => w.id !== id));
    } finally {
      setBusy(null);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div className="space-y-5">
      <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Figurinhas que você está buscando. Seus pedidos aparecem para outros colecionadores.
        </p>
        <button
          onClick={() => setAdding(true)}
          className="ml-3 flex shrink-0 items-center gap-1.5 rounded-2xl bg-gb-green px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-gb-green-dark"
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-gb-green/30" />
        </div>
      ) : wishes.length === 0 ? (
        <EmptyState
          message="Nenhum pedido criado ainda. Clique em Adicionar para buscar figurinhas."
          icon={Bookmark}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AnimatePresence>
            {wishes.map((w) => (
              <motion.div
                key={w.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-sm"
              >
                <div className="flex flex-col items-center gap-2">
                  <StickerCard sticker={w.stickers} size={64} />
                  <p className="line-clamp-2 text-center text-xs font-semibold leading-tight text-gb-ink">
                    {w.stickers?.name ?? "—"}
                  </p>
                  <p className="text-[10px] text-muted">
                    {new Date(w.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => cancel(w.id)}
                  disabled={busy === w.id}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-red-200 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  {busy === w.id ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Trash2 size={11} />
                  )}
                  Cancelar
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {adding && (
          <AddWishModal
            onClose={() => setAdding(false)}
            onSuccess={() => { load(); showToast("Pedido criado! Outros colecionadores já podem ver."); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab: Explorar ────────────────────────────────────────────────────────────
function ExploreTab() {
  const [wishes, setWishes]           = useState<Wish[]>([]);
  const [myAvailable, setMyAvailable] = useState<TradeableEntry[]>([]);
  const [loading, setLoading]         = useState(true);
  const [fulfill, setFulfill]         = useState<Wish | null>(null);
  const [toast, setToast]             = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/trades/wishes").then((r) => r.json()).catch(() => []),
      fetch("/api/trades/available").then((r) => r.json()).catch(() => []),
    ]).then(([w, a]) => {
      setWishes(Array.isArray(w) ? w : []);
      setMyAvailable(Array.isArray(a) ? a : []);
    }).finally(() => setLoading(false));
  }, []);

  function canOffer(wantedId: number) {
    return myAvailable.some((m) => m.sticker?.id === wantedId);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div className="space-y-5">
      <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>

      <p className="text-sm text-muted">
        Pedidos abertos de outros colecionadores. Se você tiver a figurinha, pode oferecer!
      </p>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-gb-green/30" />
        </div>
      ) : wishes.length === 0 ? (
        <EmptyState
          message="Nenhum pedido aberto no momento. Volte mais tarde!"
          icon={Compass}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {wishes.map((w) => {
              if (!w.user || !w.sticker) return null;
              const eligible = canOffer(w.sticker.id);
              return (
                <motion.div
                  key={w.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
                >
                  {/* User row */}
                  <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                    <Avatar profile={w.user} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gb-ink">
                        {w.user.display_name}
                      </p>
                      <p className="text-xs text-muted">
                        {new Date(w.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                    {/* Sticker being sought */}
                    <div className="flex flex-col items-center gap-1">
                      <StickerCard sticker={w.sticker} size={56} />
                      <p className="max-w-[64px] truncate text-center text-[10px] font-semibold text-gb-ink">
                        {w.sticker.name}
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="px-4 pb-4">
                    {eligible ? (
                      <button
                        onClick={() => setFulfill(w)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gb-green py-2.5 text-sm font-bold text-white transition-colors hover:bg-gb-green-dark"
                      >
                        <ArrowLeftRight size={14} />
                        Oferecer figurinha
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-2.5 text-xs text-muted">
                        Você não tem duplicatas desta figurinha
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {fulfill && (
          <FulfillWishModal
            wish={fulfill}
            myAvailable={myAvailable}
            onClose={() => setFulfill(null)}
            onSuccess={() => {
              showToast("Oferta enviada! Aguardando resposta.");
              setFulfill(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab: Ofertas (sent + received) ──────────────────────────────────────────
function OffersTab() {
  const [sent, setSent]         = useState<Trade[]>([]);
  const [received, setReceived] = useState<Trade[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, r] = await Promise.all([
      fetch("/api/trades?tab=sent").then((r) => r.json()).catch(() => []),
      fetch("/api/trades?tab=received").then((r) => r.json()).catch(() => []),
    ]);
    setSent(Array.isArray(s) ? s : []);
    setReceived(Array.isArray(r) ? r : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

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

  return (
    <div className="space-y-7">
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-gb-green/30" />
        </div>
      ) : (
        <>
          {/* Recebidas */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Inbox size={15} className="text-gb-green" />
              <h3 className="text-sm font-bold text-gb-ink">Recebidas</h3>
              {received.length > 0 && (
                <span className="rounded-full bg-gb-green px-2 py-0.5 text-[10px] font-black text-white">
                  {received.length}
                </span>
              )}
            </div>
            {received.length === 0 ? (
              <p className="rounded-2xl bg-gray-50 py-6 text-center text-sm text-muted">
                Nenhuma oferta recebida.
              </p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {received.map((t) => (
                    <TradeCard
                      key={t.id}
                      trade={t}
                      perspective="received"
                      onAccept={accept}
                      onReject={reject}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* Enviadas */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Send size={15} className="text-muted" />
              <h3 className="text-sm font-bold text-gb-ink">Enviadas</h3>
              {sent.length > 0 && (
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-black text-gray-600">
                  {sent.length}
                </span>
              )}
            </div>
            {sent.length === 0 ? (
              <p className="rounded-2xl bg-gray-50 py-6 text-center text-sm text-muted">
                Nenhuma oferta enviada.
              </p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {sent.map((t) => (
                    <TradeCard
                      key={t.id}
                      trade={t}
                      perspective="sent"
                      onCancel={cancel}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

// ─── Tab: Histórico ───────────────────────────────────────────────────────────
function HistoryTab() {
  const [trades, setTrades]   = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trades?tab=history")
      .then((r) => r.json())
      .then((d) => setTrades(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-gb-green/30" />
        </div>
      ) : trades.length === 0 ? (
        <EmptyState message="Nenhuma troca concluída ainda." icon={History} />
      ) : (
        <AnimatePresence>
          {trades.map((t) => (
            <TradeCard key={t.id} trade={t} perspective="sent" />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TrocasClient() {
  const [tab, setTab] = useState<TabId>("wishlist");

  return (
    <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-gb-ink">Trocas</h1>
        <p className="mt-1 text-sm text-muted">
          Troque figurinhas duplicadas com outros colecionadores
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl bg-gray-100 p-1 [scrollbar-width:none]">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex min-w-max flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
              tab === id
                ? "bg-white text-gb-green shadow-sm"
                : "text-gray-500 hover:text-gb-ink"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {tab === "wishlist" && <WishlistTab />}
          {tab === "explore"  && <ExploreTab />}
          {tab === "offers"   && <OffersTab />}
          {tab === "history"  && <HistoryTab />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
