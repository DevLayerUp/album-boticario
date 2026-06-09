import { createClient } from "@/lib/supabase/server";
import { StickerOnboarding } from "@/components/sticker/sticker-onboarding";

export const dynamic = "force-dynamic";

export default async function FigurinhaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Busca o profile para verificar se já existe uma figurinha
  const { data: profile } = await supabase
    .from("profiles")
    .select("sticker_url, display_name")
    .eq("id", user!.id)
    .single();

  const firstName =
    (profile?.display_name ?? user?.user_metadata?.full_name ?? "você")
      .split(" ")[0];

  return (
    <StickerOnboarding
      existingSticker={profile?.sticker_url ?? null}
      firstName={firstName}
    />
  );
}
