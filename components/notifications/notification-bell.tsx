"use client";

import { useCallback, useEffect, useRef, useState, type ElementType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ArrowLeftRight,
  HelpCircle,
  Target,
  Megaphone,
  CheckCheck,
  Loader2,
  X,
} from "lucide-react";
import type { AppNotification, NotificationType } from "@/lib/notifications";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  NotificationType,
  { label: string; icon: ElementType; accent: string }
> = {
  trade_request: {
    label: "Troca",
    icon: ArrowLeftRight,
    accent: "bg-amber-100 text-amber-700",
  },
  trade_accepted: {
    label: "Troca",
    icon: ArrowLeftRight,
    accent: "bg-emerald-100 text-emerald-700",
  },
  trade_rejected: {
    label: "Troca",
    icon: ArrowLeftRight,
    accent: "bg-red-100 text-red-600",
  },
  quiz_available: {
    label: "Quiz",
    icon: HelpCircle,
    accent: "bg-sky-100 text-sky-700",
  },
  mission_complete: {
    label: "Conquista",
    icon: Target,
    accent: "bg-violet-100 text-violet-700",
  },
  announcement: {
    label: "Aviso",
    icon: Megaphone,
    accent: "bg-orange-100 text-orange-700",
  },
};

function isUnread(item: AppNotification) {
  return !item.read_at;
}

function getItemId(item: AppNotification) {
  if ("announcement_id" in item) return item.id;
  return String(item.id);
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function NotificationBell() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnreadCount(data.unread_count ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) void load();
    };

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof requestIdleCallback !== "undefined") {
      idleId = requestIdleCallback(run, { timeout: 3000 });
    } else {
      timeoutId = setTimeout(run, 1500);
    }

    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      if (idleId !== undefined) cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [load]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (window.innerWidth < 768) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open || window.innerWidth >= 768) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function markRead(item: AppNotification) {
    const body =
      "announcement_id" in item
        ? { announcement_id: item.announcement_id }
        : { id: item.id };

    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setItems((prev) =>
      prev.map((n) =>
        getItemId(n) === getItemId(item)
          ? { ...n, read_at: new Date().toISOString() }
          : n,
      ),
    );
    setUnreadCount((c) => Math.max(0, c - (isUnread(item) ? 1 : 0)));
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const now = new Date().toISOString();
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
      setUnreadCount(0);
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleItemClick(item: AppNotification) {
    if (isUnread(item)) await markRead(item);
    setOpen(false);
    if (item.href) router.push(item.href);
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Fechar notificações"
          className="fixed inset-0 z-40 bg-verde-escuro-500/25 backdrop-blur-[2px] md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="relative" ref={panelRef}>
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            if (!open) load();
          }}
          aria-label={
            unreadCount > 0
              ? `Notificações, ${unreadCount} não lidas`
              : "Notificações"
          }
          aria-expanded={open}
          aria-haspopup="dialog"
          className="relative flex size-9 items-center justify-center rounded-pill text-verde-escuro-500 transition-colors hover:bg-verde-500/10"
        >
          <Bell aria-hidden className="size-[18px]" strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gb-green px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {open ? (
          <div
            role="dialog"
            aria-label="Notificações"
            className={cn(
              "z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-xl",
              "fixed inset-x-3 top-[calc(5rem+0.5rem)] max-h-[min(28rem,calc(100dvh-6rem))]",
              "md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-[min(100vw-2rem,22rem)] md:max-h-[min(24rem,60vh)]",
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <p className="min-w-0 text-sm font-bold text-gb-ink">Notificações</p>
              <div className="flex shrink-0 items-center gap-1">
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={markAllRead}
                    disabled={markingAll}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-gb-green transition-colors hover:bg-gb-green/10 disabled:opacity-50"
                  >
                    {markingAll ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <CheckCheck size={12} />
                    )}
                    Marcar todas
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar"
                  className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 size={22} className="animate-spin text-gb-green/40" />
                </div>
              ) : items.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted">
                  Nenhuma notificação por aqui.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((item) => {
                    const meta = TYPE_META[item.type];
                    const Icon = meta.icon;
                    const unread = isUnread(item);

                    return (
                      <li key={getItemId(item)}>
                        <button
                          type="button"
                          onClick={() => handleItemClick(item)}
                          className={cn(
                            "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                            unread && "bg-gb-green/[0.03]",
                          )}
                        >
                          <div
                            className={cn(
                              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
                              meta.accent,
                            )}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={cn(
                                  "text-sm leading-snug",
                                  unread
                                    ? "font-bold text-gb-ink"
                                    : "font-medium text-gb-ink/80",
                                )}
                              >
                                {item.title}
                              </p>
                              <span className="shrink-0 text-[10px] text-muted">
                                {formatWhen(item.created_at)}
                              </span>
                            </div>
                            {item.body ? (
                              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                                {item.body}
                              </p>
                            ) : null}
                            <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-gb-green/80">
                              {meta.label}
                            </span>
                          </div>
                          {unread ? (
                            <span className="mt-2 size-2 shrink-0 rounded-full bg-gb-green" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="shrink-0 border-t border-border bg-gray-50 px-4 py-2.5 text-center">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-gb-green hover:underline"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
