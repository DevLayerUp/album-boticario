import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildAppPageMetadata } from "@/lib/seo-metadata";
import { createClient } from "@/lib/supabase/server";
import { FigurinhaHero } from "@/components/sticker/figurinha-hero";
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

  const firstName =
    (profile?.display_name ?? user.user_metadata?.full_name ?? "você")
      .split(" ")[0];

  const existingSticker = profile?.sticker_url ?? null;

  return (
    <>
      <FigurinhaHero firstName={firstName} hasSticker={Boolean(existingSticker)} />
      <div className="mx-auto w-full max-w-[1680px] space-y-6 px-6 py-6 sm:space-y-8 sm:px-12 sm:py-8 2xl:px-[120px]">
        <StickerOnboarding
          existingSticker={existingSticker}
          firstName={firstName}
        />
      </div>
    </>
  );
}
