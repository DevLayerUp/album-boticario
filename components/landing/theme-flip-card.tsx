"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Layers, ImageIcon } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string | null;
  cover_image: string | null;
}

/** Paleta de degradê por índice — tons Boticário */
const GRADIENTS = [
  "from-[#063d2b] to-[#00a859]",
  "from-[#1a2e3a] to-[#2d6a8a]",
  "from-[#3d2006] to-[#a85900]",
  "from-[#2a063d] to-[#7a00a8]",
  "from-[#063d2b] to-[#d9a441]",
  "from-[#1f1f1f] to-[#4a4a4a]",
];

const ACCENT_COLORS = [
  "#00a859",
  "#2d8ab8",
  "#c87b2a",
  "#9b2ec8",
  "#d9a441",
  "#666666",
];

interface ThemeFlipCardProps {
  category: Category;
  index: number;
  delay?: number;
}

export function ThemeFlipCard({ category, index, delay = 0 }: ThemeFlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const accent   = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className="perspective-800 h-72 w-full cursor-pointer"
      onClick={() => setFlipped((f) => !f)}
      role="button"
      aria-pressed={flipped}
      aria-label={`Ver detalhes do tema ${category.name}`}
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFlipped((f) => !f)}
    >
      {/* Card wrapper — rotates on flip */}
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="transform-style-3d relative h-full w-full"
      >
        {/* ── FRENTE ────────────────────────────────────────────────── */}
        <div
          className={`backface-hidden absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} shadow-xl`}
        >
          {/* Cover image */}
          {category.cover_image ? (
            <Image
              src={category.cover_image}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover opacity-40 transition-opacity duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <ImageIcon size={72} className="text-white" />
            </div>
          )}

          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Bottom content */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            {/* Badge */}
            <span
              className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: `${accent}33`, color: accent }}
            >
              <Layers size={10} />
              Tema
            </span>

            <h3 className="font-display text-2xl font-bold leading-tight text-white drop-shadow">
              {category.name}
            </h3>

            <p className="mt-1 text-xs font-medium text-white/60">
              Toque para ver mais
            </p>
          </div>

          {/* Subtle top-right glow */}
          <div
            className="absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl"
            style={{ backgroundColor: `${accent}55` }}
          />
        </div>

        {/* ── VERSO ─────────────────────────────────────────────────── */}
        <div
          className={`backface-hidden rotate-y-180 absolute inset-0 overflow-hidden rounded-3xl bg-white shadow-xl`}
          style={{ border: `2px solid ${accent}33` }}
        >
          {/* Colored top bar */}
          <div
            className={`flex h-14 items-center gap-3 px-5 bg-gradient-to-r ${gradient}`}
          >
            <Layers size={18} className="text-white/80" />
            <span className="font-display text-sm font-bold text-white">
              {category.name}
            </span>
          </div>

          {/* Body */}
          <div className="flex h-[calc(100%-3.5rem)] flex-col justify-between p-5">
            <p className="text-sm leading-relaxed text-gb-slate">
              {category.description ||
                `Explore as figurinhas exclusivas da coleção ${category.name} e complete seu álbum digital do Grupo Boticário.`}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gb-slate/60">
                ← Toque para voltar
              </span>
              <a
                href="/register"
                onClick={(e) => e.stopPropagation()}
                className="rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                Colecionar
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
