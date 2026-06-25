import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildAppPageMetadata } from "@/lib/seo-metadata";
import { createClient } from "@/lib/supabase/server";
import { FigurinhaPageShell } from "@/components/sticker/figurinha-page-shell";
import { StickerOnboarding } from "@/components/sticker/sticker-onboarding";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildAppPageMetadata("figurinha");
}

export default async function FigurinhaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("sticker_url, display_name")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name?.trim() ||
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    "Colecionador";

  const existingSticker = profile?.sticker_url ?? null;

  return (
    <FigurinhaPageShell>
      <StickerOnboarding
        existingSticker={existingSticker}
        displayName={displayName}
      />
    </FigurinhaPageShell>
  );
}
