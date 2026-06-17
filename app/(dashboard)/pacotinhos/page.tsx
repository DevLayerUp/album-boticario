import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolvePackVisualSettings } from "@/lib/pack-settings";
import { mapOpenedPackHistory, OPENED_HISTORY_PAGE_SIZE } from "@/lib/pack-opened-history";
import { PacotinhosClient } from "@/components/pacotinhos/pacotinhos-client";
import type { OpenedPackHistory, Pack } from "@/components/pacotinhos/types";

export const metadata: Metadata = { title: "Pacotinhos" };

type PackRow = {
  id: number;
  source: string;
  source_ref: string | null;
  opened_at: string | null;
  created_at: string;
  pack_stickers: { position: number }[] | null;
};

type OpenedRow = {
  id: number;
  source: string;
  opened_at: string;
  pack_stickers: {
    position: number;
    stickers: unknown;
  }[] | null;
};

export default async function PacotinhosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const [
    { data: packRows },
    { data: openedRows },
    { data: stickerRows },
    { data: settings },
  ] = await Promise.all([
    supabase
      .from("packs")
      .select("id, source, source_ref, opened_at, created_at, pack_stickers(position)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("packs")
      .select(
        `id, source, opened_at,
         pack_stickers (
           position,
           stickers (id, name, image_url, rarities (name, slug, color_hex))
         )`,
      )
      .eq("user_id", user.id)
      .not("opened_at", "is", null)
      .order("opened_at", { ascending: false })
      .limit(OPENED_HISTORY_PAGE_SIZE),
    supabase.from("user_stickers").select("quantity").eq("user_id", user.id),
    admin
      .from("app_settings")
      .select("key, value")
      .in("key", ["pack_image_url", "pack_opening_gif_url"]),
  ]);

  const settingsMap = Object.fromEntries((settings ?? []).map((s) => [s.key, s.value]));
  const visual = resolvePackVisualSettings(
    settingsMap.pack_image_url,
    settingsMap.pack_opening_gif_url,
  );

  const packs: Pack[] = ((packRows ?? []) as PackRow[]).map((row) => ({
    id: row.id,
    source: row.source,
    source_ref: row.source_ref,
    opened_at: row.opened_at,
    created_at: row.created_at,
    sticker_count: row.pack_stickers?.length ?? 5,
  }));

  const openedHistory: OpenedPackHistory[] = mapOpenedPackHistory(
    (openedRows ?? []) as OpenedRow[],
  );

  const available = packs.filter((p) => !p.opened_at).length;
  const opened = packs.filter((p) => p.opened_at).length;
  const totalStickers = (stickerRows ?? []).reduce(
    (sum, row) => sum + (row.quantity ?? 0),
    0,
  );

  return (
    <PacotinhosClient
      initialPacks={packs}
      openedHistory={openedHistory}
      stats={{ available, opened, totalStickers }}
      visual={visual}
    />
  );
}
