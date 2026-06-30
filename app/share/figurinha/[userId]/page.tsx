import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/seo-metadata";
import { createClient } from "@/lib/supabase/server";
import { buildStickerShareText } from "@/lib/sticker-share";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, sticker_url")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.sticker_url) {
    return { title: "Figurinha não encontrada" };
  }

  const displayName = profile.display_name?.trim() || "Colecionador";
  const title = `Figurinha de ${displayName} — Fãs da Natureza`;
  const description = buildStickerShareText(displayName);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/share/figurinha/${userId}`;
  const ogImageUrl = `${siteUrl}/api/share/sticker/${userId}`;

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      locale: "pt_BR",
      siteName: "Fãs da Natureza",
      images: [
        {
          url: ogImageUrl,
          width: 352,
          height: 503,
          alt: `Figurinha de ${displayName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    robots: { index: true, follow: true },
  };
}

export default async function StickerPublicSharePage({ params }: PageProps) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, sticker_url")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.sticker_url) notFound();

  const displayName = profile.display_name?.trim() || "Colecionador";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-verde-escuro-500 px-4 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-verde-100">
          Fãs da Natureza
        </p>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Figurinha de {displayName}
        </h1>

        <div className="relative aspect-[352/503] w-[min(100%,240px)] overflow-hidden rounded-2xl shadow-2xl shadow-black/30">
          <Image
            src={profile.sticker_url}
            alt={`Figurinha de ${displayName}`}
            fill
            className="object-cover"
            sizes="240px"
            priority
          />
        </div>

        <p className="max-w-xs text-sm leading-relaxed text-white/85">
          {buildStickerShareText(displayName)}
        </p>

        <Link
          href="/register"
          className="inline-flex h-11 items-center justify-center rounded-pill bg-amarelo px-8 text-sm font-semibold text-verde-escuro-500 transition-colors hover:brightness-95"
        >
          Criar minha figurinha
        </Link>
      </div>
    </main>
  );
}
