"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Target, CheckCircle, Package, Clock, Loader2 } from "lucide-react";

interface Mission {
  id: number;
  title: string;
  description: string;
  type: string;
  target_value: number;
  reward_packs: number;
  expires_at: string | null;
  progress: number;
  completed_at: string | null;
  reward_claimed: boolean;
}

const TYPE_ICON: Record<string, string> = {
  complete_album_page: "📚",
  trade_count:         "🔄",
  quiz_streak:         "🧠",
  open_packs:          "📦",
};

export function MissoesClient() {
  const [missions, setMissions]   = useState<Mission[]>([]);
  const [loading, setLoading]     = useState(true);
  const [claiming, setClaiming]   = useState<number | null>(null);
  const [toast, setToast]         = useState("");

  const loadMissions = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/missions");
    const data = await res.json();
    setMissions(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { loadMissions(); }, [loadMissions]);

  async function claim(missionId: number) {
    setClaiming(missionId);
    const res  = await fetch("/api/missions/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mission_id: missionId }),
    });
    const data = await res.json();
    setClaiming(null);
    if (res.ok) {
      setToast(`🎉 Recompensa reivindicada! +${data.packs_earned} pacotinho${data.packs_earned > 1 ? "s" : ""}`);
      setTimeout(() => setToast(""), 4_000);
      await loadMissions();
    }
  }

  const active    = missions.filter((m) => !m.completed_at);
  const completed = missions.filter((m) => m.completed_at);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gb-green" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      {/* Toast */}
      {toast && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed right-4 top-20 z-50 rounded-xl bg-gb-ink px-5 py-3 text-sm font-medium text-white shadow-xl"
        >
          {toast}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gb-green/10">
          <Target className="text-gb-green" size={20} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-gb-ink">Missões</h1>
          <p className="text-sm text-gray-500">Complete missões e ganhe pacotinhos</p>
        </div>
      </div>

      {missions.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
          <Target className="text-gray-300" size={44} />
          <div>
            <p className="font-medium text-gray-600">Nenhuma missão ativa</p>
            <p className="mt-1 text-sm text-gray-400">O admin ainda não cadastrou missões</p>
          </div>
        </div>
      )}

      {/* Active missions */}
      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Ativas ({active.length})
          </h2>
          {active.map((m, i) => {
            const pct = Math.min((m.progress / m.target_value) * 100, 100);
            const canClaim = m.completed_at && !m.reward_claimed;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{TYPE_ICON[m.type] ?? "🎯"}</span>
                    <div>
                      <h3 className="font-semibold text-gb-ink">{m.title}</h3>
                      {m.description && (
                        <p className="mt-0.5 text-sm text-gray-500">{m.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-gb-green/10 px-2 py-0.5 text-xs font-semibold text-gb-green">
                    <Package size={11} />
                    {m.reward_packs}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>
                      {m.progress} / {m.target_value}
                    </span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={m.progress}
                    aria-valuemin={0}
                    aria-valuemax={m.target_value}
                    aria-label={`Progresso da missão: ${m.progress} de ${m.target_value}`}
                    className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-gb-green"
                    />
                  </div>
                </div>

                {/* Expires */}
                {m.expires_at && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} />
                    Expira em {new Date(m.expires_at).toLocaleDateString("pt-BR")}
                  </div>
                )}

                {canClaim && (
                  <button
                    onClick={() => claim(m.id)}
                    disabled={claiming === m.id}
                    className="mt-3 w-full rounded-xl bg-gb-green py-2.5 text-sm font-semibold text-white hover:bg-gb-green-dark disabled:opacity-60"
                  >
                    {claiming === m.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={14} /> Reivindicando…
                      </span>
                    ) : "🎁 Reivindicar recompensa"}
                  </button>
                )}
              </motion.div>
            );
          })}
        </section>
      )}

      {/* Completed missions */}
      {completed.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Concluídas ({completed.length})
          </h2>
          {completed.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-border bg-gray-50 px-4 py-3"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="shrink-0 text-green-500" size={18} />
                <span className="text-sm font-medium text-gray-500">{m.title}</span>
              </div>
              {m.reward_claimed ? (
                <span className="text-xs text-gray-400">Reivindicado</span>
              ) : (
                <button
                  onClick={() => claim(m.id)}
                  disabled={claiming === m.id}
                  className="rounded-lg bg-gb-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-gb-green-dark"
                >
                  🎁 Resgatar
                </button>
              )}
            </div>
          ))}
        </section>
      )}

      <div className="text-center text-sm text-gray-400">
        Complete missões jogando.{" "}
        <Link href="/quiz" className="text-gb-green hover:underline">
          Responder quiz
        </Link>{" "}
        ·{" "}
        <Link href="/pacotinhos" className="text-gb-green hover:underline">
          Abrir pacotinhos
        </Link>
      </div>
    </div>
  );
}
