"use client";

import { useCallback, useState } from "react";
import {
  Copy,
  Check,
  Share2,
  Users,
  Link2,
} from "lucide-react";
import { SocialShareButtons } from "@/components/ui/social-share-buttons";
import type { ReferralSummary } from "@/lib/referrals";
import { buildShareText } from "@/lib/referrals";

interface InviteCardProps {
  data: ReferralSummary;
  inviterName?: string | null;
}

export function InviteCard({ data, inviterName }: InviteCardProps) {
  const [copied, setCopied] = useState(false);
  const shareText = buildShareText(data.invite_url, inviterName);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(data.invite_url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback silencioso */
    }
  }, [data.invite_url]);

  const copyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback silencioso */
    }
  }, [shareText]);

  async function nativeShare() {
    if (typeof navigator.share !== "function") {
      await copyMessage();
      return;
    }
    try {
      await navigator.share({
        title: "Álbum Fãs por Natureza",
        text: shareText,
        url: data.invite_url,
      });
    } catch {
      /* usuário cancelou */
    }
  }

  return (
    <section
      id="convidar-amigos"
      className="overflow-hidden rounded-block border border-verde-500/20 bg-gradient-to-br from-verde-100/80 to-surface"
    >
      <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-chip bg-verde-500 text-white">
              <Share2 aria-hidden className="size-4" strokeWidth={2} />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-verde-escuro-500">
                Convide amigos
              </h2>
              <p className="text-sm text-verde-escuro-capa/70">
                Compartilhe seu link e acompanhe quem se cadastrou pelo convite.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-verde-500/15 bg-white/70 px-4 py-3">
            <Users aria-hidden className="size-5 shrink-0 text-verde-500" />
            <div>
              <p className="text-2xl font-bold leading-none text-verde-escuro-500">
                {data.signup_count}
              </p>
              <p className="text-xs text-verde-escuro-capa/60">
                {data.signup_count === 1
                  ? "cadastro com seu convite"
                  : "cadastros com seu convite"}
              </p>
            </div>
          </div>

          {data.recent_signups.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm text-verde-escuro-500/80">
              {data.recent_signups.map((u) => (
                <li key={u.id} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-verde-500" />
                  {u.display_name ?? "Novo colecionador"}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full shrink-0 lg:max-w-md">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-verde-escuro-capa/60">
            Seu link de convite
          </label>
          <div className="flex gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-verde-escuro-500">
              <Link2 aria-hidden className="size-4 shrink-0 text-verde-500/60" />
              <span className="truncate font-medium">{data.invite_url}</span>
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-verde-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-verde-escuro-500"
            >
              {copied ? (
                <Check aria-hidden className="size-4" />
              ) : (
                <Copy aria-hidden className="size-4" />
              )}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="mt-2 text-xs text-verde-escuro-capa/50">
            Código: <span className="font-mono font-semibold">{data.referral_code}</span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SocialShareButtons
              shareUrl={data.invite_url}
              shareText={shareText}
              size="md"
              className="justify-start"
              onNativeShare={nativeShare}
            />
            <button
              type="button"
              onClick={copyMessage}
              className="inline-flex items-center gap-2 rounded-pill border border-verde-500/25 bg-white px-4 py-2 text-sm font-medium text-verde-escuro-500 transition-colors hover:bg-verde-100/60"
            >
              <Copy aria-hidden className="size-4" />
              Copiar mensagem
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
