"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";
import { dashboardAssets } from "@/lib/dashboard-assets";

interface AlbumCoverProps {
  /** URL of the uploaded cover image from Supabase storage */
  coverUrl?: string | null;
}

/**
 * Full-page album cover rendered as the first page in the react-pageflip book.
 *
 * Design follows the Figma spec (node 100:711):
 *   - Dark green (#0d6632) background
 *   - Rounded left spine (rounded-l-card, sharp right edge toward the book)
 *   - When coverUrl is provided the image fills the entire cover
 *   - When no image is uploaded a styled green fallback is shown
 *
 * The wrapping <div> is intentionally left without explicit dimensions so
 * react-pageflip (via showCover) controls sizing through its stretch mode.
 */
export function AlbumCover({ coverUrl }: AlbumCoverProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-l-card bg-verde-escuro-500">
      {/* Background texture overlay — same decoration asset as regular pages */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-right bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url(${dashboardAssets.album.right})`,
          backgroundSize: "auto",
        }}
      />

      {coverUrl ? (
        /* ── Custom cover image uploaded by admin ───────────────────── */
        <Image
          src={coverUrl}
          alt="Capa do álbum"
          fill
          className="z-10 object-cover"
          sizes="(max-width: 640px) 100vw, 560px"
          priority
        />
      ) : (
        /* ── Fallback cover ──────────────────────────────────────────── */
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-8 text-center">
          {/* Green decorative blob behind the icon */}
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-verde-500/40">
            <BookOpen size={40} className="text-white" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-verde-300">
              Fundação Grupo Boticário
            </p>
            <h1 className="font-display text-3xl font-extrabold uppercase leading-tight text-verde-escuro-100">
              Colecionando
              <br />
              Natureza
            </h1>
            <p className="font-display text-5xl font-extrabold text-verde-500">
              2026
            </p>
          </div>

          <p className="max-w-[200px] text-xs leading-relaxed text-verde-300/80">
            O Álbum Oficial dos Fãs por Natureza
          </p>

          {/* Hint for admin */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <span className="rounded-full bg-black/20 px-3 py-1 text-[10px] text-white/40">
              Faça upload da capa no painel admin
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
