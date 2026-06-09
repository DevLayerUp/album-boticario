"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, PackageOpen, Gift } from "lucide-react";
import { PackOpener } from "@/components/pack/pack-opener";

interface Pack {
  id: number;
  source: string;
  source_ref: string | null;
  opened_at: string | null;
  created_at: string;
}

const SOURCE_LABEL: Record<string, string> = {
  quiz:        "Quiz",
  mission:     "Missão",
  manual:      "Bônus",
  admin_grant: "Admin",
};

const SOURCE_COLOR: Record<string, string> = {
  quiz:        "bg-blue-50 text-blue-700 border-blue-100",
  mission:     "bg-purple-50 text-purple-700 border-purple-100",
  manual:      "bg-green-50 text-green-700 border-green-100",
  admin_grant: "bg-amber-50 text-amber-700 border-amber-100",
};

export function PacotinhosClient({ initialPacks }: { initialPacks: Pack[] }) {
  const [packs, setPacks]           = useState<Pack[]>(initialPacks);
  const [activePackId, setActive]   = useState<number | null>(null);
  const [activeSource, setSource]   = useState<string>("manual");

  const available = packs.filter((p) => !p.opened_at);
  const opened    = packs.filter((p) => p.opened_at);

  function openPack(pack: Pack) {
    setActive(pack.id);
    setSource(pack.source);
  }

  function handleComplete() {
    // Refresh pack list after opening
    setPacks((prev) =>
      prev.map((p) =>
        p.id === activePackId ? { ...p, opened_at: new Date().toISOString() } : p
      )
    );
    setActive(null);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-gb-ink">Meus Pacotinhos</h1>
        <p className="mt-1 text-gray-500">
          {available.length > 0
            ? `${available.length} pacotinho${available.length > 1 ? "s" : ""} disponível${available.length > 1 ? "s" : ""} para abrir`
            : "Nenhum pacotinho disponível · responda quiz ou conclua missões para ganhar"}
        </p>
      </div>

      {/* Pack opener modal */}
      <AnimatePresence>
        {activePackId !== null && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h2 className="mb-5 font-display text-lg font-semibold text-gb-ink">
                Abrir Pacotinho
              </h2>
              <PackOpener
                packId={activePackId}
                source={activeSource}
                onComplete={handleComplete}
                onClose={() => setActive(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Available packs */}
      {available.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Disponíveis
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {available.map((pack, i) => (
              <motion.button
                key={pack.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => openPack(pack)}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:border-gb-green hover:shadow-md"
              >
                <div className="flex h-20 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gb-green to-gb-green-deep shadow-md group-hover:shadow-gb-green/30 group-hover:shadow-lg transition-shadow">
                  <Package className="text-white" size={28} />
                </div>
                <div className="text-center">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${SOURCE_COLOR[pack.source] ?? SOURCE_COLOR.manual}`}
                  >
                    {SOURCE_LABEL[pack.source] ?? pack.source}
                  </span>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(pack.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="rounded-lg bg-gb-green px-4 py-1.5 text-xs font-semibold text-white group-hover:bg-gb-green-dark transition-colors">
                  Abrir
                </span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {available.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
          <Gift className="text-gray-300" size={48} />
          <div>
            <p className="font-medium text-gray-600">Sem pacotinhos disponíveis</p>
            <p className="mt-1 text-sm text-gray-400">
              Responda o quiz diário ou conclua missões para ganhar pacotinhos
            </p>
          </div>
        </div>
      )}

      {/* Opened history */}
      {opened.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Já abertos ({opened.length})
          </h2>
          <div className="space-y-2">
            {opened.slice(0, 12).map((pack) => (
              <div
                key={pack.id}
                className="flex items-center justify-between rounded-xl border border-border bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <PackageOpen className="text-gray-300" size={20} />
                  <div>
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${SOURCE_COLOR[pack.source] ?? SOURCE_COLOR.manual}`}
                    >
                      {SOURCE_LABEL[pack.source] ?? pack.source}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {pack.opened_at
                    ? new Date(pack.opened_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "—"}
                </span>
              </div>
            ))}
            {opened.length > 12 && (
              <p className="text-center text-xs text-gray-400">
                + {opened.length - 12} pacotinhos abertos anteriormente
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
